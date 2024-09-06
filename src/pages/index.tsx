import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the Canvas component to disable SSR
const Game= dynamic(() => import('../components/game'), {
  ssr: false,
});

export default function Home() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Game />
      </Suspense>
    </div>
  );
}
