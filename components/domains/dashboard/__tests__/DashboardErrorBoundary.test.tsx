/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lucide-react icons BEFORE importing components
jest.mock('lucide-react', () => ({
  AlertCircle: ({ className }: any) => (
    <svg data-testid="alert-circle-icon" className={className} />
  ),
  RefreshCw: ({ className }: any) => (
    <svg data-testid="refresh-icon" className={className} />
  ),
  Home: ({ className }: any) => (
    <svg data-testid="home-icon" className={className} />
  ),
  Info: ({ className }: any) => (
    <svg data-testid="info-icon" className={className} />
  ),
  CheckCircle: ({ className }: any) => (
    <svg data-testid="check-circle-icon" className={className} />
  ),
  AlertTriangle: ({ className }: any) => (
    <svg data-testid="alert-triangle-icon" className={className} />
  ),
  XCircle: ({ className }: any) => (
    <svg data-testid="x-circle-icon" className={className} />
  ),
  X: ({ className }: any) => <svg data-testid="x-icon" className={className} />,
  Loader2: ({ className }: any) => (
    <svg data-testid="loader-icon" className={className} />
  ),
}));

// Mock Alert component to avoid transitive lucide-react imports
jest.mock('@/components/ui/Alert', () => ({
  Alert: ({ children, variant = 'default' }: any) => (
    <div data-testid="mock-alert" data-variant={variant}>
      {children}
    </div>
  ),
}));

