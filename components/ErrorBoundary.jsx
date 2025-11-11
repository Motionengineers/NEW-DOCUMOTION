'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--system-background)' }}
        >
          <div className="glass rounded-2xl p-8 max-w-2xl w-full text-center">
            <AlertCircle
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: 'var(--system-red)' }}
            />
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--label)' }}>
              Something went wrong
            </h1>
            <p className="text-lg mb-6" style={{ color: 'var(--secondary-label)' }}>
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary
                  className="cursor-pointer text-sm font-medium mb-2"
                  style={{ color: 'var(--label)' }}
                >
                  Error Details (Development Only)
                </summary>
                <pre
                  className="glass p-4 rounded-lg text-xs overflow-auto max-h-60"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all"
                style={{
                  backgroundColor: 'var(--system-blue)',
                  color: '#ffffff',
                }}
                onMouseEnter={e => (e.target.style.backgroundColor = 'var(--primary-hover)')}
                onMouseLeave={e => (e.target.style.backgroundColor = 'var(--system-blue)')}
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </button>

              <Link
                href="/"
                className="px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all border"
                style={{
                  backgroundColor: 'var(--secondary)',
                  color: 'var(--label)',
                  borderColor: 'var(--separator)',
                }}
                onMouseEnter={e => (e.target.style.backgroundColor = 'var(--muted)')}
                onMouseLeave={e => (e.target.style.backgroundColor = 'var(--secondary)')}
              >
                <Home className="h-5 w-5" />
                <span>Go Home</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
