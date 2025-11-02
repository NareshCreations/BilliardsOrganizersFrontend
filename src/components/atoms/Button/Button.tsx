import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';
import styles from './Button.module.scss';

/**
 * Button component props interface
 */
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  'data-testid'?: string;
}

/**
 * Button component state interface
 */
interface ButtonState {
  isPressed: boolean;
  isFocused: boolean;
}

/**
 * Button component following OOP principles
 * Handles user interactions and visual states
 */
export class Button extends BaseComponentComplete<ButtonProps, ButtonState> {
  /**
   * Get initial state for the button
   */
  protected getInitialState(): ButtonState {
    return {
      isPressed: false,
      isFocused: false
    };
  }

  /**
   * Handle button click event
   */
  private handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (this.props.disabled || this.props.loading) {
      event.preventDefault();
      return;
    }

    this.props.onClick?.(event);
    this.log('Button clicked', { variant: this.props.variant });
  };

  /**
   * Handle mouse down event for press state
   */
  private handleMouseDown = (): void => {
    this.updateState({ isPressed: true });
  };

  /**
   * Handle mouse up event for press state
   */
  private handleMouseUp = (): void => {
    this.updateState({ isPressed: false });
  };

  /**
   * Handle focus event
   */
  private handleFocus = (): void => {
    this.updateState({ isFocused: true });
  };

  /**
   * Handle blur event
   */
  private handleBlur = (): void => {
    this.updateState({ isFocused: false });
  };

  /**
   * Get CSS classes for the button
   */
  private getButtonClasses(): string {
    const { variant = 'primary', size = 'medium', disabled, loading, fullWidth, className } = this.props;
    const { isPressed, isFocused } = this.state;

    return [
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      disabled && styles['button--disabled'],
      loading && styles['button--loading'],
      fullWidth && styles['button--full-width'],
      isPressed && styles['button--pressed'],
      isFocused && styles['button--focused'],
      className
    ].filter(Boolean).join(' ');
  };

  /**
   * Render loading spinner
   */
  private renderLoadingSpinner(): React.ReactNode {
    if (!this.props.loading) return null;

    return (
      <span className={styles.spinner} aria-hidden="true">
        <svg className={styles.spinnerIcon} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </span>
    );
  }

  /**
   * Render button content
   */
  private renderButtonContent(): React.ReactNode {
    const { children, loading } = this.props;

    return (
      <>
        {this.renderLoadingSpinner()}
        <span className={loading ? styles.contentHidden : styles.content}>
          {children}
        </span>
      </>
    );
  }

  /**
   * Render the button component
   */
  render(): React.ReactNode {
    const { disabled, loading, type = 'button', 'data-testid': testId } = this.props;

    return (
      <button
        type={type}
        className={this.getButtonClasses()}
        disabled={disabled || loading}
        onClick={this.handleClick}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        data-testid={testId}
        aria-disabled={disabled || loading}
        aria-busy={loading}
      >
        {this.renderButtonContent()}
      </button>
    );
  }
}
