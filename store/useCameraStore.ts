import { create } from 'zustand';

interface CameraState {
    focusTarget: {
        position: [number, number, number]; // World position of the card
        rotation: [number, number, number]; // Rotation of the card
        type: 'center' | 'side';
    } | null;
    setFocusTarget: (target: CameraState['focusTarget']) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
    focusTarget: null,
    setFocusTarget: (target) => set({ focusTarget: target }),
}));
