'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud, Clouds } from '@react-three/drei';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

function MovingCloud({
    position,
    speed = 0.5,
    opacity = 1,
    ySpread = 30,
    ...props
}: {
    position: [number, number, number],
    speed?: number,
    opacity?: number,
    ySpread?: number
} & React.ComponentProps<typeof Cloud>) {
    const groupRef = useRef<THREE.Group>(null);
    // Store initial X to calculate relative movement or just use absolute
    // We'll use a ref to track current X to avoid re-renders if we were using state

    useFrame((state, delta) => {
        // Clamp delta to prevent huge jumps when resuming from paused frameloop
        const safeDelta = Math.min(delta, 0.1);

        if (groupRef.current) {
            // Move along X axis
            groupRef.current.position.x += safeDelta * speed;

            // Reset position when it goes off screen to the right
            // Camera is at z=20, fov=75. At z=-10 (dist=30), visible width is ~80 units.
            // We need bounds > 40 to be off-screen. Setting to 60 for safety.
            if (groupRef.current.position.x > 60) {
                groupRef.current.position.x = -60;
                // Randomize Y position on reset for variation
                // Keep within reasonable bounds (e.g., +/- 15 units from original Y or center)
                groupRef.current.position.y = (Math.random() - 0.5) * ySpread; // Random Y between -15 and 15
                // Randomize Z slightly to avoid collisions? Maybe not needed for background.
            }
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <Cloud opacity={opacity} {...props} />
        </group>
    );
}

function CloudScene() {
    return (
        <Clouds>
            {/* Main large clouds - spread vertically */}
            <MovingCloud speed={0.4} segments={40} bounds={[10, 2, 2]} volume={10} color="white" fade={10} position={[0, 10, -5]} />
            <MovingCloud speed={0.3} seed={1} scale={2} volume={5} color="white" fade={10} position={[25, -8, -10]} />

            {/* Scattered smaller clouds for depth */}
            <MovingCloud speed={0.45} seed={2} scale={1.5} volume={8} color="white" fade={15} position={[-25, 12, -8]} />
            <MovingCloud speed={0.35} seed={4} scale={1.8} volume={12} color="white" fade={8} position={[-10, -15, -12]} />

            {/* Distant clouds - slower */}
            <MovingCloud speed={0.15} seed={5} scale={3} volume={15} color="#E0F2FE" fade={20} position={[15, 5, -15]} opacity={0.6} />

            {/* Extra clouds to fill gaps during loop */}
            <MovingCloud speed={0.4} seed={6} scale={1.5} volume={10} color="white" fade={10} position={[-45, -5, -5]} />
            <MovingCloud speed={0.25} seed={7} scale={2.5} volume={12} color="#E0F2FE" fade={18} position={[-35, 15, -12]} opacity={0.7} />
            <MovingCloud speed={0.3} seed={8} scale={2} volume={8} color="white" fade={12} position={[45, -10, -8]} />
            <MovingCloud speed={0.35} seed={9} scale={1.8} volume={9} color="white" fade={11} position={[0, -12, -9]} />
        </Clouds>
    );
}

import { useThemeMode } from '@/hooks/useThemeMode';

// ... (MovingCloud and CloudScene components remain unchanged)

export default function CloudsBackground() {
    const isDark = useThemeMode();
    const visible = !isDark;

    return (
        <div
            className="fixed inset-0 z-[-1] pointer-events-none w-full h-full transition-opacity duration-1000 ease-in-out"
            style={{
                background: 'linear-gradient(to bottom, #A9CCDD, #8DBCDC)',
                opacity: visible ? 1 : 0,
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 20], fov: 75 }}
                frameloop={visible ? 'always' : 'never'}
            >
                {/* Strong lighting to ensure clouds are white, not gray */}
                <ambientLight intensity={2.5} />
                <directionalLight position={[0, 10, 5]} intensity={1.5} color="white" />
                <CloudScene />
            </Canvas>
        </div>
    );
}
