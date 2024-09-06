import { useEffect } from 'react';

export default function Controls({ onMove }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'w') onMove('forward');
      if (event.key === 's') onMove('backward');
      if (event.key === 'a') onMove('left');
      if (event.key === 'd') onMove('right');
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove]);

  return null;
}
