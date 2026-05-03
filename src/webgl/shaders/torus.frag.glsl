uniform vec3  uColor;
uniform vec3  uColorAccent;
uniform vec3  uColorGlow;
uniform float uIntro;
uniform float uTime;

varying float vAccent;
varying float vDepth;
varying float vRand;

void main() {
  /* ---- Soft circular point with crisp centre ---- */
  float d     = length(gl_PointCoord - vec2(0.5));
  float alpha = smoothstep(0.50, 0.02, d);

  if (alpha < 0.005) discard;

  /* ---- Warm colour drift: base shifts gently over time per-particle ---- */
  float warmth   = 0.5 + 0.5 * sin(vRand * 6.2832 + uTime * 0.25);
  vec3  baseColor = mix(uColor, uColorGlow, warmth * 0.15);

  /* ---- Coral accent ~2% of dots ---- */
  vec3 color = mix(baseColor, uColorAccent, step(0.98, vRand));

  /* ---- Depth fade: near = bright, far = subtle ---- */
  float depthFade = smoothstep(18.0, 4.0, vDepth);
  alpha *= mix(0.07, 0.78, depthFade);

  /* ---- Inner glow on accent dots ---- */
  float centreGlow = smoothstep(0.5, 0.0, d);
  color = mix(color, uColorAccent * 1.6, vAccent * centreGlow * 0.5);

  /* ---- Intro fade-in ---- */
  alpha *= smoothstep(0.0, 0.55, uIntro);

  gl_FragColor = vec4(color, alpha);
}
