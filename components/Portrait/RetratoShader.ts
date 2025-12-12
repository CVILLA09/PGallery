// --- SHARED VERTEX SHADER ---
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// --- PSYCHEDELIC MOTION GRAPHICS SHADER (Top/Bottom Strips) ---
export const psychedelicFragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uVerticalOffset; // Offset for this strip in the continuous canvas (0.0 to 1.0)
  uniform float uTotalHeight; // Total normalized height of the entire canvas
  varying vec2 vUv;

  // Function to convert hex to vec3 (approximate manual conversion for efficiency)
  // Palette 1
  vec3 col1 = vec3(0.651, 0.141, 0.329); // #A62454
  vec3 col2 = vec3(0.510, 0.216, 0.549); // #82378C
  vec3 col3 = vec3(0.396, 0.651, 0.325); // #65A653
  vec3 col4 = vec3(0.651, 0.576, 0.216); // #A69337
  vec3 col5 = vec3(0.651, 0.173, 0.129); // #A62C21

  // Palette 2
  vec3 col6 = vec3(0.651, 0.427, 0.486); // #A66D7C
  vec3 col7 = vec3(0.204, 0.090, 0.451); // #341773
  vec3 col8 = vec3(0.522, 0.549, 0.290); // #858C4A
  vec3 col9 = vec3(0.949, 0.949, 0.949); // #F2F2F2
  vec3 col10 = vec3(0.051, 0.051, 0.051); // #0D0D0D

  void main() {
    // Map local UV to the continuous canvas position
    // Each strip shows only its portion of the total vertical space
    vec2 uv = vUv;
    uv.y = (uv.y + uVerticalOffset) / uTotalHeight;
    
    // Global Interaction - ULTRA SENSITIVE
    // Amplify mouse effect significantly to catch slow and fast movements
    vec2 mouseInfluence = uMouse * 10.0; // Increased from 2.0 to 10.0
    
    // Create organic, lava-lamp-like distortion
    // The waves now react to the mouse position globally with high sensitivity
    float waveX = sin(uv.y * 5.0 + uTime + mouseInfluence.x) * 0.2; // Stronger distortion (0.2)
    float waveY = cos(uv.x * 5.0 + uTime + mouseInfluence.y) * 0.2;
    
    uv.x += waveX;
    uv.y += waveY;
    
    // Dynamic pattern generation with global mouse influence
    float p1 = sin(uv.x * 3.0 + uTime + mouseInfluence.x);
    float p2 = cos(uv.y * 3.0 - uTime * 0.5 + mouseInfluence.y);
    float p3 = sin((uv.x + uv.y) * 5.0 + uTime + length(uMouse) * 5.0); // Reacts to distance from center too
    
    float mixFactor = (p1 + p2 + p3) / 3.0; // -1 to 1
    mixFactor = mixFactor * 0.5 + 0.5; // 0 to 1
    
    // Color mixing logic - Highly volatile
    vec3 finalColor = mix(col1, col2, uv.x + sin(uTime * 0.5 + mouseInfluence.x * 0.5));
    finalColor = mix(finalColor, col3, uv.y + cos(uTime * 0.5 + mouseInfluence.y * 0.5));
    finalColor = mix(finalColor, col4, mixFactor);
    
    // Add "Lava Lamp" blobs based on mouse - Global influence
    float mouseDist = distance(vUv, uMouse * 0.5 + 0.5); 
    float blob = smoothstep(1.5, 0.0, mouseDist); 
    
    finalColor = mix(finalColor, col7, blob * 0.4); // Stronger tint
    finalColor += col9 * blob * 0.15; // Brighter
    
    // Organic movement overlay
    float noise = sin(uv.x * 10.0 + uTime * 2.0) * cos(uv.y * 10.0 + uTime);
    finalColor = mix(finalColor, col8, noise * 0.05);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- ANIMATED BORDER SHADER (Central Image Frame) ---
export const borderFragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Palette 1
  vec3 col1 = vec3(0.651, 0.141, 0.329); // #A62454
  vec3 col2 = vec3(0.510, 0.216, 0.549); // #82378C
  vec3 col3 = vec3(0.396, 0.651, 0.325); // #65A653
  vec3 col4 = vec3(0.651, 0.576, 0.216); // #A69337
  vec3 col5 = vec3(0.651, 0.173, 0.129); // #A62C21

  // Palette 2
  vec3 col6 = vec3(0.651, 0.427, 0.486); // #A66D7C
  vec3 col7 = vec3(0.204, 0.090, 0.451); // #341773
  vec3 col8 = vec3(0.522, 0.549, 0.290); // #858C4A
  vec3 col9 = vec3(0.949, 0.949, 0.949); // #F2F2F2
  vec3 col10 = vec3(0.051, 0.051, 0.051); // #0D0D0D

  void main() {
    vec2 uv = vUv;
    
    // Border Mask Logic
    // Aspect ratio is roughly 22:8 (~2.75:1)
    // We want a very thin border, say 0.0025 units relative to UV
    float borderX = 0.0025; 
    float borderY = 0.0025 * 2.75; // Adjust for aspect ratio to keep thickness consistent visually
    
    // Create a box mask: 0 inside the border, 1 on the border
    float maskX = step(borderX, uv.x) * step(uv.x, 1.0 - borderX);
    float maskY = step(borderY, uv.y) * step(uv.y, 1.0 - borderY);
    float centerMask = maskX * maskY;
    
    if (centerMask > 0.5) {
      discard; // Remove center pixels
    }

    // --- REUSE FLUID LOGIC FOR THE BORDER ---
    
    // Global Interaction - ULTRA SENSITIVE
    vec2 mouseInfluence = uMouse * 10.0; 
    
    // Create organic, lava-lamp-like distortion
    float waveX = sin(uv.y * 5.0 + uTime + mouseInfluence.x) * 0.2; 
    float waveY = cos(uv.x * 5.0 + uTime + mouseInfluence.y) * 0.2;
    
    uv.x += waveX;
    uv.y += waveY;
    
    // Dynamic pattern generation
    float p1 = sin(uv.x * 3.0 + uTime + mouseInfluence.x);
    float p2 = cos(uv.y * 3.0 - uTime * 0.5 + mouseInfluence.y);
    float p3 = sin((uv.x + uv.y) * 5.0 + uTime + length(uMouse) * 5.0); 
    
    float mixFactor = (p1 + p2 + p3) / 3.0; 
    mixFactor = mixFactor * 0.5 + 0.5; 
    
    // Color mixing logic
    vec3 finalColor = mix(col1, col2, uv.x + sin(uTime * 0.5 + mouseInfluence.x * 0.5));
    finalColor = mix(finalColor, col3, uv.y + cos(uTime * 0.5 + mouseInfluence.y * 0.5));
    finalColor = mix(finalColor, col4, mixFactor);
    
    // Add "Lava Lamp" blobs
    float mouseDist = distance(vUv, uMouse * 0.5 + 0.5); 
    float blob = smoothstep(1.5, 0.0, mouseDist); 
    
    finalColor = mix(finalColor, col7, blob * 0.4); 
    finalColor += col9 * blob * 0.15; 
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// --- SIMULATION SHADER (Brush Trails & Decay) ---
export const simulationFragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uBrushActive; // 0.0 = inactive, 1.0 = active
  varying vec2 vUv;

  void main() {
    // Sample previous frame
    vec4 current = texture2D(uTexture, vUv);
    
    // Calculate mouse distance (adjust for aspect ratio if needed, but simple distance works for now)
    // We assume UVs are 0-1. Mouse is 0-1.
    float dist = distance(vUv, uMouse);
    
    // Brush size and softness
    float brushSize = 0.1; // Increased from 0.05 for larger brush area
    float brush = smoothstep(brushSize, 0.0, dist);
    
    // Add new ink to current state
    // We use the red channel for "displacement intensity"
    float intensity = current.r;
    
    // Add brush influence - only when brush is active
    intensity += brush * 0.5 * uBrushActive; // Multiplied by uBrushActive (fades out when mouse stops)
    
    // Decay (Auto-clean) - Slower decay for longer-lasting effect
    intensity *= 0.985; // Increased from 0.96 (closer to 1.0 = slower fade)
    
    // Clamp
    intensity = clamp(intensity, 0.0, 1.0);
    
    gl_FragColor = vec4(intensity, 0.0, 0.0, 1.0);
  }
`;

// --- HALLUCINATION SHADER (Central Eyes + Watercolor Distortion) ---
export const hallucinationFragmentShader = `
  uniform sampler2D uTexture;
  uniform sampler2D uDisplacement; // From simulation
  uniform float uTime;
  uniform float uOpacity; // Scroll-driven opacity
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Sample displacement map
    vec4 disp = texture2D(uDisplacement, uv);
    float displacement = disp.r; // Intensity of the brush
    
    // Watercolor Distortion
    // Warp UVs based on displacement intensity
    // We add some noise to the distortion to make it look like liquid diffusion
    float noise = sin(uv.x * 20.0 + uTime) * cos(uv.y * 20.0 + uTime);
    
    vec2 distortedUv = uv;
    distortedUv.x += displacement * 0.05 * sin(uTime * 2.0 + uv.y * 10.0);
    distortedUv.y += displacement * 0.05 * cos(uTime * 1.5 + uv.x * 10.0);
    
    // Chromatic Aberration based on displacement
    float shift = displacement * 0.02;
    
    vec4 r = texture2D(uTexture, distortedUv + vec2(shift, 0.0));
    vec4 g = texture2D(uTexture, distortedUv);
    vec4 b = texture2D(uTexture, distortedUv - vec2(shift, 0.0));
    
    vec4 color = vec4(r.r, g.g, b.b, 1.0);
    
    // Add a slight "wet" highlight where displacement is high
    color.rgb += vec3(0.1) * displacement;
    
    // Apply scroll-driven opacity
    gl_FragColor = vec4(color.rgb, uOpacity);
  }
`;

// --- ANIMATED GRADIENT SHADER (New Screen) ---
// --- ANIMATED GRADIENT SHADER (New Screen) ---
export const gradientFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  // Colors
  vec3 gray = vec3(0.533, 0.537, 0.549); // #88898C
  vec3 purple = vec3(0.522, 0.502, 0.651); // #8580A6
  vec3 lightPurple = vec3(0.576, 0.525, 0.651); // #9386A6

  void main() {
    vec2 uv = vUv;
    
    // 1. Create a dynamic animated pattern for the center (Purple)
    // Mimic the "CSS Animated Gradient" look with moving sine waves
    float wave1 = sin(uv.x * 3.0 + uTime * 0.5);
    float wave2 = cos(uv.y * 5.0 + uTime * 0.3);
    float wave3 = sin((uv.x + uv.y) * 4.0 - uTime * 0.4);
    
    float pattern = (wave1 + wave2 + wave3) / 3.0; // -1 to 1
    pattern = pattern * 0.5 + 0.5; // 0 to 1
    
    // Mix between Purple and Light Purple based on the pattern
    vec3 centerColor = mix(purple, lightPurple, pattern);
    
    // 2. Create a Radial Vignette (Gray Outside, Purple Center)
    // Distance from center (0.5, 0.5)
    float dist = distance(uv, vec2(0.5));
    
    // Portal/Peephole Effect
    // Sharper transition to define the "hole" clearly
    // 0.0 to 0.15 = Pure Purple Center
    // 0.15 to 0.5 = Rapid transition to Gray
    float vignette = smoothstep(0.15, 0.5, dist);
    
    // Mix Center Color with Gray based on distance
    // We want the center to be VERY purple and the outside VERY gray
    vec3 finalColor = mix(centerColor, gray, vignette);
    
    // Add subtle grain/noise for texture
    float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    finalColor += noise * 0.03;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
