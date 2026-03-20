'use client';

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class AccountErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || 'Something went wrong.' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[AccountErrorBoundary]', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6"
          style={{ background: '#000000', color: '#e8e8e8' }}
        >
          <div className="max-w-md text-center space-y-8">
            <div className="space-y-4">
              <h1 className="font-serif text-3xl text-white/90 tracking-tight">
                Something went wrong
              </h1>
              <p className="font-sans font-light text-sm text-white/40 leading-relaxed">
                The Vault encountered an unexpected issue. Your data is safe — reload the page to continue.
              </p>
            </div>

            {this.state.errorMessage && (
              <p className="text-[10px] tracking-[0.15em] text-white/20 font-mono break-all">
                {this.state.errorMessage}
              </p>
            )}

            <button
              onClick={this.handleReload}
              className="px-8 py-3 border rounded-sm text-xs font-medium tracking-[0.2em] uppercase text-white/80 hover:text-white hover:border-white/30 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
