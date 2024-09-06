import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default function Obstacles() {
  const obstacles = useRef([]);

  useEffect(() => {
    const createObstacles = () => {
      for (let i = 0; i < 5; i++) {
        const body = new CANNON.Body({ mass: 1 });
        body.addShape(new CANNON.Box(new CANNON.Vec3(1, 1, 1)));
        body.position.set(0, 5, -(i + 1) * 15);

        // Sync obstacle mesh with physics body.
        obstacles.current.push(body);
      }
    };

    createObstacles();
  }, []);

  return (
    <>
      {obstacles.current.map((obstacle, index) => (
        <mesh key={index} position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}>
          <boxGeometry args={[2, 2, 2]} />
          <meshBasicMaterial map={new THREE.TextureLoader().load('/assets/obstacle.png')} />
        </mesh>
      ))}
    </>
  );
}
