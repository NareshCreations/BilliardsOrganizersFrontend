import React, { Component } from 'react';

/**
 * Base Component class following OOP principles
 * Provides common functionality for all components
 */
export abstract class BaseComponent<P = {}, S = {}> extends Component<P, S> {
  /**
   * Component identifier for debugging
   */
  protected componentName: string;

  constructor(props: P) {
    super(props);
    this.componentName = this.constructor.name;
  }

  /**
   * Lifecycle method called after component mounts
   */
  componentDidMount(): void {
    this.onComponentMount();
  }

  /**
   * Lifecycle method called before component unmounts
   */
  componentWillUnmount(): void {
    this.onComponentUnmount();
  }

  /**
   * Lifecycle method called when component updates
   */
  componentDidUpdate(prevProps: P, prevState: S): void {
    this.onComponentUpdate(prevProps, prevState);
  }

  /**
   * Abstract method to be implemented by child components
   * Defines the component's render logic
   */
  abstract render(): React.ReactNode;

  /**
   * Hook for component mount logic
   * Override in child components if needed
   */
  protected onComponentMount(): void {
    // Override in child components
  }

  /**
   * Hook for component unmount logic
   * Override in child components if needed
   */
  protected onComponentUnmount(): void {
    // Override in child components
  }

  /**
   * Hook for component update logic
   * Override in child components if needed
   */
  protected onComponentUpdate(prevProps: P, prevState: S): void {
    // Override in child components
  }

  /**
   * Utility method to safely update state
   */
  protected safeSetState(updates: Partial<S>, callback?: () => void): void {
    if (this.isMounted()) {
      this.setState(updates, callback);
    }
  }

  /**
   * Check if component is mounted
   */
  private isMounted(): boolean {
    return this.state !== null;
  }

  /**
   * Get component display name for debugging
   */
  getDisplayName(): string {
    return this.componentName;
  }

  /**
   * Log component lifecycle events
   */
  protected log(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.componentName}] ${message}`, data || '');
    }
  }
}

/**
 * Base Component with Props interface
 */
export abstract class BaseComponentWithProps<P extends object = {}, S = {}> extends BaseComponent<P, S> {
  /**
   * Get props safely with type checking
   */
  protected getProps(): P {
    return this.props;
  }

  /**
   * Check if specific prop exists
   */
  protected hasProp<K extends keyof P>(key: K): boolean {
    return key in this.props;
  }

  /**
   * Get prop value with default fallback
   */
  protected getProp<K extends keyof P>(key: K, defaultValue?: P[K]): P[K] | undefined {
    return this.props[key] ?? defaultValue;
  }
}

/**
 * Base Component with State interface
 */
export abstract class BaseComponentWithState<P = {}, S extends object = {}> extends BaseComponent<P, S> {
  /**
   * Get current state safely
   */
  protected getState(): S {
    return this.state;
  }

  /**
   * Update state with validation
   */
  protected updateState(updates: Partial<S>, callback?: () => void): void {
    this.safeSetState(updates, callback);
  }

  /**
   * Reset state to initial values
   */
  protected resetState(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Get initial state - override in child components
   */
  protected getInitialState(): S {
    return {} as S;
  }
}

/**
 * Complete Base Component with both Props and State
 */
export abstract class BaseComponentComplete<P extends object = {}, S extends object = {}> 
  extends BaseComponentWithProps<P, S> {
  
  constructor(props: P) {
    super(props);
    this.state = this.getInitialState();
  }

  /**
   * Get initial state - must be implemented by child components
   */
  protected abstract getInitialState(): S;
}
