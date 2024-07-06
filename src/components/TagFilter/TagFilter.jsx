import React, { useRef, useState, useEffect } from 'react';
import './TagFilter.css';

const TagFilter = ({ tags, selectedTags, onTagChange }) => {
  const containerRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      const { scrollLeft, clientWidth, scrollWidth } = container;
      const index = Math.floor((scrollLeft + clientWidth / 2) / clientWidth);
      setActiveDot(index % tags.length);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [tags.length]);

  const handleDotClick = (index) => {
    const container = containerRef.current;
    const offset = container.clientWidth * index;
    container.scrollTo({ left: offset, behavior: 'smooth' });
  };

  const handleScrollLeft = () => {
    const container = containerRef.current;
    container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    const container = containerRef.current;
    container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="tag-filter-container">
      <button className="scroll-button dark-arrow" onClick={handleScrollLeft}>
        &lt;
      </button>
      <div className="tag-filters" ref={containerRef}>
        {tags.map((tag, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => onTagChange(tag)}
            />
            <span>{tag}</span>
          </label>
        ))}
        {/* Duplicate tags to enable seamless scrolling */}
        {tags.map((tag, index) => (
          <label key={`duplicate-${index}`}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => onTagChange(tag)}
            />
            <span>{tag}</span>
          </label>
        ))}
      </div>
      <button className="scroll-button" onClick={handleScrollRight}>
        &gt;
      </button>
    </div>
  );
};

export default TagFilter;
