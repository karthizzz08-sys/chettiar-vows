import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch React errors and prevent white blank screens
 * Provides fallback UI and error logging
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call optional onError handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Optionally reload the page
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-cream px-4">
          <div className="max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="font-display text-2xl text-maroon-deep">
                Oops! Something went wrong
              </h1>
              <p className="text-sm text-maroon/70">
                We encountered an unexpected error. Please try again or contact support.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="text-xs font-mono text-red-600 font-semibold">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="text-xs text-red-600">
                    <summary className="cursor-pointer font-semibold">Stack Trace</summary>
                    <pre className="mt-2 overflow-auto text-xs font-mono whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-xl bg-gradient-royal text-cream font-semibold hover:shadow-gold transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="flex-1 py-3 rounded-xl border-2 border-gold/30 text-maroon font-semibold hover:bg-gold/10 transition"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
