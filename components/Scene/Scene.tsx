'use client';

import { Canvas } from '@react-three/fiber';
import CameraRig from './CameraRig';
import Retrato from '../Portrait/Retrato';
import Galeria from '../Gallery/Galeria';
import { useState, useEffect } from 'react';

export default function Scene() {
    const [bgColor, setBgColor] = useState('#ffffff');

    useEffect(() => {
        // Initial check
        const updateBg = () => {
            const isDark = document.documentElement.classList.contains('dark');
            setBgColor(isDark ? '#000000' : '#ffffff');
        };

        updateBg();

        // Watch for class changes
        const observer = new MutationObserver(updateBg);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return (
        <Canvas
            camera={{ position: [0, 0, 40], fov: 50 }}
            style={{ background: bgColor, transition: 'background-color 0.3s ease' }}
        >
            <CameraRig />
            <Retrato />
            <Galeria />
            <fog attach="fog" args={[bgColor, 10, 50]} />
        </Canvas>
    );
}
