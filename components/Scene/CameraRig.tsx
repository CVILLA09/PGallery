'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

import { useCameraStore } from '../../store/useCameraStore';

export default function CameraRig() {
    const { camera, gl } = useThree();
    const timeline = useRef<gsap.core.Timeline | null>(null);

    // Rotation state
    const rotationY = useRef(0);
    const rotationX = useRef(0); // Vertical rotation
    const isDragging = useRef(false);
    const lastMouseX = useRef(0);
    const lastMouseY = useRef(0);

    // Focus state
    const focusTarget = useCameraStore((state) => state.focusTarget);
    const setFocusTarget = useCameraStore((state) => state.setFocusTarget);

    // Handle Focus Changes
    useEffect(() => {
        if (focusTarget) {
            // Calculate target values
            let targetZ = -18; // Default for center
            let targetRotY = 0;

            if (focusTarget.type === 'side') {
                targetZ = -15; // Side cards are closer
                // If rotation[1] is positive (PI/2), it's Left Wall -> Look Left (Positive RotY)
                // If rotation[1] is negative (-PI/2), it's Right Wall -> Look Right (Negative RotY)
                targetRotY = focusTarget.rotation[1];
            } else {
                targetZ = -15; // Center Wall -> Look Forward
                targetRotY = 0;
            }

            // Animate Scroll (Z position)
            // Map Z to Scroll Progress: progress = (40 - Z) / 58
            const progress = (40 - targetZ) / 58;
            const scrollContent = document.querySelector('.scroll-content');
            if (scrollContent) {
                const scrollHeight = document.body.scrollHeight - window.innerHeight;
                const targetScroll = scrollHeight * progress;

                gsap.to(window, {
                    scrollTo: targetScroll,
                    duration: 1.5,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        // Keep rotation locked during scroll animation if needed
                    }
                });
            }

            // Animate Rotation
            gsap.to(rotationY, {
                current: targetRotY,
                duration: 1.5,
                ease: 'power2.inOut',
                onComplete: () => {
                    // Optional: Clear target so drag can resume easily?
                    // Or keep it set until user interacts?
                    // User said: "si el usuario vuelve a arrastrar la camara tenga la libertad de moverse"
                    // So we don't lock it. Just setting the ref is enough.
                }
            });

            gsap.to(rotationX, {
                current: 0, // Reset vertical look
                duration: 1.5,
                ease: 'power2.inOut'
            });
        }
    }, [focusTarget]);

    useEffect(() => {
        // Initial position - Much further back for a wide shot
        camera.position.set(0, 0, 40);
        camera.lookAt(0, 0, 0);

        // Create timeline linked to scroll
        timeline.current = gsap.timeline({
            scrollTrigger: {
                trigger: '.scroll-content', // The tall div in page.tsx
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1, // Smooth scrubbing
            },
        });

        // Animation sequence
        timeline.current
            // Move camera forward through the portrait and into the gallery
            .to(camera.position, {
                z: -18, // Adjusted to -18 to stop before the back wall (was -25)
                ease: 'none',
                duration: 1,
            })
            // Optional: Rotate or look around
            .to(camera.position, {
                y: 0, // Keep centered for now
                ease: 'none',
                duration: 0, // Parallel
            }, "<");

        return () => {
            if (timeline.current) timeline.current.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [camera]);

    // Drag Rotation Logic
    useEffect(() => {
        const canvas = gl.domElement;

        const onPointerDown = (e: PointerEvent) => {
            // Only allow drag if inside gallery (past Z = -5 approx)
            if (camera.position.z < -5) {
                isDragging.current = true;
                lastMouseX.current = e.clientX;
                lastMouseY.current = e.clientY;
                canvas.style.cursor = 'grabbing';

                // Clear focus target on interaction to allow free movement
                setFocusTarget(null);
            }
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDragging.current) return;

            // Calculate delta
            const deltaX = e.clientX - lastMouseX.current;
            const deltaY = e.clientY - lastMouseY.current;

            lastMouseX.current = e.clientX;
            lastMouseY.current = e.clientY;

            // Update rotation target (sensitivity 0.005)
            rotationY.current -= deltaX * 0.005;
            rotationX.current -= deltaY * 0.005;

            // Clamp vertical rotation to avoid flipping (approx +/- 60 degrees)
            rotationX.current = Math.max(-1.0, Math.min(1.0, rotationX.current));
        };

        const onPointerUp = () => {
            isDragging.current = false;
            canvas.style.cursor = 'auto';
        };

        canvas.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            canvas.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [gl, camera]);

    useFrame(() => {
        // Apply rotation
        // If outside gallery (Z > -5), smoothly reset rotation to 0
        if (camera.position.z > -5) {
            rotationY.current = gsap.utils.interpolate(rotationY.current, 0, 0.1);
            rotationX.current = gsap.utils.interpolate(rotationX.current, 0, 0.1);
        }

        camera.rotation.y = rotationY.current;
        camera.rotation.x = rotationX.current;
    });

    return null;
}
