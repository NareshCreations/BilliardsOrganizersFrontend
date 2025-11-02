import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { SlideData } from './BannerSlider';

interface SlideNavigationProps {
  slides: SlideData[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const SlideNavigation: React.FC<SlideNavigationProps> = ({
  slides,
  currentSlide,
  onSlideChange,
  onNext,
  onPrev,
}) => {
  return (
    <>
      {/* Arrow Navigation */}
      <button className="nav-arrow nav-prev" onClick={onPrev}>
        <ChevronLeft className="arrow-icon" />
      </button>
      
      <button className="nav-arrow nav-next" onClick={onNext}>
        <ChevronRight className="arrow-icon" />
      </button>

      {/* Slide Indicators */}
      <div className="slide-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => onSlideChange(index)}
          >
            <div className="indicator-progress">
              <div className="progress-fill" />
            </div>
            <span className="indicator-label">{slide.category}</span>
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="slide-counter">
        <span className="current">{String(currentSlide + 1).padStart(2, '0')}</span>
        <div className="divider" />
        <span className="total">{String(slides.length).padStart(2, '0')}</span>
      </div>
    </>
  );
};