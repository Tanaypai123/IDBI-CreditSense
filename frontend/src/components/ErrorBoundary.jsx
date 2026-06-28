import React, { Component } from 'react';
import { AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl space-y-4 font-inter text-xs max-w-lg mx-auto mt-12 shadow-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-sm text-rose-800 font-poppins">Something went wrong.</h3>
          </div>
          <p className="leading-relaxed">A rendering issue occurred while building the screen components. Please refresh the page or adjust settings.</p>
          {this.state.error && (
            <pre className="p-3 bg-rose-100/50 rounded border border-rose-200 text-[10px] overflow-auto font-mono max-h-32 text-rose-800">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
