import { useEffect } from 'react';
import GUI from 'lil-gui';

export default function GUIControls() {
  useEffect(() => {
    const gui = new GUI();
    const options = { enableOrbitControls: false };

    gui.add(options, 'enableOrbitControls').onChange((value) => {
      // Enable/disable OrbitControls based on the toggle
    });

    return () => gui.destroy();
  }, []);

  return null;
}
