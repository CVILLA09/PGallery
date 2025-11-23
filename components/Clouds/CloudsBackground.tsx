'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, Clouds } from '@react-three/drei';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

function CloudScene() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Gentle wind movement
            // Rotating slowly gives a nice parallax effect for background clouds
            groupRef.current.rotation.y += delta * 0.05;
            // Add a slight floating bob
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            <Clouds material={THREE.MeshBasicMaterial}>
                {/* Main large clouds - pushed back */}
                <Cloud segments={40} bounds={[10, 2, 2]} volume={10} color="white" fade={10} position={[0, 0, -5]} />
                <Cloud seed={1} scale={2} volume={5} color="white" fade={10} position={[8, 0, -10]} />

                {/* Scattered smaller clouds for depth - fewer and further */}
                <Cloud seed={2} scale={1.5} volume={8} color="white" fade={15} position={[-10, 2, -8]} />
                {/* Removed the closest cloud (seed 3) to clear up the view */}
                <Cloud seed={4} scale={1.8} volume={12} color="white" fade={8} position={[-6, -2, -12]} />

                {/* Distant clouds */}
                <Cloud seed={5} scale={3} volume={15} color="#E0F2FE" fade={20} position={[0, 5, -15]} opacity={0.6} />
            </Clouds>
        </group>
    );
}

export default function CloudsBackground() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark');
            // Visible only in Day mode (not dark)
            setVisible(!isDark);
        };

        checkTheme();

        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[-1] pointer-events-none w-full h-full transition-colors duration-500"
            style={{ background: 'linear-gradient(to bottom, #A9CCDD, #8DBCDC)' }}
        >
            <Canvas camera={{ position: [0, 0, 20], fov: 75 }}>
                <ambientLight intensity={0.8} />
                <CloudScene />
            </Canvas>
        </div>
    );
}
