"use client";

import type { ReactNode } from "react";
import { Component } from "react";

type Props = { children: ReactNode };

type State = { hasError: boolean };

export class DeploymentErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[var(--keyra-radius-card)] border border-keyra-border bg-[var(--keyra-surface)] p-6">
          <p className="text-sm text-keyra-text-2">
            Something went wrong while rendering this section. Please refresh the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
