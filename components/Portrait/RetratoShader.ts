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
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Create wavy patterns
    float wave1 = sin(uv.x * 10.0 + uTime * 2.0);
    float wave2 = cos(uv.y * 15.0 - uTime * 1.5);
    float wave3 = sin((uv.x + uv.y) * 8.0 + uTime);
    
    float pattern = wave1 + wave2 + wave3;
    
    // Iridescent / Rainbow palette
    vec3 color = 0.5 + 0.5 * cos(uTime + uv.xyx + vec3(0, 2, 4));
    
    // Mix with pattern
    color += vec3(pattern * 0.2);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// --- HALLUCINATION SHADER (Central Eyes) ---
export const hallucinationFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Subtle breathing/warping effect
    float warp = sin(uv.y * 20.0 + uTime) * 0.002;
    uv.x += warp;
    
    // Color shift (Chromatic Aberration)
    float offset = 0.003 * sin(uTime * 2.0);
    vec4 r = texture2D(uTexture, uv + vec2(offset, 0.0));
    vec4 g = texture2D(uTexture, uv);
    vec4 b = texture2D(uTexture, uv - vec2(offset, 0.0));
    
    // Slight color cycling overlay
    vec3 tint = 0.5 + 0.5 * cos(uTime * 0.5 + uv.xyx + vec3(0, 2, 4));
    
    vec4 finalColor = vec4(r.r, g.g, b.b, 1.0);
    
    // Blend original with subtle tint
    gl_FragColor = mix(finalColor, vec4(tint, 1.0), 0.1);
  }
`;
