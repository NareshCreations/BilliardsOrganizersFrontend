import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';

export interface FooterProps {}

interface FooterState {}

export class Footer extends BaseComponentComplete<FooterProps, FooterState> {
  protected getInitialState(): FooterState {
    return {};
  }

  render(): React.ReactNode {
    return (
      <footer style={{ 
        background: '#1a202c', 
        color: '#ffffff',
        padding: '3rem 2rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Billiards Organizer</h3>
            <p style={{ opacity: 0.8, marginBottom: '2rem' }}>
              Professional Tournament Management System
            </p>
          </div>
          <div style={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
            paddingTop: '2rem',
            opacity: 0.7
          }}>
            <p>&copy; 2024 Billiards Organizer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }
}