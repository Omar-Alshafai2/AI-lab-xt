import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackView?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AI Lab Uncaught Error:', error, errorInfo);
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[#09090B]">
          <div className="max-w-md w-full p-6 rounded-xl bg-[#111113] border border-red-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-[#FAFAFA]">Lab Module Runtime Alert</h3>
                <p className="text-[11px] font-mono text-[#A1A1AA]">Component error caught safely</p>
              </div>
            </div>

            <div className="p-3 rounded bg-[#18181B] border border-[#27272A] text-xs font-mono text-red-300 break-words whitespace-pre-wrap max-h-40 overflow-y-auto">
              {this.state.error?.message || 'An unexpected error occurred in this view.'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.reset}
                className="flex-1 py-2 px-3 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Module
              </button>
              {this.props.fallbackView && (
                <button
                  onClick={() => {
                    this.reset();
                    this.props.fallbackView?.();
                  }}
                  className="py-2 px-3 rounded bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-mono text-[#FAFAFA] flex items-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
