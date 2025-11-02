import React, { Component } from 'react';
import { SlideContent } from './SlideContent';
import { SlideNavigation } from './SlideNavigation';
import './BannerSlider.css';

export interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  ctaText: string;
  ctaSecondary?: string;
  category: string;
  features: string[];
}

interface BannerSliderState {
  currentSlide: number;
  isLoading: boolean;
}

class BannerSlider extends Component<{}, BannerSliderState> {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      currentSlide: 0,
      isLoading: false
    };
  }

  slides: SlideData[] = [
    {
      id: 1,
      title: "Professional Tournament Tables",
      subtitle: "CHAMPIONSHIP EXPERIENCE",
      description: "Play on authentic Diamond tables used in world championships. Feel the precision of tournament-grade equipment.",
      backgroundImage: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1920&h=1080&fit=crop&crop=center",
      ctaText: "Book Tournament Table",
      ctaSecondary: "View Tables",
      category: "PREMIUM TABLES",
      features: ["Diamond Professional Tables", "Tournament Lighting", "Premium Simonis Cloth"]
    },
    {
      id: 2,
      title: "Master Your Skills",
      subtitle: "EXPERT COACHING AVAILABLE",
      description: "Learn from professional players and certified instructors. Perfect your technique with personalized training sessions.",
      backgroundImage: "https://images.unsplash.com/photo-1589759118394-f5cfe6178fd3?w=1920&h=1080&fit=crop&crop=center",
      ctaText: "Book Coaching",
      ctaSecondary: "View Instructors",
      category: "TRAINING",
      features: ["Professional Coaches", "Video Analysis", "Technique Improvement"]
    },
    {
      id: 3,
      title: "Weekly Tournaments",
      subtitle: "COMPETE FOR GLORY",
      description: "Join our competitive league with players of all skill levels. Weekly tournaments with cash prizes up to $5,000.",
      backgroundImage: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=1920&h=1080&fit=crop&crop=center",
      ctaText: "Enter Tournament",
      ctaSecondary: "View Schedule",
      category: "COMPETITIONS",
      features: ["Weekly Events", "Cash Prizes", "Skill-Based Brackets"]
    },
    {
      id: 4,
      title: "VIP Lounge Experience",
      subtitle: "LUXURY BILLIARDS CLUB",
      description: "Exclusive VIP area with premium amenities, private tables, and personalized service. Members only access.",
      backgroundImage: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1920&h=1080&fit=crop&crop=center",
      ctaText: "Join VIP Club",
      ctaSecondary: "Tour Facility",
      category: "VIP MEMBERSHIP",
      features: ["Private Tables", "Concierge Service", "Premium Bar"]
    }
  ];

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState(prevState => ({
        currentSlide: (prevState.currentSlide + 1) % this.slides.length
      }));
    }, 7000);
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  handleSlideChange = (index: number) => {
    if (index === this.state.currentSlide) return;
    
    this.setState({ isLoading: true });
    setTimeout(() => {
      this.setState({
        currentSlide: index,
        isLoading: false
      });
    }, 300);
  };

  nextSlide = () => {
    this.handleSlideChange((this.state.currentSlide + 1) % this.slides.length);
  };

  prevSlide = () => {
    this.handleSlideChange((this.state.currentSlide - 1 + this.slides.length) % this.slides.length);
  };

  render() {
    const { currentSlide, isLoading } = this.state;
    
    return (
      <div className="banner-slider">
        <div className="slides-container">
          {this.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
              style={{ backgroundImage: `url(${slide.backgroundImage})` }}
            >
              <div className="slide-overlay" />
              <div className="slide-content">
                <SlideContent 
                  slide={slide} 
                  isActive={index === currentSlide}
                />
              </div>
            </div>
          ))}
        </div>

        <SlideNavigation
          slides={this.slides}
          currentSlide={currentSlide}
          onSlideChange={this.handleSlideChange}
          onNext={this.nextSlide}
          onPrev={this.prevSlide}
        />
      </div>
    );
  }
}

export default BannerSlider;