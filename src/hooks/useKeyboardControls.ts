import { useEffect } from 'react';

export const useKeyboardControls = (vehicleRef: any) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (vehicleRef.current) {
        switch (event.key) {
          case 'w':
            // Move vehicle forward
            vehicleRef.current.applyImpulse({ x: 0, y: 0, z: -1 });
            break;
          case 's':
            // Move vehicle backward
            vehicleRef.current.applyImpulse({ x: 0, y: 0, z: 1 });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [vehicleRef]);
};
