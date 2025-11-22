import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, Vector2 } from 'three';
import { vertexShader, psychedelicFragmentShader, hallucinationFragmentShader } from './RetratoShader';

export default function Retrato() {
    const topStripRef = useRef<any>(null);
    const middleStripRef = useRef<any>(null);
    const bottomStripRef = useRef<any>(null);

    // Load the new eyes texture
    const texture = useLoader(TextureLoader, '/assets/eyes_new.png');

    const psychedelicUniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new Vector2(0, 0) },
        }),
        []
    );

    const hallucinationUniforms = useMemo(
        () => ({
            uTexture: { value: texture },
            uTime: { value: 0 },
        }),
        [texture]
    );

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const pointer = state.pointer; // Normalized coordinates (-1 to 1)

        if (topStripRef.current) {
            topStripRef.current.material.uniforms.uTime.value = time;
            topStripRef.current.material.uniforms.uMouse.value.set(pointer.x, pointer.y);
        }
        if (middleStripRef.current) middleStripRef.current.material.uniforms.uTime.value = time;
        if (bottomStripRef.current) {
            bottomStripRef.current.material.uniforms.uTime.value = time;
            bottomStripRef.current.material.uniforms.uMouse.value.set(pointer.x, pointer.y);
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Top Strip - Motion Graphics (Taller) */}
            <mesh ref={topStripRef} position={[0, 7.5, 0]}>
                <planeGeometry args={[22, 4, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={psychedelicFragmentShader}
                    uniforms={psychedelicUniforms}
                    transparent
                />
            </mesh>

            {/* Middle Strip - Eyes with Hallucination */}
            <mesh ref={middleStripRef} position={[0, 0, 0]}>
                <planeGeometry args={[22, 8, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={hallucinationFragmentShader}
                    uniforms={hallucinationUniforms}
                    transparent
                />
            </mesh>

            {/* Bottom Strip - Motion Graphics (Taller) */}
            <mesh ref={bottomStripRef} position={[0, -7.5, 0]}>
                <planeGeometry args={[22, 4, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={psychedelicFragmentShader}
                    uniforms={psychedelicUniforms}
                    transparent
                />
            </mesh>
        </group>
    );
}
