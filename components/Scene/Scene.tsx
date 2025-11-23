'use client';

import { Canvas } from '@react-three/fiber';
import CameraRig from './CameraRig';
import Retrato from '../Portrait/Retrato';
import Galeria from '../Gallery/Galeria';
import { useState, useEffect } from 'react';

export default function Scene() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Initial check
        const checkTheme = () => {
            const dark = document.documentElement.classList.contains('dark');
            setIsDark(dark);
        };

        checkTheme();

        // Watch for class changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    // Day mode: Transparent background (to show clouds), White fog (to blend with clouds)
    // Night mode: Black background, Black fog
    const bgColor = isDark ? '#000000' : 'transparent';
    const fogColor = isDark ? '#000000' : '#ffffff';

    return (
        <Canvas
            camera={{ position: [0, 0, 40], fov: 50 }}
            style={{ background: bgColor, transition: 'background-color 0.3s ease' }}
        >
            <CameraRig />
            <Retrato />
            <Galeria />
            <fog attach="fog" args={[fogColor, 10, 50]} />
        </Canvas>
    );
}
