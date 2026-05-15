import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] Unhandled render error:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0b11] px-4 text-white">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm text-red-200">
                Rendering error
              </div>
              <h1 className="text-3xl font-bold">Brandentify hit a frontend error</h1>
              <p className="text-white/70">
                The app failed while rendering this page, but the shell stayed alive so the screen does not blank out.
              </p>
              {this.state.error && (
                <pre className="max-h-64 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-red-200 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="rounded-lg bg-white px-4 py-2 font-medium text-black transition hover:bg-white/90"
                >
                  Reload app
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}