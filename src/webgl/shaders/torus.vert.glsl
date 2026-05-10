precision mediump float;

uniform float uTime;
uniform float uScroll;
uniform float uPhase;
uniform float uIntro;
uniform vec2  uMouse;

attribute float aTheta;
attribute float aPhi;
attribute float aRand;

varying float vAccent;
varying float vDepth;
varying float vRand;

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

/*
 * Procedural organic displacement — replaces texture2D which requires
 * vertex texture fetching (unsupported on Intel integrated GPUs on Windows).
 * Pure math: works on every WebGL1 / WebGL2 device.
 */
float procDisp(float theta, float phi) {
  float a = sin(theta * 3.7 + phi  * 2.3 + uTime * 0.12);
  float b = cos(phi   * 1.9 + theta * 4.1 - uTime * 0.08);
  return 0.5 + 0.5 * a * b;
}

void main() {

  /* ---- 1. Breathing twist ---- */
  float twist = TWIST_BASE + 0.6 * sin(uTime * 0.18);
  twist = mix(twist, TWIST_OPEN, uPhase);

  float tw       = aPhi + aTheta * twist;
  float cosTheta = cos(aTheta);
  float sinTheta = sin(aTheta);
  float cosTw    = cos(tw);
  float sinTw    = sin(tw);

  vec3 pos;
  pos.x = (R_MAJOR + R_MINOR * cosTw) * cosTheta;
  pos.y =  R_MINOR * sinTw;
  pos.z = (R_MAJOR + R_MINOR * cosTw) * sinTheta;

  /* ---- 2. Procedural displacement (universal GPU support) ---- */
  vec3 torusCenter = vec3(R_MAJOR * cosTheta, 0.0, R_MAJOR * sinTheta);
  vec3 nrm  = normalize(pos - torusCenter);
  float disp = procDisp(aTheta, aPhi);
  pos += nrm * disp * 0.18;

  /* ---- 3. Mouse rotation ---- */
  pos = rotX(-uMouse.y * 0.4) * rotY(uMouse.x * 0.4) * pos;

  /* ---- 4. Auto rotation ---- */
  pos = rotY(uTime * 0.12) * pos;

  /* ---- 5. Intro scale ---- */
  float introScale = mix(0.15, 1.0, uIntro);
  pos *= introScale;

  /* ---- 6. Phase shift (outro) ---- */
  pos.x += mix(0.0, -2.5, uPhase);

  /* ---- Varyings ---- */
  vRand   = aRand;
  vAccent = step(0.98, aRand);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vDepth = -mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;

  /*
   * Clamp to 64 — Intel HD / UHD and many AMD APUs on Windows
   * silently discard points larger than ~63–64 px.
   */
  gl_PointSize = clamp(
    (0.8 + aRand * 0.6) * (72.0 / -mvPosition.z),
    1.0, 64.0
  );
}
