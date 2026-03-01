import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface Props {
    readonly children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info.componentStack);
    }

    handleReload = () => {
        globalThis.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <FiAlertTriangle className="w-8 h-8 text-red-400" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-zinc-100">Something went wrong</h1>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                An unexpected error occurred. Your files are safe — nothing was uploaded anywhere.
                            </p>
                        </div>

                        {this.state.error && (
                            <div className="px-4 py-3 rounded-lg bg-surface border border-white/[0.06] text-left">
                                <p className="text-xs font-mono text-zinc-600 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={this.handleReset}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 bg-surface border border-white/[0.08] hover:bg-surface-raised transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-950 bg-neon-cyan hover:bg-neon-cyan/90 transition-colors"
                            >
                                <FiRefreshCw className="w-3.5 h-3.5" />
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
