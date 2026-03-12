import { useState } from 'react';

export function useLessonSlides(totalContentSlides: number) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Total slides = content slides + 2 (Hooks slide + Reflection slide)
  const totalSlides = totalContentSlides + 2;
  const isHooksSlide = currentSlide === totalSlides - 2;
  const isFinalSlide = currentSlide === totalSlides - 1;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1-indexed mapping for UI display (e.g., Step 2 of 4)
  const displayStep = currentSlide + 1;

  return {
    currentSlide,
    totalSlides,
    isHooksSlide,
    isFinalSlide,
    nextSlide,
    prevSlide,
    displayStep,
  };
}
