'use client';

import { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

interface ProjectCardProps {
    position: [number, number, number];
    rotation?: [number, number, number];
    color: string;
    title: string;
    width?: number;
    height?: number;
}

export default function ProjectCard({
    position,
    rotation = [0, 0, 0],
    color,
    title,
    width = 2,
    height = 3
}: ProjectCardProps) {
    const meshRef = useRef<any>(null);
    const [hovered, setHover] = useState(false);

    useFrame(() => {
        if (meshRef.current) {
            const targetScale = hovered ? 1.05 : 1;
            meshRef.current.scale.x = MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
            meshRef.current.scale.y = MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);
            meshRef.current.scale.z = MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.1);
        }
    });

    return (
        <group position={position} rotation={rotation}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <boxGeometry args={[width, height, 0.1]} />
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
