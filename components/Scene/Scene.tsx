'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Retrato from '../Portrait/Retrato';
import Galeria from '../Gallery/Galeria';
import CameraRig from './CameraRig';

export default function Scene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full"
        >
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.5} />

            <Suspense fallback={null}>
                <CameraRig />
                <Retrato />
                <Galeria />
            </Suspense>
        </Canvas>
    );
}