// Mock UnifiedButton component to avoid transitive lucide-react imports
jest.mock('@/components/ui/UnifiedButton', () => ({
  UnifiedButton: ({ children, onClick, className, ...props }: any) => (
    <button
      data-testid={`mock-button-${children?.toString().toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Card component
jest.mock('@/components/ui/Card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="mock-card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: any) => (
    <div data-testid="mock-card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h2 data-testid="mock-card-title">{children}</h2>
  ),
  CardContent: ({ children }: any) => (
    <div data-testid="mock-card-content">{children}</div>
  ),
}));

import {
  DashboardErrorBoundary,
  withDashboardErrorBoundary,
  DashboardErrorCompact,
} from '../DashboardErrorBoundary';

// Test component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error thrown');
  }
  return <div>Normal content</div>;
}

// Test component for success case
function SafeComponent() {
  return <div data-testid="safe-component">Safe content loaded</div>;
}

describe('DashboardErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  describe('Error Catching', () => {
    it('should catch errors from children and display error UI', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      // Check for error UI elements
      expect(screen.getByText(/Bir Hata Oluştu/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Dashboard yüklenirken beklenmeyen bir hata/i)
      ).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <DashboardErrorBoundary>
          <SafeComponent />
        </DashboardErrorBoundary>
      );

      expect(screen.getByTestId('safe-component')).toBeInTheDocument();
      expect(screen.queryByText(/Bir Hata Oluştu/i)).not.toBeInTheDocument();
    });

    it('should call onError callback when error is caught', () => {
      const onError = jest.fn();

      render(
        <DashboardErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Error UI Display', () => {
    it('should display error icon', () => {
      const { container } = render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      // Check for AlertCircle icon (lucide-react)
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should display retry and home buttons', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(
        screen.getByRole('button', { name: /Tekrar Dene/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Ana Sayfaya Dön/i })
      ).toBeInTheDocument();
    });

    it('should display support link', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      const supportLink = screen.getByRole('link', {
        name: /destek ekibimizle/i,
      });
      expect(supportLink).toBeInTheDocument();
      expect(supportLink).toHaveAttribute('href', '/support');
    });
  });

  describe('Retry Functionality', () => {
    it('should reset error state when retry button is clicked', () => {
      const { rerender } = render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      // Error UI should be visible
      expect(screen.getByText(/Bir Hata Oluştu/i)).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i });
      fireEvent.click(retryButton);

      // After retry, error state is reset but component would throw again
      // In real usage, the component might not throw on second render
      rerender(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={false} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });

  describe('Development vs Production', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development mode', () => {
      process.env.NODE_ENV = 'development';

      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      // Check for error details section
      expect(screen.getByText(/Hata Detayları:/i)).toBeInTheDocument();
      expect(screen.getByText(/Test error thrown/i)).toBeInTheDocument();
    });

    it('should hide error details in production mode', () => {
      process.env.NODE_ENV = 'production';

      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      // Error details should not be visible
      expect(screen.queryByText(/Hata Detayları:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Test error thrown/i)).not.toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (
        <div data-testid="custom-fallback">Custom Error UI</div>
      );

      render(
        <DashboardErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.queryByText(/Bir Hata Oluştu/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to home page when home button is clicked', () => {
      // Save original location
      const originalLocation = window.location;

      // Mock window.location
      // @ts-expect-error - Mocking window.location for test
      delete window.location;
      window.location = { href: '' } as Location;

      render(
        <DashboardErrorBoundary>
          <ThrowError shouldThrow={true} />
        </DashboardErrorBoundary>
      );

      const homeButton = screen.getByRole('button', {
        name: /Ana Sayfaya Dön/i,
      });
      fireEvent.click(homeButton);

      expect(window.location.href).toBe('/');

      // Restore original location
      window.location = originalLocation;
    });
  });
});

describe('withDashboardErrorBoundary HOC', () => {
  it('should wrap component with error boundary', () => {
    const WrappedComponent = withDashboardErrorBoundary(SafeComponent);

    render(<WrappedComponent />);

    expect(screen.getByTestId('safe-component')).toBeInTheDocument();
  });

  it('should catch errors in wrapped component', () => {
    const WrappedComponent = withDashboardErrorBoundary(() => {
      throw new Error('HOC error test');
    });

    render(<WrappedComponent />);

    expect(screen.getByText(/Bir Hata Oluştu/i)).toBeInTheDocument();
  });

  it('should use custom fallback when provided', () => {
    const customFallback = <div data-testid="hoc-fallback">HOC Fallback</div>;
    const WrappedComponent = withDashboardErrorBoundary(() => {
      throw new Error('HOC error');
    }, customFallback);

    render(<WrappedComponent />);

    expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument();
  });

  it('should pass props to wrapped component', () => {
    interface TestProps {
      message: string;
    }

    const TestComponent = ({ message }: TestProps) => (
      <div data-testid="test-prop">{message}</div>
    );

    const WrappedComponent = withDashboardErrorBoundary(TestComponent);

    render(<WrappedComponent message="Test message" />);

    expect(screen.getByTestId('test-prop')).toHaveTextContent('Test message');
  });
});

describe('DashboardErrorCompact', () => {
  it('should render compact error display', () => {
    const error = new Error('Compact error test');

    render(<DashboardErrorCompact error={error} />);

    expect(screen.getByText(/Dashboard yüklenemedi/i)).toBeInTheDocument();
    expect(screen.getByText(/Compact error test/i)).toBeInTheDocument();
  });

  it('should display retry button when onRetry is provided', () => {
    const error = new Error('Test error');
    const onRetry = jest.fn();

    render(<DashboardErrorCompact error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /Tekrar Dene/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not display retry button when onRetry is not provided', () => {
    const error = new Error('Test error');

    render(<DashboardErrorCompact error={error} />);

    expect(
      screen.queryByRole('button', { name: /Tekrar Dene/i })
    ).not.toBeInTheDocument();
  });

  it('should display error icon', () => {
    const error = new Error('Test error');
    const { container } = render(<DashboardErrorCompact error={error} />);

    // Check for AlertCircle icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

describe('DashboardErrorBoundary Integration', () => {
  it('should match snapshot for error state', () => {
    const { container } = render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should handle multiple sequential errors', () => {
    const { rerender } = render(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    expect(screen.getByText(/Bir Hata Oluştu/i)).toBeInTheDocument();

    // Click retry
    fireEvent.click(screen.getByRole('button', { name: /Tekrar Dene/i }));

    // Component throws again
    rerender(
      <DashboardErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DashboardErrorBoundary>
    );

    // Error UI should still be present
    expect(screen.getByText(/Bir Hata Oluştu/i)).toBeInTheDocument();
  });
});
