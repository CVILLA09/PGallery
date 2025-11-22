'use client';

import { useGLTF } from '@react-three/drei';
import ProjectCard from './ProjectCard';

export default function Galeria() {
    // Load the GLB model
    const { scene } = useGLTF('/assets/models/vr_art_gallery.glb');

    return (
        <group position={[0, -4, -15]}>
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
            <group position={[0, 1.5, 0]}>
                <ProjectCard position={[-2, 0, -5]} color="#ff0055" title="Project Alpha" />
                <ProjectCard position={[2, 0, -10]} color="#0055ff" title="Project Beta" />
                <ProjectCard position={[-2, 0, -15]} color="#00ff55" title="Project Gamma" />
            </group>
        </group>
    );
}

// Preload the model for smoother experience
useGLTF.preload('/assets/models/vr_art_gallery.glb');
