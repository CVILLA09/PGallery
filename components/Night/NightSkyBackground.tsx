'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { useThemeMode } from '@/hooks/useThemeMode';

function MilkyWay() {
    const ref = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (ref.current) {
            // Rotate Milky Way slowly to match the sky movement (left to right)
            ref.current.rotation.y -= delta * 0.005;
        }
    });

    return (
        <group ref={ref} rotation={[0, 0, Math.PI / 4]}>
            {/* Dense star band - pushed further back */}
            <Stars radius={90} depth={20} count={3000} factor={6} saturation={0} fade speed={0.5} />

            {/* Soft luminous glow (nebula effect) - Multi-colored palette */}
            {/* Colors: #82378C, #65A653, #A69337 */}

            <Cloud
                opacity={0.15} speed={0.1} bounds={[30, 10, 10]} segments={60} volume={25}
                color="#82378C" position={[-8, 0, -10]}
            />
            <Cloud
                opacity={0.15} speed={0.1} bounds={[30, 10, 10]} segments={60} volume={25}
                color="#65A653" position={[0, 3, -12]}
            />
            <Cloud
                opacity={0.15} speed={0.1} bounds={[30, 10, 10]} segments={60} volume={25}
                color="#A69337" position={[8, -2, -11]}
            />
        </group>
    );
}

function StarField() {
    const ref = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (ref.current) {
            // Slow rotation for the night sky
            ref.current.rotation.y -= delta * 0.005; // Much slower
            ref.current.rotation.x += delta * 0.001;
        }
    });

    return (
        <group ref={ref}>
            <Stars radius={100} depth={50} count={5000} factor={6} saturation={0} fade speed={1} />
        </group>
    );
}

export default function NightSkyBackground() {
    const isDark = useThemeMode();

    return (
        <div
            className={`fixed inset-0 z-[-1] pointer-events-none w-full h-full transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}
            style={{
                background: 'linear-gradient(to bottom, #020615, #050b1a)', // Darker deep night gradient
            }}
        >
            <Canvas camera={{ position: [0, 0, 1] }}>
                {/* Lighting to make the nebula clouds visible and luminous */}
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={5} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={5} color="#3b82f6" />

                <StarField />
                <MilkyWay />
            </Canvas>
        </div>
    );
}
