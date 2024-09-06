import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as CANNON from 'cannon-es';

export default function Player() {
  const ref = useRef();
  const { scene } = useGLTF('/assets/car.glb');

  useEffect(() => {
    const shape = new CANNON.Box(new CANNON.Vec3(1, 1.3, 2));
    const body = new CANNON.Body({ mass: 100 });
    body.addShape(shape);
    body.position.set(0, 2, 0);
    body.linearDamping = 0.5;

    // Add body to physics world here.
    // ...

    const updatePosition = () => {
      if (ref.current) {
        ref.current.position.copy(body.position);
        ref.current.quaternion.copy(body.quaternion);
      }
    };

    // Sync with the physics engine.
    return () => {
      updatePosition();
    };
  }, []);

  return <primitive ref={ref} object={scene} />;
}
