import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Algo deu errado</h2>
            <p className="text-gray-600 mb-6">
              Desculpe pelo transtorno. Ocorreu um erro inesperado na aplicação.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              Recarregar Página
            </button>
            {this.state.error && (
              <pre className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs overflow-auto max-h-40 text-gray-500">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
