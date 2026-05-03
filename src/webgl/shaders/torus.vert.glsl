uniform float uTime;
uniform float uScroll;
uniform float uPhase;
uniform float uIntro;
uniform vec2  uMouse;
uniform sampler2D uMap;

attribute float aTheta;
attribute float aPhi;
attribute float aRand;

varying float vAccent;
varying float vDepth;
varying float vRand;

const float PI     = 3.14159265358979;
const float TWO_PI = 6.28318530717959;
const float R_MAJOR    = 2.4;
const float R_MINOR    = 0.95;
const float TWIST_BASE = 6.0;
const float TWIST_OPEN = 4.0;

mat3 rotY(float a) {
  float s = sin(a), c = cos(a);
  return mat3(c,0.0,s,  0.0,1.0,0.0,  -s,0.0,c);
}

mat3 rotX(float a) {
  float s = sin(a), c = cos(a);
  return mat3(1.0,0.0,0.0,  0.0,c,-s,  0.0,s,c);
}

void main() {
  /* ---- 1. Breathing twist ---- */
  float twist = TWIST_BASE + 0.6 * sin(uTime * 0.18);
  /* As uPhase ramps to 1 (outro), open the form toward a clean torus */
  twist = mix(twist, TWIST_OPEN, uPhase);

  float tw = aPhi + aTheta * twist;
  float cosTheta = cos(aTheta);
  float sinTheta = sin(aTheta);
  float cosTw    = cos(tw);
  float sinTw    = sin(tw);

  vec3 pos;
  pos.x = (R_MAJOR + R_MINOR * cosTw) * cosTheta;
  pos.y = R_MINOR * sinTw;
  pos.z = (R_MAJOR + R_MINOR * cosTw) * sinTheta;

  /* Normal toward torus surface (used for displacement direction) */
  vec3 torusCenter = vec3(R_MAJOR * cosTheta, 0.0, R_MAJOR * sinTheta);
  vec3 nrm = normalize(pos - torusCenter);

  /* ---- 2. Displacement map ---- */
  vec2 uv = vec2(aTheta / TWO_PI, aPhi / TWO_PI);
  float disp = texture2D(uMap, uv).r;
  pos += nrm * disp * 0.18;

  /* ---- 3. Mouse rotation ---- */
  pos = rotX(-uMouse.y * 0.4) * rotY(uMouse.x * 0.4) * pos;

  /* ---- 4. Auto rotation ---- */
  pos = rotY(uTime * 0.12) * pos;

  /* ---- 5. Intro scale (load-in) ----
     Keep positions spread (min 0.15) so particles never converge to a
     single point under additive blending. Alpha fade handles the reveal. */
  float introScale = mix(0.15, 1.0, uIntro);
  pos *= introScale;

  /* ---- 6. Phase shift to outro left column ---- */
  pos.x += mix(0.0, -2.5, uPhase);

  /* ---- Varyings ---- */
  vRand   = aRand;
  vAccent = step(0.98, aRand); /* ~2% of dots become coral accent */

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vDepth = -mvPosition.z;

  gl_Position  = projectionMatrix * mvPosition;
  gl_PointSize = (0.8 + aRand * 0.6) * (72.0 / -mvPosition.z);
}
