import React from 'react';
import { ArrowRight, Star, Award, Clock } from 'lucide-react';
import { SlideData } from './BannerSlider';

interface SlideContentProps {
  slide: SlideData;
  isActive: boolean;
}

export const SlideContent: React.FC<SlideContentProps> = ({ slide, isActive }) => {
  return (
    <div className="container">
      <div className="content-wrapper">
        {/* Category Badge */}
        <div className={`category-badge ${isActive ? 'animate' : ''}`}>
          <Star className="icon" />
          {slide.category}
        </div>

        {/* Subtitle */}
        <div className={`subtitle ${isActive ? 'animate' : ''}`}>
          {slide.subtitle}
        </div>

        {/* Main Title */}
        <h1 className={`main-title ${isActive ? 'animate' : ''}`}>
          {slide.title}
        </h1>

        {/* Description */}
        <p className={`description ${isActive ? 'animate' : ''}`}>
          {slide.description}
        </p>

        {/* Features List */}
        <div className={`features-list ${isActive ? 'animate' : ''}`}>
          {slide.features.map((feature, index) => (
            <div key={index} className="feature-item">
              <Award className="feature-icon" />
              {feature}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className={`action-buttons ${isActive ? 'animate' : ''}`}>
          <button className="cta-primary">
            {slide.ctaText}
            <ArrowRight className="button-icon" />
          </button>
          
          {slide.ctaSecondary && (
            <button className="cta-secondary">
              <Clock className="button-icon" />
              {slide.ctaSecondary}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};