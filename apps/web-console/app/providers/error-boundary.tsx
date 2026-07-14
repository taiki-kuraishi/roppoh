import { Component, type ReactNode } from "react";

// Inertia has no route-level errorElement mechanism like react-router, so
// This is a plain React error boundary wrapping the whole app in client.tsx
// (replaces apps/ura-roppoh/src/root/error-boundary.tsx's
// UseRouteError()/isRouteErrorResponse() usage).
interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = { error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  public override render(): ReactNode {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
}
