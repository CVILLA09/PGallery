'use client';

import { useGLTF } from '@react-three/drei';
import ProjectCard from './ProjectCard';
import { useEffect } from 'react';
import * as THREE from 'three';

interface GaleriaProps {
    wallColor?: string;    // Hex color for the walls, e.g., "#ff0000" for red
    ceilingColor?: string; // Hex color for the ceiling/techo
    floorColor?: string;   // Hex color for the floor/suelo
}

export default function Galeria({
    wallColor = '#c8c9d0',
    ceilingColor = '#ffffff',
    floorColor = '#2a2a2a'
}: GaleriaProps) {
    // Load the GLB model
    const { scene } = useGLTF('/assets/models/vr_art_gallery.glb');

    // Generar texturas procedurales
    const createNoiseTexture = (width: number, height: number, intensity: number, baseColor: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Color base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, width, height);

        // Agregar ruido para textura
        const imageData = ctx.getImageData(0, 0, width, height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * intensity;
            imageData.data[i] += noise;     // R
            imageData.data[i + 1] += noise; // G
            imageData.data[i + 2] += noise; // B
        }
        ctx.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    };

    // Generar textura de MADERA con vetas
    const createWoodTexture = (width: number, height: number, baseColor: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Convertir color hex a RGB
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Dibujar tablones de madera
        const plankHeight = height / 8; // 8 tablones
        for (let i = 0; i < 8; i++) {
            // Variación de color por tablón
            const colorVar = (Math.random() - 0.5) * 30;
            ctx.fillStyle = `rgb(${r + colorVar}, ${g + colorVar}, ${b + colorVar})`;
            ctx.fillRect(0, i * plankHeight, width, plankHeight);

            // Vetas de madera (líneas horizontales onduladas)
            for (let y = 0; y < plankHeight; y += 2) {
                const actualY = i * plankHeight + y;
                for (let x = 0; x < width; x++) {
                    const grain = Math.sin(x * 0.1 + actualY * 0.05) * 15;
                    const darkening = (Math.random() - 0.5) * 20;
                    const grainColor = `rgb(${r + grain + darkening}, ${g + grain + darkening}, ${b + grain + darkening})`;
                    ctx.fillStyle = grainColor;
                    ctx.fillRect(x, actualY, 1, 1);
                }
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    };

    // Mapeo específico por mesh - CON TEXTURAS PROCEDURALES (CORREGIDO)
    useEffect(() => {
        if (scene) {
            console.log('🎨 Aplicando materiales CORREGIDOS con texturas');

            // Mapeo CORREGIDO según identificación visual
            const meshMaterialMap: { [key: string]: { color: string, type: 'wall' | 'ceiling' | 'floor' } } = {
                'Object_4': { color: wallColor, type: 'wall' },      // Paredes
                'Object_5': { color: floorColor, type: 'floor' },    // SUELO (era el verde)
                'Object_7': { color: ceilingColor, type: 'ceiling' }, // Techo
                // Object_6 no se usa (no visible)
            };

            scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const materialConfig = meshMaterialMap[child.name];

                    if (materialConfig) {
                        console.log(`🎨 Aplicando textura ${materialConfig.type} a "${child.name}"`);

                        const applyMaterialWithTexture = (mat: any) => {
                            // Limpiar texturas antiguas
                            mat.map = null;
                            mat.emissiveMap = null;
                            mat.lightMap = null;
                            mat.vertexColors = false;

                            // Aplicar color base
                            mat.color.set(materialConfig.color);

                            // Crear y aplicar textura según el tipo
                            if (materialConfig.type === 'floor') {
                                // SUELO: Textura de MADERA con vetas
                                const woodTexture = createWoodTexture(512, 512, materialConfig.color);
                                woodTexture.repeat.set(3, 3);
                                mat.map = woodTexture;
                                mat.roughness = 0.8;
                            } else {
                                // PAREDES/TECHO: Textura de tablaroca
                                const drywallTexture = createNoiseTexture(512, 512, 30, materialConfig.color);
                                drywallTexture.repeat.set(4, 4);
                                mat.map = drywallTexture;
                                mat.roughness = 0.85;
                            }

                            // Emissive sutil
                            mat.emissive = new THREE.Color(materialConfig.color);
                            mat.emissiveIntensity = 0.1;

                            mat.needsUpdate = true;
                            console.log(`    ✅ Textura ${materialConfig.type} aplicada`);
                        };

                        if (Array.isArray(child.material)) {
                            child.material.forEach(applyMaterialWithTexture);
                        } else if (child.material) {
                            applyMaterialWithTexture(child.material);
                        }
                    }
                }
            });

            console.log('✅ Texturas procedurales aplicadas');
        }
    }, [scene, wallColor, ceilingColor, floorColor]);

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

            {/* Improved Lighting for bright gallery aesthetic */}
            <ambientLight intensity={1.2} />
            <spotLight position={[0, 10, 0]} intensity={2} angle={0.5} penumbra={1} />
            <directionalLight position={[0, 15, 5]} intensity={0.8} color="#ffffff" />

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
