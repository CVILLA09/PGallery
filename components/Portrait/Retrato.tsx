import { useRef, useMemo, useEffect } from 'react';
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
import { vertexShader, psychedelicFragmentShader, hallucinationFragmentShader, simulationFragmentShader } from './RetratoShader';

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
                uTime: { value: 0 }
            }
        });

        const geometry = new PlaneGeometry(2, 2);
        const mesh = new Mesh(geometry, material);
        scene.add(mesh);

        return [scene, camera, mesh, { current: t1, next: t2 }];
    }, []);

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
            uDisplacement: { value: null }, // Will be updated from FBO
            uTime: { value: 0 },
        }),
        [texture]
    );

    // Store brush UV position
    const brushUv = useRef(new Vector2(-10, -10));

    // Setup scroll-driven animations for strip width
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
        }, 0);

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
            topStripRef.current.material.uniforms.uTime.value = time;
            topStripRef.current.material.uniforms.uMouse.value.set(pointer.x, pointer.y);
        }
        if (bottomStripRef.current) {
            bottomStripRef.current.material.uniforms.uTime.value = time;
            bottomStripRef.current.material.uniforms.uMouse.value.set(pointer.x, pointer.y);
        }
        if (borderRef.current) {
            borderRef.current.material.uniforms.uTime.value = time;
            borderRef.current.material.uniforms.uMouse.value.set(pointer.x, pointer.y);
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Top Strip - Motion Graphics (Golden Ratio Height: 8 * 0.618 = 4.944) */}
            <mesh ref={topStripRef} position={[0, 8, 0]}>
                <planeGeometry args={[22, 4.944, 32, 32]} />
                <shaderMaterial
                    vertexShader={vertexShader}
                    fragmentShader={psychedelicFragmentShader}
                    uniforms={psychedelicUniforms}
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
                }}
                onPointerLeave={() => {
                    // Move brush off-screen when leaving
                    brushUv.current.set(-10, -10);
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
                    uniforms={psychedelicUniforms} // Use same uniforms as strips
                    transparent
                />
            </mesh>

            {/* Bottom Strip - Motion Graphics (Golden Ratio Height) */}
            <mesh ref={bottomStripRef} position={[0, -8, 0]}>
                <planeGeometry args={[22, 4.944, 32, 32]} />
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
