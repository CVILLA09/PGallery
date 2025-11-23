'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CameraRig() {
    const { camera, gl } = useThree();
    const timeline = useRef<gsap.core.Timeline | null>(null);

    // Rotation state
    const rotationY = useRef(0);
    const isDragging = useRef(false);
    const lastMouseX = useRef(0);

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
                canvas.style.cursor = 'grabbing';
            }
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!isDragging.current) return;

            // Calculate delta
            const deltaX = e.clientX - lastMouseX.current;
            lastMouseX.current = e.clientX;

            // Update rotation target (sensitivity 0.005)
            rotationY.current -= deltaX * 0.005;
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
        }

        camera.rotation.y = rotationY.current;
    });

    return null;
}
