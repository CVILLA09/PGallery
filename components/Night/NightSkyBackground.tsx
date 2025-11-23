'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { useThemeMode } from '@/hooks/useThemeMode';

function MilkyWay() {
    const ref = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const safeDelta = Math.min(delta, 0.1);
        if (ref.current) {
            // Rotate Milky Way slowly to match the sky movement (left to right)
            ref.current.rotation.y -= safeDelta * 0.005;
        }
    });

    return (
        <group ref={ref} rotation={[0, 0, Math.PI / 4]}>
            {/* Dense star band - pushed further back */}
            <Stars radius={90} depth={20} count={3000} factor={6} saturation={0} fade speed={0.5} />

            {/* Soft luminous glow (nebula effect) - Subtle blended colors */}
            <Cloud
                opacity={0.15}
                speed={0.1}
                segments={20}
                bounds={[10, 2, 2]}
                color="#82378C" // Purple
                position={[0, 0, -10]}
            />
            <Cloud
                opacity={0.15}
                speed={0.1}
                segments={20}
                bounds={[10, 2, 2]}
                color="#65A653" // Green
                position={[5, 2, -12]}
            />
            <Cloud
                opacity={0.15}
                speed={0.1}
                segments={20}
                bounds={[10, 2, 2]}
                color="#A69337" // Gold
                position={[-5, -2, -12]}
            />
        </group>
    );
}

function StarField() {
    const ref = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        const safeDelta = Math.min(delta, 0.1);
        if (ref.current) {
            // Slow rotation for the night sky
            ref.current.rotation.y -= safeDelta * 0.005; // Much slower
            ref.current.rotation.x += safeDelta * 0.001;
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
    const visible = isDark;

    return (
        <div
            className="fixed inset-0 z-[-1] pointer-events-none w-full h-full transition-opacity duration-1000 ease-in-out"
            style={{
                background: 'linear-gradient(to bottom, #020615, #050b1a)', // Darker deep night gradient
                opacity: visible ? 1 : 0,
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 1] }}
                frameloop={visible ? 'always' : 'never'}
            >
                {/* Lighting to make the nebula clouds visible and luminous */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
                <pointLight position={[-10, -10, -10]} intensity={1.5} color="#3b82f6" />

                <StarField />
                <MilkyWay />
            </Canvas>
        </div>
    );
}
