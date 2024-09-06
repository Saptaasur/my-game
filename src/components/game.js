import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import GUI from 'lil-gui';

export default function Game() {
  const threeJsContainer = useRef(null);
  const keyboard = useRef({});
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0); // Initialize score state
  const [lastPosition, setLastZPosition] = useState(0);

  useEffect(() => {
    let camera, scene, renderer;
    let controls, gui;
    let cubeThree, cubeBody, planeBody;
    let world, cannonDebugger;
    let slipperyMaterial, groundMaterial;
    let obstaclesBodies = [], obstaclesMeshes = [];
    let enableFollow = true;
    let lastZPosition = 0; // Track last z position to calculate score increment

    const onKeyDown = (event) => {
      keyboard.current[event.keyCode] = true;
    };

    const onKeyUp = (event) => {
      keyboard.current[event.keyCode] = false;
    };

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 5, 10);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.outputEncoding = THREE.sRGBEncoding;

      const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820);
      scene.add(ambient);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 10, 6);
      scene.add(light);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.rotateSpeed = 1.0;
      controls.zoomSpeed = 1.2;
      controls.enablePan = false;
      controls.dampingFactor = 0.2;
      controls.minDistance = 10;
      controls.maxDistance = 500;
      controls.enabled = false;

      if (threeJsContainer.current) {
        threeJsContainer.current.appendChild(renderer.domElement);
      }

      initCannon();
      addPlane();
      addCube();
      addObstacleBody();
      addContactMaterials();
      addKeysListener();
      addGUI();

      animate();
    }

    function animate() {
      renderer.render(scene, camera);
      movePlayer();
      updateScore(); // Update the score based on distance
      checkCollisions();

      if (enableFollow) followPlayer();

      world.step(1 / 60);
      cannonDebugger.update();

      if (cubeThree && cubeBody) {
        cubeThree.position.copy(cubeBody.position);
        cubeThree.position.y = cubeBody.position.y - 1.3;
        cubeThree.quaternion.copy(cubeBody.quaternion);
      }

      for (let i = 0; i < obstaclesBodies.length; i++) {
        const obstacleBody = obstaclesBodies[i];
        const obstacleMesh = obstaclesMeshes[i];
        if (obstacleBody && obstacleMesh) {
          obstacleMesh.position.copy(obstacleBody.position);
          obstacleMesh.quaternion.copy(obstacleBody.quaternion);
        }
      }

      requestAnimationFrame(animate);
    }

    function initCannon() {
      world = new CANNON.World();
      world.gravity.set(0, -30, 0); // Increase gravity for faster falling
      cannonDebugger = new CannonDebugger(scene, world);
    }

    function addPlane() {
      groundMaterial = new CANNON.Material('ground');
      const planeShape = new CANNON.Box(new CANNON.Vec3(10, 0.01, 1000));
      planeBody = new CANNON.Body({ mass: 0, material: groundMaterial });
      planeBody.addShape(planeShape);
      planeBody.position.set(0, 0, 0);
      world.addBody(planeBody);

      const texture = new THREE.TextureLoader().load('assets/plane.png');
      const geometry = new THREE.BoxGeometry(20, 0.1, 2000);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const planeMesh = new THREE.Mesh(geometry, material);
      planeMesh.position.set(0, -0.05, 0);
      scene.add(planeMesh);
    }

    async function addCube() {
      const gltfLoader = new GLTFLoader();
      const carLoaded = await gltfLoader.loadAsync('assets/car.glb');
      cubeThree = carLoaded.scene.children[0];
      cubeThree.rotation.y = Math.PI;
      cubeThree.position.set(0, 2, -950); // Slightly forward from the start
      scene.add(cubeThree);

      addCubeBody();
    }

    function addCubeBody() {
  const cubeShape = new CANNON.Box(new CANNON.Vec3(1, 1.3, 2));
  slipperyMaterial = new CANNON.Material('slippery');
  cubeBody = new CANNON.Body({
    mass: 100,
    position: new CANNON.Vec3(0, 2, -950),
    material: slipperyMaterial,
  });
  cubeBody.addShape(cubeShape, new CANNON.Vec3(0, 0, -1));

  cubeBody.fixedRotation = true;
  cubeBody.updateMassProperties();
  cubeBody.angularDamping = 0.9;

  world.addBody(cubeBody);
}


    function addObstacleBody() {
      const spawnInterval = 200; // Time interval between spawns (in milliseconds)

      const spawnObstacle = () => {
        createRandomObstacle();
        setTimeout(spawnObstacle, spawnInterval); // Continue spawning obstacles
      };

      spawnObstacle(); // Start spawning obstacles
    }

    function createRandomObstacle() {
      const obstacleShape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      const obstacleBody = new CANNON.Body({ mass: 1 });
      obstacleBody.addShape(obstacleShape);

      const planeWidth = 20;
      const planeLength = 2000; 
      const randomX = Math.random() * planeWidth - planeWidth / 2;
      const randomZ = Math.random() * planeLength - planeLength / 2;
      const randomY = 50; 

      obstacleBody.position.set(randomX, randomY, randomZ);
      world.addBody(obstacleBody);
      obstaclesBodies.push(obstacleBody);

      const texture = new THREE.TextureLoader().load('assets/obstacle.png');
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const obstacleMesh = new THREE.Mesh(geometry, material);
      scene.add(obstacleMesh);
      obstaclesMeshes.push(obstacleMesh);
    }

    function addContactMaterials() {
      if (!groundMaterial || !slipperyMaterial) {
        console.error('Materials not initialized.');
        return;
      }

      const slipperyGround = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
        friction: 0.0,
        restitution: 0.1,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
      });

      world.addContactMaterial(slipperyGround);
    }

    function addKeysListener() {
      window.addEventListener('keydown', onKeyDown, false);
      window.addEventListener('keyup', onKeyUp, false);
    }

    function movePlayer() {
      if (!cubeBody) return;

      const speed = 100;

      const customGravity = new CANNON.Vec3(0, -20, 0); 
      cubeBody.applyForce(customGravity, cubeBody.position);

      if (keyboard.current[87]) { // Forward (W)
        cubeBody.velocity.z = speed; 
      } else if (keyboard.current[83]) { // Backward (S)
        cubeBody.velocity.z = -speed; 
      } else {
        cubeBody.velocity.z = 0;
      }

      if (keyboard.current[68]) { // Left (A)
        cubeBody.velocity.x = -speed; 
      } else if (keyboard.current[65]) { // Right (D)
        cubeBody.velocity.x = speed; 
      } else {
        cubeBody.velocity.x = 0;
      }

      if (keyboard.current[37]) { // Left arrow
        cubeBody.angularVelocity.y = 0.1;
      } else if (keyboard.current[39]) { // Right arrow
        cubeBody.angularVelocity.y = -0.1;
      } else {
        cubeBody.angularVelocity.y = 0;
      }
    }

    function followPlayer() {
      if (cubeThree && cubeThree.position) {
        const offset = 10;
        const height = 5;
    
        const carDirection = new THREE.Vector3();
        cubeThree.getWorldDirection(carDirection);
    
        camera.position.copy(cubeThree.position).addScaledVector(carDirection, -offset);
        camera.position.y += height;
        camera.lookAt(cubeThree.position);
    
        // Update the score based on forward movement only (positive Z-axis movement)
        if (!gameOver && cubeBody.velocity.z > 0) {  // Check if car is moving forward
          const zDistance = cubeThree.position.z - lastZPosition;
          if (zDistance > 0) {  // Ensure movement is positive along the Z-axis
            setScore((prevScore) => prevScore + zDistance);  // Increment score
            setLastZPosition(cubeThree.position.z);  // Update last Z position
          }
        }
      }
    }
    
    
    


    function checkCollisions() {
      if (!cubeBody || !cubeBody.position) return; // Check if cubeBody is initialized
    
      for (let i = 0; i < obstaclesBodies.length; i++) {
        const obstacleBody = obstaclesBodies[i];
        
        // Check if the obstacle body is properly initialized
        if (obstacleBody && obstacleBody.position) {
          const distance = cubeBody.position.distanceTo(obstacleBody.position);
    
          if (distance < 3) { 
            setGameOver(true);
          }
        }
      }
    }
    function handleGameOver() {
      setGameOver(true);
      alert('Game Over!');
      cubeBody.velocity.set(0, 0, 0); // Stop the car's movement
      cubeBody.angularVelocity.set(0, 0, 0); // Stop rotation
    }
    
    

    function updateScore() {
      if (!cubeBody) return;
    
      const currentPosition = cubeBody.position;
      const currentX = currentPosition.x;
      const currentY = currentPosition.y;
      const currentZ = currentPosition.z;
    
      // Calculate the distance traveled in the X and Y axes
      const deltaX = currentX - lastPosition.x;
      const deltaY = currentY - lastPosition.y;
      const deltaZ = currentZ - lastPosition.z;
    
      // Compute the distance using the Euclidean distance formula
      const distanceTraveled = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    
      if (distanceTraveled > 0) {
        setScore(prevScore => prevScore + Math.round(distanceTraveled)); // Update score
        setLastPosition({ x: currentX, y: currentY, z: currentZ }); // Update last position
      }
    }
    

    function addGUI() {
      gui = new GUI();
      gui.add({ reset: resetGame }, 'reset').name('Restart');
    }

    function resetGame() {
      window.location.reload(); 
    }

    init();

    return () => {
      gui.destroy();
      renderer.dispose();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return (
    <div ref={threeJsContainer} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', color: 'white', fontSize: '24px' }}>
      Score: {Math.floor(score)}
    </div>
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '40px',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '20px',
          borderRadius: '10px',
          overflow:'hidden'
        }}>
          Game Over!
        </div>
      )}
    </div>
  );
}
