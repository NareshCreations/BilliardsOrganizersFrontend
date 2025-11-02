import React from 'react';
import { BaseComponentComplete } from '../../base/BaseComponent';

export interface FeaturesSectionProps {}

interface FeaturesSectionState {}

export class FeaturesSection extends BaseComponentComplete<FeaturesSectionProps, FeaturesSectionState> {
  protected getInitialState(): FeaturesSectionState {
    return {};
  }

  render(): React.ReactNode {
    return (
      <section style={{ 
        padding: '4rem 2rem', 
        background: '#f8fafc',
        color: '#1a202c'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>
            Powerful Features for Tournament Organizers
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tournament Management</h3>
              <p>Create and manage tournaments with automated bracket generation and real-time updates.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Player Management</h3>
              <p>Register players, track statistics, and manage player profiles with ease.</p>
            </div>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Live Scoring</h3>
              <p>Conduct live games with real-time scoring and instant result updates.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
