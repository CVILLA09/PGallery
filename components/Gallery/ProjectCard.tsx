'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface ProjectCardProps {
    position: [number, number, number];
    color: string;
    title: string;
}

export default function ProjectCard({ position, color, title }: ProjectCardProps) {
    const meshRef = useRef<any>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Subtle floating animation
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                scale={hovered ? 1.1 : 1}
            >
                <boxGeometry args={[2, 3, 0.1]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <Text
                position={[0, -2, 0]}
                fontSize={0.2}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {title}
            </Text>
        </group>
    );
}
