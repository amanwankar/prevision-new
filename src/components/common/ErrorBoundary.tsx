import { Component, type ErrorInfo, type ReactNode } from 'react';
import { GlassPanel } from '../motion/GlassPanel';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PRAEVISIO ErrorBoundary caught an exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto my-8">
          <GlassPanel variant="dark" className="p-6 border-red-500/40 bg-red-950/10 space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-red-300 font-mono tracking-wider">
                {this.props.fallbackTitle || 'COMPONENT RENDER EXCEPTION'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              An unexpected component rendering error occurred. PRAEVISIO prevented the application shell from crashing.
            </p>

            {this.state.error && (
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-red-300/80 overflow-x-auto whitespace-pre-wrap break-words-safe">
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center space-x-2 transition-all active:scale-95 focus-ring"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Component State</span>
            </button>
          </GlassPanel>
        </div>
      );
    }

    return this.props.children;
  }
}
