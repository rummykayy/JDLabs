import React, { useState, useEffect } from 'react';

interface ImageSliderProps {
  images: string[];
  interval?: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (!images || images.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
            <img
                src={image}
                alt={`Feature image ${index + 1}`}
                className="w-full h-full object-cover ken-burns"
            />
        </div>
      ))}
    </div>
  );
};

export default ImageSlider;