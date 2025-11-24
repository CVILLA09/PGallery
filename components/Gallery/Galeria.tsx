'use client';

import { useGLTF } from '@react-three/drei';
import ProjectCard from './ProjectCard';

export default function Galeria() {
    // Load the GLB model
    const { scene } = useGLTF('/assets/models/vr_art_gallery.glb');

    return (
        <group position={[0, -4, -15]} rotation={[0, -Math.PI * 1.5, 0]}>
            {/* Fog for depth integration - White fog to match background */}
            <fog attach="fog" args={['#ffffff', 5, 40]} />

            {/* Imported Gallery Model */}
            <primitive
                object={scene}
                scale={[1.9, 1.9, 1.9]} // Adjust scale as needed based on the model
                position={[0, 0, 0]}
            />

            {/* Lighting - The model might have baked lighting, but we add some for the cards */}
            <ambientLight intensity={0.5} />
            <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} />

            {/* Project Cards positioned within the new model corridor */}
            {/* Adjust positions based on the model's layout */}
            {/* Project Cards positioned on the walls */}
            <group position={[0, 1.5, 0]}>
                {/* Center Wall (Back) - Landscape */}
                <ProjectCard
                    position={[-0.05, 2.3, -9]}
                    rotation={[0, 0, 0]}
                    color="#ff0055"
                    title="Project Alpha"
                    width={9}
                    height={5}
                />

                {/* Left Wall - Portrait/Square */}
                <ProjectCard
                    position={[0, 2.3, 9]}
                    rotation={[0, 0, 0]}
                    color="#0055ff"
                    title="Project Beta"
                    width={9}
                    height={5}
                />

                {/* Right Wall - Portrait/Square */}
                <ProjectCard
                    position={[9, 2.3, 0.01]}
                    rotation={[0, -Math.PI / 2, 0]}
                    color="#00ff55"
                    title="Project Gamma"
                    width={9}
                    height={5.15}
                />
            </group>
        </group>
    );
}

// Preload the model for smoother experience
useGLTF.preload('/assets/models/vr_art_gallery.glb');
