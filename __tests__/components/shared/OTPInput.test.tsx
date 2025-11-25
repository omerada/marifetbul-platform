/**
 * OTPInput Component Tests
 * Sprint 2 - Story 2.1: Testing Suite
 *
 * Comprehensive unit tests for OTPInput component
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { OTPInput } from '@/components/shared/OTPInput';

describe('OTPInput Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    length: 6,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render correct number of input fields', () => {
      render(<OTPInput {...defaultProps} />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(6);
    });

    it('should render custom length of inputs', () => {
      render(<OTPInput {...defaultProps} length={4} />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(4);
    });

    it('should display provided value', () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const inputs = screen.getAllByRole('textbox');

      expect(inputs[0]).toHaveValue('1');
      expect(inputs[1]).toHaveValue('2');
      expect(inputs[2]).toHaveValue('3');
      expect(inputs[3]).toHaveValue('');
    });

    it('should auto-focus first input when autoFocus is true', () => {
      render(<OTPInput {...defaultProps} autoFocus />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveFocus();
    });

    it('should not auto-focus when autoFocus is false', () => {
      render(<OTPInput {...defaultProps} autoFocus={false} />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).not.toHaveFocus();
    });
  });

  describe('User Input', () => {
    it('should handle single digit input', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.type(inputs[0], '1');

      expect(onChange).toHaveBeenCalledWith('1');
    });

    it('should auto-focus next field after input', async () => {
      render(<OTPInput {...defaultProps} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.type(inputs[0], '1');

      expect(inputs[1]).toHaveFocus();
    });

    it('should not move to next field if input is not valid', async () => {
      render(<OTPInput {...defaultProps} type="numeric" />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.type(inputs[0], 'a');

      expect(inputs[0]).toHaveFocus();
    });

    it('should allow alphanumeric input when type is alphanumeric', async () => {
      const onChange = jest.fn();
      render(
        <OTPInput {...defaultProps} onChange={onChange} type="alphanumeric" />
      );
      const inputs = screen.getAllByRole('textbox');

      await userEvent.type(inputs[0], 'A');

      expect(onChange).toHaveBeenCalledWith('A');
    });

    it('should call onComplete when all fields are filled', async () => {
      const onComplete = jest.fn();
      render(<OTPInput {...defaultProps} length={4} onComplete={onComplete} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.type(inputs[0], '1');
      await userEvent.type(inputs[1], '2');
      await userEvent.type(inputs[2], '3');
      await userEvent.type(inputs[3], '4');

      expect(onComplete).toHaveBeenCalledWith('1234');
    });
  });

  describe('Paste Functionality', () => {
    it('should handle paste of full OTP code', async () => {
      const onChange = jest.fn();
      const onComplete = jest.fn();
      render(
        <OTPInput
          {...defaultProps}
          onChange={onChange}
          onComplete={onComplete}
        />
      );
      const inputs = screen.getAllByRole('textbox');

      await userEvent.click(inputs[0]);
      await userEvent.paste('123456');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('123456');
        expect(onComplete).toHaveBeenCalledWith('123456');
      });
    });

    it('should handle paste of partial code', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.click(inputs[0]);
      await userEvent.paste('123');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('123');
      });
    });

    it('should clean pasted content (remove spaces and dashes)', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.click(inputs[0]);
      await userEvent.paste('12 34-56');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('123456');
      });
    });

    it('should truncate pasted content if longer than length', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} length={4} onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.click(inputs[0]);
      await userEvent.paste('123456');

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('1234');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should move to previous field on Backspace when empty', async () => {
      render(<OTPInput {...defaultProps} value="12" />);
      const inputs = screen.getAllByRole('textbox');

      inputs[2].focus();
      await userEvent.keyboard('{Backspace}');

      expect(inputs[1]).toHaveFocus();
    });

    it('should delete current value on Backspace when not empty', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} value="123" onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      inputs[2].focus();
      await userEvent.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith('12');
    });

    it('should move to next field on ArrowRight', async () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const inputs = screen.getAllByRole('textbox');

      inputs[1].focus();
      await userEvent.keyboard('{ArrowRight}');

      expect(inputs[2]).toHaveFocus();
    });

    it('should move to previous field on ArrowLeft', async () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const inputs = screen.getAllByRole('textbox');

      inputs[2].focus();
      await userEvent.keyboard('{ArrowLeft}');

      expect(inputs[1]).toHaveFocus();
    });

    it('should move to first field on Home key', async () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const inputs = screen.getAllByRole('textbox');

      inputs[3].focus();
      await userEvent.keyboard('{Home}');

      expect(inputs[0]).toHaveFocus();
    });

    it('should move to last field on End key', async () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const inputs = screen.getAllByRole('textbox');

      inputs[0].focus();
      await userEvent.keyboard('{End}');

      expect(inputs[5]).toHaveFocus();
    });

    it('should delete current value and move to previous on Delete', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} value="123" onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      inputs[2].focus();
      await userEvent.keyboard('{Delete}');

      expect(onChange).toHaveBeenCalledWith('12');
      expect(inputs[1]).toHaveFocus();
    });
  });

  describe('States', () => {
    it('should apply error styles when error prop is true', () => {
      const { container } = render(<OTPInput {...defaultProps} error />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toHaveClass('border-red-500');
      });
    });

    it('should apply disabled state', () => {
      render(<OTPInput {...defaultProps} disabled />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });

    it('should not accept input when disabled', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} disabled onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.type(inputs[0], '1');

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      render(<OTPInput {...defaultProps} loading />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toHaveClass('animate-pulse');
      });
    });

    it('should disable input during loading', () => {
      render(<OTPInput {...defaultProps} loading />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<OTPInput {...defaultProps} />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input, index) => {
        expect(input).toHaveAttribute('aria-label', `OTP digit ${index + 1}`);
      });
    });

    it('should have inputMode numeric for numeric type', () => {
      render(<OTPInput {...defaultProps} type="numeric" />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toHaveAttribute('inputMode', 'numeric');
      });
    });

    it('should have inputMode text for alphanumeric type', () => {
      render(<OTPInput {...defaultProps} type="alphanumeric" />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toHaveAttribute('inputMode', 'text');
      });
    });

    it('should have autocomplete off', () => {
      render(<OTPInput {...defaultProps} />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toHaveAttribute('autocomplete', 'off');
      });
    });
  });

  describe('Focus Management', () => {
    it('should select all text when input receives focus', async () => {
      render(<OTPInput {...defaultProps} value="123456" />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.click(inputs[2]);

      // Input should be selected for easy replacement
      expect(inputs[2]).toHaveFocus();
    });

    it('should replace selected value on new input', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} value="123" onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.click(inputs[1]);
      await userEvent.type(inputs[1], '9');

      expect(onChange).toHaveBeenCalledWith('193');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty value prop', () => {
      render(<OTPInput {...defaultProps} value="" />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toHaveValue('');
      });
    });

    it('should handle undefined value prop', () => {
      render(<OTPInput {...defaultProps} value={undefined as any} />);
      const inputs = screen.getAllByRole('textbox');

      inputs.forEach((input) => {
        expect(input).toHaveValue('');
      });
    });

    it('should handle value longer than length', () => {
      render(<OTPInput {...defaultProps} length={4} value="123456" />);
      const inputs = screen.getAllByRole('textbox');

      expect(inputs[0]).toHaveValue('1');
      expect(inputs[1]).toHaveValue('2');
      expect(inputs[2]).toHaveValue('3');
      expect(inputs[3]).toHaveValue('4');
    });

    it('should not call onComplete with incomplete value', async () => {
      const onComplete = jest.fn();
      render(<OTPInput {...defaultProps} onComplete={onComplete} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.type(inputs[0], '1');
      await userEvent.type(inputs[1], '2');

      expect(onComplete).not.toHaveBeenCalled();
    });

    it('should handle rapid sequential input', async () => {
      const onChange = jest.fn();
      render(<OTPInput {...defaultProps} onChange={onChange} />);
      const inputs = screen.getAllByRole('textbox');

      await userEvent.type(inputs[0], '1');
      await userEvent.type(inputs[1], '2');
      await userEvent.type(inputs[2], '3');

      await waitFor(() => {
        expect(onChange).toHaveBeenLastCalledWith('123');
      });
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <OTPInput {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should apply filled state styling when value present', () => {
      render(<OTPInput {...defaultProps} value="123" />);
      const inputs = screen.getAllByRole('textbox');

      expect(inputs[0]).toHaveClass('border-blue-500');
      expect(inputs[1]).toHaveClass('border-blue-500');
      expect(inputs[2]).toHaveClass('border-blue-500');
      expect(inputs[3]).not.toHaveClass('border-blue-500');
    });
  });
});
