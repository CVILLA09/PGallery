'use client';

import { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import { useCameraStore } from '../../store/useCameraStore';

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
    const setFocusTarget = useCameraStore((state) => state.setFocusTarget);

    useFrame(() => {
        if (meshRef.current) {
            const targetScale = hovered ? 1.05 : 1;
            meshRef.current.scale.x = MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
            meshRef.current.scale.y = MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);
            meshRef.current.scale.z = MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.1);
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation(); // Prevent click-through
        // Determine type based on rotation (approximate)
        const isSide = Math.abs(rotation[1]) > 0.1;

        // Calculate world position (simplified, assuming parent group is at [0, 1.5, 0] and gallery at [0, -4, -15])
        // Actually, we can just pass the local props and let CameraRig handle the logic, 
        // OR pass the "type" and let CameraRig decide the target.
        // Passing the card's intended "viewing" parameters is safer.

        setFocusTarget({
            position: position,
            rotation: rotation,
            type: isSide ? 'side' : 'center'
        });
    };

    return (
        <group position={position} rotation={rotation}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                onClick={handleClick}
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
