import { Component } from 'react';

export class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('The explanation failed to render.', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          style={{ maxWidth: '42rem', margin: '3rem auto', padding: '0 1rem', color: '#173b35', font: '1rem/1.7 system-ui, sans-serif' }}
        >
          <h1>This explanation could not be displayed.</h1>
          <p>Your place in the story may still be available after reloading.</p>
          <a href="/">Reload the explanation</a>
        </main>
      );
    }

    return this.props.children;
  }
}
