import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';

export interface HeroSectionProps {
  onSignUp: () => void;
  onSignIn: () => void;
}

interface HeroSectionState {}

export class HeroSection extends BaseComponentComplete<HeroSectionProps, HeroSectionState> {
  protected getInitialState(): HeroSectionState {
    return {};
  }

  render(): React.ReactNode {
    return (
      <section style={{ 
        padding: '4rem 2rem', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Professional Billiards Tournament Management</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
            Organize, manage, and conduct billiards tournaments with ease
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={this.props.onSignUp}
              style={{
                padding: '1rem 2rem',
                background: '#ffffff',
                color: '#667eea',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Get Started
            </button>
            <button 
              onClick={this.props.onSignIn}
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                color: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    );
  }
}
