import React from "react";

/**
 * If WebGL context creation fails or R3F throws, fall back to a static hero
 * so auth still works (production-grade degradation).
 */
export class WebGLHeroErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn("[Hero WebGL]", error?.message, info?.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="fixed inset-0 z-0 min-h-[100dvh] bg-gradient-to-br from-background via-card to-primary/25"
          aria-hidden
        />
      );
    }
    return this.props.children;
  }
}
