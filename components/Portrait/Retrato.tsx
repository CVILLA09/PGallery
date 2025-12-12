import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import {
    TextureLoader,
    Vector2,
    Scene,
    OrthographicCamera,
    PlaneGeometry,
    Mesh,
    ShaderMaterial,
    WebGLRenderTarget,
    RGBAFormat,
    FloatType,
    NearestFilter,
    ClampToEdgeWrapping
} from 'three';
import { vertexShader, psychedelicFragmentShader, hallucinationFragmentShader, simulationFragmentShader, gradientFragmentShader } from './RetratoShader';

export default function Retrato() {
    const topStripRef = useRef<any>(null);
    const middleStripRef = useRef<any>(null);
    const bottomStripRef = useRef<any>(null);
    const borderRef = useRef<any>(null);

    const { gl, size } = useThree();

    // Load the new eyes texture
    const texture = useLoader(TextureLoader, '/assets/eyes_new.png');

    // --- FBO SIMULATION SETUP ---
    const [simScene, simCamera, simMesh, targets] = useMemo(() => {
        const scene = new Scene();
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const targetSettings = {
            format: RGBAFormat,
            type: FloatType,
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
        };

        const t1 = new WebGLRenderTarget(512, 512, targetSettings);
        const t2 = new WebGLRenderTarget(512, 512, targetSettings);

        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader: simulationFragmentShader,
            uniforms: {
                uTexture: { value: null },
                uMouse: { value: new Vector2(0.5, 0.5) },
                uResolution: { value: new Vector2(512, 512) },
                uTime: { value: 0 },
                uBrushActive: { value: 0 }, // Start inactive
            }
        });

        const geometry = new PlaneGeometry(2, 2);
        const mesh = new Mesh(geometry, material);
        scene.add(mesh);

        return [scene, camera, mesh, { current: t1, next: t2 }];
    }, []);

    // Separate uniforms for each strip with vertical offsets
    // Total canvas height = 3 sections (top=2, middle/border=1, bottom=0)
    const topStripUniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new Vector2(0, 0) },
            uVerticalOffset: { value: 2.0 }, // Top section
            uTotalHeight: { value: 3.0 },
        }),
        []
    );

    const bottomStripUniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new Vector2(0, 0) },
            uVerticalOffset: { value: 0.0 }, // Bottom section
            uTotalHeight: { value: 3.0 },
        }),
        []
    );

    const borderUniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uMouse: { value: new Vector2(0, 0) },
            uVerticalOffset: { value: 1.0 }, // Middle section (behind eyes)
            uTotalHeight: { value: 3.0 },
        }),
        []
    );

    const hallucinationUniforms = useMemo(
        () => ({
            uTexture: { value: texture },
            uDisplacement: { value: null }, // Will be updated from FBO
            uTime: { value: 0 },
            uOpacity: { value: 1.0 }, // Start fully opaque
        }),
        [texture]
    );

    const gradientUniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uScroll: { value: 0 },
        }),
        []
    );

    // Store brush UV position
    const brushUv = useRef(new Vector2(-10, -10));
    const [brushActive, setBrushActive] = useState(0); // 0 = inactive, 1 = active
    const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Setup scroll-driven animations for strip width and eyes opacity
    useEffect(() => {
        if (!topStripRef.current || !bottomStripRef.current || !borderRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
            }
        });

        // Animate scale.x from 1 to 2 as we scroll/zoom in (includes border now)
        tl.to([topStripRef.current.scale, bottomStripRef.current.scale, borderRef.current.scale], {
            x: 2,
            ease: 'none',
            duration: 1, // Explicit duration to normalize timeline
        }, 0);

        // Animate uScroll uniform from 0 to 1
        // "Short lapse" transition - Extremely fast at the very end (crossing point: 90% to 98%)
        tl.to(gradientUniforms.uScroll, {
            value: 1,
            ease: 'none',
            duration: 0.08,
        }, 0.90);

        // Fade out central eyes image as we scroll forward (opacity 1.0 -> 0.05)
        // This creates the effect of "passing through" the eyes
        tl.to(hallucinationUniforms.uOpacity, {
            value: 0.05,
            ease: 'none',
            duration: 0.6, // Gradual fade over 60% of scroll progress
        }, 0.2); // Start fading at 20% scroll progress

        return () => {
            tl.kill();
        };
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const pointer = state.pointer; // Normalized coordinates (-1 to 1)

        // --- SIMULATION UPDATE ---
        // Use the local UVs from raycasting instead of global pointer
        if (simMesh.material.uniforms) {
            simMesh.material.uniforms.uTime.value = time;
            simMesh.material.uniforms.uMouse.value.copy(brushUv.current);
            simMesh.material.uniforms.uTexture.value = targets.current.texture;
            simMesh.material.uniforms.uBrushActive.value = brushActive; // Update brush active state
        }

        // Render to 'next' target
        gl.setRenderTarget(targets.next);
        gl.render(simScene, simCamera);
        gl.setRenderTarget(null);

        // Swap targets
        const temp = targets.current;
        targets.current = targets.next;
        targets.next = temp;

        // Update main shader with result
        if (middleStripRef.current) {
            middleStripRef.current.material.uniforms.uDisplacement.value = targets.current.texture;
            middleStripRef.current.material.uniforms.uTime.value = time;
        }

        // --- OTHER UNIFORMS (Keep global for strips/border as requested previously, or update if needed) ---
        if (topStripRef.current) {
            topStripUniforms.uTime.value = time;
            topStripUniforms.uMouse.value.set(pointer.x, pointer.y);
        }
        if (bottomStripRef.current) {
            bottomStripUniforms.uTime.value = time;
            bottomStripUniforms.uMouse.value.set(pointer.x, pointer.y);
        }
        if (borderRef.current) {
            borderUniforms.uTime.value = time;
            borderUniforms.uMouse.value.set(pointer.x, pointer.y);
        }

        // Update gradient shader time
        gradientUniforms.uTime.value = time;
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Top Strip - Motion Graphics (Golden Ratio Height: 8 * 0.618 = 4.944) */}
            <mesh ref={topStripRef} position={[0, 8, 0]}>
                <planeGeometry args={[22, 4.944, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={psychedelicFragmentShader}
                    uniforms={topStripUniforms}
                    transparent
                />
            </mesh>

            {/* Middle Strip - Eyes with Hallucination */}
            <mesh
                ref={middleStripRef}
                position={[0, 0, 0]}
                onPointerMove={(e) => {
                    // Update brush position with UV coordinates of the intersection
                    if (e.uv) brushUv.current.copy(e.uv);

                    // Activate brush
                    setBrushActive(1);

                    // Clear existing timer
                    if (mouseTimerRef.current) {
                        clearTimeout(mouseTimerRef.current);
                    }

                    // Set new timer to deactivate brush after 300ms of no movement
                    mouseTimerRef.current = setTimeout(() => {
                        setBrushActive(0);
                    }, 300);
                }}
                onPointerLeave={() => {
                    // Move brush off-screen when leaving
                    brushUv.current.set(-10, -10);
                    setBrushActive(0);
                    if (mouseTimerRef.current) {
                        clearTimeout(mouseTimerRef.current);
                    }
                }}
            >
                <planeGeometry args={[22, 8, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={hallucinationFragmentShader}
                    uniforms={hallucinationUniforms}
                    transparent
                />
            </mesh>

            {/* Background Rectangle - Behind central image, reveals on scroll */}
            <mesh ref={borderRef} position={[0, 0, -0.01]}>
                <planeGeometry args={[22, 8, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={psychedelicFragmentShader}
                    uniforms={borderUniforms} // Use border uniforms for middle section
                    transparent
                />
            </mesh>

            {/* Animated Gradient Screen - Fills gap between eyes and bottom strip */}
            <mesh position={[0, 0, -4.5]}>
                <planeGeometry args={[9, 5, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={gradientFragmentShader}
                    uniforms={gradientUniforms}
                />
            </mesh>

            {/* Bottom Strip - Motion Graphics (Golden Ratio Height) */}
            <mesh ref={bottomStripRef} position={[0, -8, 0]}>
                <planeGeometry args={[22, 4.944, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={psychedelicFragmentShader}
                    uniforms={bottomStripUniforms}
                    transparent
                />
            </mesh>
        </group>
    );
}
