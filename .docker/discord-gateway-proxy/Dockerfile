# syntax=docker/dockerfile:1.7

# Build context is the repository root so the single root go.mod/go.sum is available:
#   docker build -f .docker/discord-gateway-proxy/Dockerfile -t discord-gateway-proxy .
#
# Keep the builder Go version in sync with `go = "..."` in mise.toml.
FROM golang:1.26.5-bookworm AS builder

WORKDIR /src

# Download modules in a separate layer so they are cached across source changes.
COPY go.mod go.sum ./
RUN go mod download

# Only the packages this binary needs.
COPY cmd ./cmd
COPY internal ./internal

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" \
    -o /out/discord-gateway-proxy ./cmd/discord-gateway-proxy

FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=builder /out/discord-gateway-proxy /discord-gateway-proxy

ENTRYPOINT ["/discord-gateway-proxy"]
