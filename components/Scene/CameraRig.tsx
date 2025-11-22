'use client';

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CameraRig() {
    const { camera } = useThree();
    const timeline = useRef<gsap.core.Timeline | null>(null);

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
                z: -35, // Go deeper to account for new gallery position
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

    return null;
}
