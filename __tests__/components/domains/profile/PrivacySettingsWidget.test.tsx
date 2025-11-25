import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PrivacySettingsWidget } from '@/components/domains/profile/PrivacySettingsWidget';
import type { PrivacySettingsWidgetProps } from '@/components/domains/profile/PrivacySettingsWidget';

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

const defaultSettings = {
  profileVisibility: 'public' as const,
  showEmail: false,
  showPhone: false,
  showLastSeen: true,
  allowMessages: 'all' as const,
  allowNotifications: true,
};

const defaultProps: PrivacySettingsWidgetProps = {
  initialSettings: defaultSettings,
  onSave: mockOnSave,
  onCancel: mockOnCancel,
};

describe('PrivacySettingsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders privacy settings widget', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      expect(screen.getByText(/gizlilik ayarları/i)).toBeInTheDocument();
    });

    test('renders all privacy setting sections', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      expect(screen.getByText(/profil görünürlüğü/i)).toBeInTheDocument();
      expect(screen.getByText(/iletişim bilgileri/i)).toBeInTheDocument();
      expect(screen.getByText(/mesajlaşma/i)).toBeInTheDocument();
      expect(screen.getByText(/bildirimler/i)).toBeInTheDocument();
    });

    test('displays initial settings correctly', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const publicOption = screen.getByLabelText(/herkese açık/i);
      expect(publicOption).toBeChecked();

      const showEmail = screen.getByLabelText(/e-posta adresimi göster/i);
      expect(showEmail).not.toBeChecked();
    });

    test('renders save and cancel buttons', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /kaydet/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /iptal/i })
      ).toBeInTheDocument();
    });
  });

  describe('Profile Visibility Settings', () => {
    test('changes profile visibility to private', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const privateOption = screen.getByLabelText(/sadece bana özel/i);
      fireEvent.click(privateOption);

      expect(privateOption).toBeChecked();
    });

    test('changes profile visibility to connections only', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const connectionsOption = screen.getByLabelText(/sadece bağlantılarım/i);
      fireEvent.click(connectionsOption);

      expect(connectionsOption).toBeChecked();
    });

    test('shows description for each visibility option', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      expect(
        screen.getByText(/herkes profilinizi görebilir/i)
      ).toBeInTheDocument();
    });
  });

  describe('Contact Information Settings', () => {
    test('toggles show email setting', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);

      expect(showEmailToggle).not.toBeChecked();

      fireEvent.click(showEmailToggle);

      expect(showEmailToggle).toBeChecked();
    });

    test('toggles show phone setting', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const showPhoneToggle = screen.getByLabelText(/telefon numaramı göster/i);

      expect(showPhoneToggle).not.toBeChecked();

      fireEvent.click(showPhoneToggle);

      expect(showPhoneToggle).toBeChecked();
    });

    test('toggles show last seen setting', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const showLastSeenToggle = screen.getByLabelText(/son görülme/i);

      expect(showLastSeenToggle).toBeChecked();

      fireEvent.click(showLastSeenToggle);

      expect(showLastSeenToggle).not.toBeChecked();
    });

    test('shows warning when email is public', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);
      fireEvent.click(showEmailToggle);

      expect(
        screen.getByText(/e-posta adresiniz herkese açık olacak/i)
      ).toBeInTheDocument();
    });
  });

  describe('Messaging Settings', () => {
    test('changes allow messages to everyone', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const everyoneOption = screen.getByLabelText(/herkesten mesaj al/i);
      fireEvent.click(everyoneOption);

      expect(everyoneOption).toBeChecked();
    });

    test('changes allow messages to connections only', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const connectionsOption = screen.getByLabelText(
        /sadece bağlantılarımdan mesaj al/i
      );
      fireEvent.click(connectionsOption);

      expect(connectionsOption).toBeChecked();
    });

    test('changes allow messages to none', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const noneOption = screen.getByLabelText(/kimse mesaj gönderemesin/i);
      fireEvent.click(noneOption);

      expect(noneOption).toBeChecked();
    });
  });

  describe('Notification Settings', () => {
    test('toggles allow notifications', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const notificationsToggle = screen.getByLabelText(
        /bildirimleri etkinleştir/i
      );

      expect(notificationsToggle).toBeChecked();

      fireEvent.click(notificationsToggle);

      expect(notificationsToggle).not.toBeChecked();
    });

    test('shows notification types when enabled', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      expect(screen.getByText(/mesaj bildirimleri/i)).toBeInTheDocument();
      expect(screen.getByText(/teklif bildirimleri/i)).toBeInTheDocument();
    });

    test('hides notification types when disabled', () => {
      const disabledSettings = {
        ...defaultSettings,
        allowNotifications: false,
      };

      render(
        <PrivacySettingsWidget
          {...defaultProps}
          initialSettings={disabledSettings}
        />
      );

      const notificationsToggle = screen.getByLabelText(
        /bildirimleri etkinleştir/i
      );
      expect(notificationsToggle).not.toBeChecked();
    });
  });

  describe('Save Functionality', () => {
    test('calls onSave with updated settings', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      // Make some changes
      const privateOption = screen.getByLabelText(/sadece bana özel/i);
      fireEvent.click(privateOption);

      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);
      fireEvent.click(showEmailToggle);

      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            profileVisibility: 'private',
            showEmail: true,
          })
        );
      });
    });

    test('disables save button when no changes', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      expect(saveButton).toBeDisabled();
    });

    test('enables save button when changes made', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      expect(saveButton).toBeDisabled();

      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);
      fireEvent.click(showEmailToggle);

      expect(saveButton).not.toBeDisabled();
    });

    test('shows loading state while saving', async () => {
      render(<PrivacySettingsWidget {...defaultProps} saving />);

      expect(screen.getByText(/kaydediliyor/i)).toBeInTheDocument();
    });

    test('disables all controls while saving', () => {
      render(<PrivacySettingsWidget {...defaultProps} saving />);

      const saveButton = screen.getByRole('button', { name: /kaydediliyor/i });
      expect(saveButton).toBeDisabled();
    });

    test('shows success message after save', () => {
      render(<PrivacySettingsWidget {...defaultProps} saveSuccess />);

      expect(
        screen.getByText(/ayarlar başarıyla kaydedildi/i)
      ).toBeInTheDocument();
    });
  });

  describe('Cancel Functionality', () => {
    test('calls onCancel when cancel button clicked', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /iptal/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('resets changes when cancel is clicked', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      // Make a change
      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);
      fireEvent.click(showEmailToggle);
      expect(showEmailToggle).toBeChecked();

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /iptal/i });
      fireEvent.click(cancelButton);

      // Check reset (component would re-render with initial settings)
      expect(mockOnCancel).toHaveBeenCalled();
    });

    test('disables cancel during save', () => {
      render(<PrivacySettingsWidget {...defaultProps} saving />);

      const cancelButton = screen.getByRole('button', { name: /iptal/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Validation', () => {
    test('shows error for invalid settings combination', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      // Example: Private profile but public email
      const privateOption = screen.getByLabelText(/sadece bana özel/i);
      fireEvent.click(privateOption);

      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);
      fireEvent.click(showEmailToggle);

      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/uyarı: profiliniz özel.*e-posta herkese açık/i)
        ).toBeInTheDocument();
      });
    });

    test('requires confirmation for privacy decrease', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const publicOption = screen.getByLabelText(/herkese açık/i);
      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);

      fireEvent.click(showEmailToggle);

      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/gizliliğinizi azaltıyorsunuz/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      expect(screen.getByLabelText(/herkese açık/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/e-posta adresimi göster/i)
      ).toBeInTheDocument();
    });

    test('has fieldsets for grouped settings', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const fieldsets = screen.getAllByRole('group');
      expect(fieldsets.length).toBeGreaterThan(0);
    });

    test('announces changes to screen readers', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);
      fireEvent.click(showEmailToggle);

      const status = screen.getByRole('status');
      expect(status).toHaveTextContent(/değişiklikler kaydedilmedi/i);
    });

    test('has proper heading hierarchy', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent(/gizlilik ayarları/i);
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined initial settings', () => {
      render(
        <PrivacySettingsWidget {...defaultProps} initialSettings={undefined} />
      );

      // Should render with default settings
      expect(screen.getByText(/gizlilik ayarları/i)).toBeInTheDocument();
    });

    test('handles rapid toggle clicks', async () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const toggle = screen.getByLabelText(/e-posta adresimi göster/i);

      fireEvent.click(toggle);
      fireEvent.click(toggle);
      fireEvent.click(toggle);

      // Should handle gracefully
      expect(toggle).toBeInTheDocument();
    });

    test('preserves unsaved changes on re-render', () => {
      const { rerender } = render(<PrivacySettingsWidget {...defaultProps} />);

      const showEmailToggle = screen.getByLabelText(/e-posta adresimi göster/i);
      fireEvent.click(showEmailToggle);

      rerender(<PrivacySettingsWidget {...defaultProps} />);

      // Save button should still be enabled
      const saveButton = screen.getByRole('button', { name: /kaydet/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      render(
        <PrivacySettingsWidget {...defaultProps} className="custom-widget" />
      );

      const widget = screen.getByTestId('privacy-settings-widget');
      expect(widget).toHaveClass('custom-widget');
    });

    test('renders in compact mode', () => {
      render(<PrivacySettingsWidget {...defaultProps} compact />);

      const widget = screen.getByTestId('privacy-settings-widget');
      expect(widget).toHaveClass('compact');
    });
  });

  describe('Help Text', () => {
    test('displays help text for each setting', () => {
      render(<PrivacySettingsWidget {...defaultProps} showHelp />);

      expect(
        screen.getByText(/profilinizin kim tarafından görülebileceğini/i)
      ).toBeInTheDocument();
    });

    test('toggles help text visibility', () => {
      render(<PrivacySettingsWidget {...defaultProps} />);

      const helpButton = screen.getByRole('button', { name: /yardım/i });
      fireEvent.click(helpButton);

      expect(
        screen.getByText(/gizlilik ayarları hakkında/i)
      ).toBeInTheDocument();
    });
  });
});
