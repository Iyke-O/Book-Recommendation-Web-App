import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

export default function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value || 0;

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${display >= star ? 'filled' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          disabled={readonly}
          aria-label={`${star} star`}
        >
          <FiStar fill={display >= star ? '#f59e0b' : 'none'} color={display >= star ? '#f59e0b' : '#9ca3af'} size={20} />
        </button>
      ))}
    </div>
  );
}
