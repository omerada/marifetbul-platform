import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationSettingsPage from '../page';

// Mock fetch globally
global.fetch = jest.fn();

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  Bell: () => <div>Bell</div>,
  Check: () => <div>Check</div>,
  X: () => <div>X</div>,
  Loader2: () => <div>Loader2</div>,
}));

// Mock Next.js components
jest.mock('next/link', () => {
  const Link = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  Link.displayName = 'Link';
  return Link;
});

describe('NotificationSettingsPage', () => {
  const API_BASE_URL = 'http://localhost:8080';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = API_BASE_URL;
  });

  const mockNotificationSettings = {
    push: true,
    email: true,
    sms: false,
    inApp: true,
    marketing: false,
    updates: true,
    reminders: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
    },
    browser: {
      enabled: true,
      proposals: 'true',
      messages: 'true',
      payments: 'true',
      orders: 'true',
      system: 'false',
    },
  };

  describe('Initial Load', () => {
    it('should show loading state initially', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<NotificationSettingsPage />);

      expect(screen.getByText(/yükleniyor/i)).toBeInTheDocument();
    });

    it('should fetch notification preferences on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/api/v1/notifications/preferences`,
          expect.objectContaining({
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });
    });

    it('should display notification settings after successful fetch', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      // Check if settings panel is rendered
      expect(screen.getByText(/bildirim ayarları/i)).toBeInTheDocument();
    });

    it('should display error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/bildirim tercihleri yüklenemedi/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/bildirim tercihleri yüklenemedi/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Settings Update', () => {
    it('should call PUT endpoint when saving settings', async () => {
      // Initial fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      // Mock save request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Find and click save button
      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      saveButton.click();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${API_BASE_URL}/api/v1/notifications/preferences`,
          expect.objectContaining({
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: expect.any(String),
          })
        );
      });
    });

    it('should show success message after successful save', async () => {
      // Initial fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      // Mock save request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      saveButton.click();

      await waitFor(() => {
        expect(
          screen.getByText(/ayarlar başarıyla kaydedildi/i)
        ).toBeInTheDocument();
      });
    });

    it('should show error message when save fails', async () => {
      // Initial fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      // Mock failed save request
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      saveButton.click();

      await waitFor(() => {
        expect(screen.getByText(/ayarlar kaydedilemedi/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Transformation', () => {
    it('should transform backend response to frontend format', async () => {
      const backendResponse = {
        push: true,
        email: false,
        sms: false,
        inApp: true,
        marketing: false,
        updates: true,
        reminders: false,
        quietHours: {
          enabled: true,
          start: '23:00',
          end: '07:00',
        },
        browser: {
          enabled: true,
          proposals: 'false',
          messages: 'true',
          payments: 'true',
          orders: 'false',
          system: 'true',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => backendResponse,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      // Verify settings are displayed (component should render with transformed data)
      expect(screen.getByText(/bildirim ayarları/i)).toBeInTheDocument();
    });

    it('should handle missing optional fields with defaults', async () => {
      const minimalResponse = {
        push: true,
        email: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => minimalResponse,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      expect(screen.getByText(/bildirim ayarları/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should render back to settings link', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      const backLink = screen.getByRole('link', { name: /ayarlara dön/i });
      expect(backLink).toHaveAttribute('href', '/dashboard/settings');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible form controls', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotificationSettings,
      });

      render(<NotificationSettingsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/yükleniyor/i)).not.toBeInTheDocument();
      });

      // All switches should be accessible
      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
    });
  });
});
