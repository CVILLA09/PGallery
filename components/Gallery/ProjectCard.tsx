'use client';

import { useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3, Quaternion, Euler } from 'three';
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

        if (meshRef.current) {
            const worldPosition = new Vector3();
            const worldQuaternion = new Quaternion();
            const worldRotation = new Euler();

            meshRef.current.getWorldPosition(worldPosition);
            meshRef.current.getWorldQuaternion(worldQuaternion);
            worldRotation.setFromQuaternion(worldQuaternion);

            // Determine type based on world rotation
            // If rotation around Y is significant (approx +/- 90 deg or PI/2 = 1.57), it's a side wall
            const isSide = Math.abs(worldRotation.y) > 0.5;

            setFocusTarget({
                position: [worldPosition.x, worldPosition.y, worldPosition.z],
                rotation: [worldRotation.x, worldRotation.y, worldRotation.z],
                type: isSide ? 'side' : 'center'
            });
        }
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
