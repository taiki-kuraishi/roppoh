// Package telemetry configures the OpenTelemetry logging, tracing and metrics
// pipelines for discord-gateway-proxy and exposes logging through a standard
// slog.Logger.
package telemetry

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"go.opentelemetry.io/contrib/bridges/otelslog"
	"go.opentelemetry.io/contrib/exporters/autoexport"
	"go.opentelemetry.io/contrib/instrumentation/runtime"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdoutlog"
	"go.opentelemetry.io/otel/propagation"
	sdklog "go.opentelemetry.io/otel/sdk/log"
	sdkmetric "go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.41.0"
)

const (
	// serviceName labels every signal's resource so logs, traces and metrics can
	// be correlated in the Grafana stack.
	serviceName = "discord-gateway-proxy"
	// scopeName is the instrumentation scope reported on emitted log records.
	scopeName = "github.com/tsar-org/roppoh/cmd/discord-gateway-proxy"
)

// Setup initializes the OpenTelemetry logging, tracing and metrics pipelines,
// installs the global TracerProvider/MeterProvider and propagators, and returns
// an slog.Logger backed by the logging pipeline together with a shutdown func.
//
// Traces and metrics are exported via OTLP only when configured through the
// standard OTEL_* environment variables (e.g. OTEL_TRACES_EXPORTER=otlp); when
// unset they fall back to no-op so local runs without a collector stay silent.
// Logs are always written as JSON to stdout, where the cluster log collector
// tails them.
//
// The returned shutdown function flushes and stops every provider and must be
// called before the process exits, otherwise batched records may be lost.
func Setup(ctx context.Context) (*slog.Logger, func(context.Context) error, error) {
	res, err := newResource()
	if err != nil {
		return nil, nil, err
	}

	logger, shutdownLogs, err := setupLogs(res)
	if err != nil {
		return nil, nil, err
	}

	shutdownTraces, err := setupTraces(ctx, res)
	if err != nil {
		return nil, nil, errors.Join(err, shutdownLogs(ctx))
	}

	shutdownMetrics, err := setupMetrics(ctx, res)
	if err != nil {
		return nil, nil, errors.Join(err, shutdownTraces(ctx), shutdownLogs(ctx))
	}

	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	shutdown := func(ctx context.Context) error {
		return errors.Join(shutdownMetrics(ctx), shutdownTraces(ctx), shutdownLogs(ctx))
	}

	return logger, shutdown, nil
}

// newResource builds the resource shared by all signals. semconv is pinned to
// the version resource.Default() uses so resource.Merge does not fail on a
// schema URL mismatch.
func newResource() (*resource.Resource, error) {
	res, err := resource.Merge(resource.Default(), resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceName(serviceName),
	))
	if err != nil {
		return nil, fmt.Errorf("build resource: %w", err)
	}

	return res, nil
}

// setupLogs wires an stdout log exporter into a LoggerProvider and bridges it to
// slog via otelslog.
func setupLogs(res *resource.Resource) (*slog.Logger, func(context.Context) error, error) {
	exporter, err := stdoutlog.New()
	if err != nil {
		return nil, nil, fmt.Errorf("create stdoutlog exporter: %w", err)
	}

	provider := sdklog.NewLoggerProvider(
		sdklog.WithProcessor(sdklog.NewBatchProcessor(exporter)),
		sdklog.WithResource(res),
	)

	logger := slog.New(otelslog.NewHandler(scopeName, otelslog.WithLoggerProvider(provider)))

	return logger, provider.Shutdown, nil
}

// setupTraces installs a TracerProvider whose exporter is selected from the
// OTEL_* environment, falling back to a no-op exporter when tracing is unset.
func setupTraces(ctx context.Context, res *resource.Resource) (func(context.Context) error, error) {
	exporter, err := autoexport.NewSpanExporter(ctx, autoexport.WithFallbackSpanExporter(
		func(context.Context) (sdktrace.SpanExporter, error) { return noopSpanExporter{}, nil },
	))
	if err != nil {
		return nil, fmt.Errorf("create span exporter: %w", err)
	}

	provider := sdktrace.NewTracerProvider(
		sdktrace.WithResource(res),
		sdktrace.WithBatcher(exporter),
	)
	otel.SetTracerProvider(provider)

	return provider.Shutdown, nil
}

// setupMetrics installs a MeterProvider whose reader is selected from the OTEL_*
// environment, falling back to a never-collected manual reader when metrics are
// unset, and registers Go runtime metrics.
func setupMetrics(ctx context.Context, res *resource.Resource) (func(context.Context) error, error) {
	reader, err := autoexport.NewMetricReader(ctx, autoexport.WithFallbackMetricReader(
		func(context.Context) (sdkmetric.Reader, error) { return sdkmetric.NewManualReader(), nil },
	))
	if err != nil {
		return nil, fmt.Errorf("create metric reader: %w", err)
	}

	provider := sdkmetric.NewMeterProvider(
		sdkmetric.WithResource(res),
		sdkmetric.WithReader(reader),
	)
	otel.SetMeterProvider(provider)

	if err := runtime.Start(runtime.WithMeterProvider(provider)); err != nil {
		return nil, errors.Join(fmt.Errorf("start runtime metrics: %w", err), provider.Shutdown(ctx))
	}

	return provider.Shutdown, nil
}

// noopSpanExporter is the fallback span exporter used when tracing is not
// configured via the OTEL_* environment variables; it discards all spans.
type noopSpanExporter struct{}

func (noopSpanExporter) ExportSpans(context.Context, []sdktrace.ReadOnlySpan) error { return nil }

func (noopSpanExporter) Shutdown(context.Context) error { return nil }
