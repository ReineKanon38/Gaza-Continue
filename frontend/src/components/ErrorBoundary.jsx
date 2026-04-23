import { Component } from 'react';
import { Container, Button } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="text-center mt-5">
          <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>⚠️</div>
          <h2 className="mb-3">Algo salió mal</h2>
          <p className="text-muted mb-4">
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </p>
          <Button onClick={this.handleReset} variant="primary">
            Volver al inicio
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
