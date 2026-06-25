/**
 * linewaves.ts — the home hero field (replaces the old image constellation).
 *
 * A vanilla port of the React Bits <LineWaves> WebGL component (ogl): a slow,
 * cursor-reactive field of warped line-waves rendered behind the centred hero
 * text. Recoloured to the house scheme — the lines are drawn in the forest-green
 * accent (read from the --pink token, the single source of truth) over the pure
 * ground, so it stays strictly two-colour.
 *
 * Laws honoured: desktop (>=1025px) + motion only, loaded at idle AFTER the LCP
 * (the h1 carries first paint) so the home perf budget holds; mobile / reduced-
 * motion / no-WebGL keep the clean static hero (the markup IS the fallback). The
 * whole boot is try/caught so a WebGL failure leaves the static hero, no error.
 */
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const desktop = matchMedia('(min-width: 1025px)').matches;

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '').trim();
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uInnerLines;
uniform float uOuterLines;
uniform float uWarpIntensity;
uniform float uRotation;
uniform float uEdgeFadeWidth;
uniform float uColorCycleSpeed;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;
#define HALF_PI 1.5707963
float hashF(float n){ return fract(sin(n*127.1)*43758.5453123); }
float smoothNoise(float x){ float i=floor(x); float f=fract(x); float u=f*f*(3.0-2.0*f); return mix(hashF(i),hashF(i+1.0),u); }
float displaceA(float c,float t){ float r=sin(c*2.123)*0.2; r+=sin(c*3.234+t*4.345)*0.1; r+=sin(c*0.589+t*0.934)*0.5; return r; }
float displaceB(float c,float t){ float r=sin(c*1.345)*0.3; r+=sin(c*2.734+t*3.345)*0.2; r+=sin(c*0.189+t*0.934)*0.3; return r; }
vec2 rotate2D(vec2 p,float a){ float c=cos(a); float s=sin(a); return vec2(p.x*c-p.y*s, p.x*s+p.y*c); }
void main(){
  vec2 coords = gl_FragCoord.xy / uResolution.xy;
  coords = coords*2.0-1.0;
  coords = rotate2D(coords, uRotation);
  float halfT = uTime*uSpeed*0.5;
  float fullT = uTime*uSpeed;
  float mouseWarp = 0.0;
  if (uEnableMouse){
    vec2 mPos = rotate2D(uMouse*2.0-1.0, uRotation);
    float mDist = length(coords - mPos);
    mouseWarp = uMouseInfluence * exp(-mDist*mDist*4.0);
  }
  float warpAx = coords.x + displaceA(coords.y,halfT)*uWarpIntensity + mouseWarp;
  float warpAy = coords.y - displaceA(coords.x*cos(fullT)*1.235,halfT)*uWarpIntensity;
  float warpBx = coords.x + displaceB(coords.y,halfT)*uWarpIntensity + mouseWarp;
  float warpBy = coords.y - displaceB(coords.x*sin(fullT)*1.235,halfT)*uWarpIntensity;
  vec2 fieldA = vec2(warpAx,warpAy);
  vec2 fieldB = vec2(warpBx,warpBy);
  vec2 blended = mix(fieldA,fieldB,mix(fieldA,fieldB,0.5));
  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth+0.4, blended.y);
  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth+0.4), blended.y);
  float vMask = 1.0 - max(fadeTop,fadeBottom);
  float tileCount = mix(uOuterLines,uInnerLines,vMask);
  float scaledY = blended.y*tileCount;
  float nY = smoothNoise(abs(scaledY));
  float ridge = pow(step(abs(nY-blended.x)*2.0,HALF_PI)*cos(2.0*(nY-blended.x)),5.0);
  float lines = 0.0;
  for (float i=1.0;i<3.0;i+=1.0){ lines += pow(max(fract(scaledY),fract(-scaledY)), i*2.0); }
  float pattern = vMask*lines;
  float cycleT = fullT*uColorCycleSpeed;
  float rChannel = (pattern+lines*ridge)*(cos(blended.y+cycleT*0.234)*0.5+1.0);
  float gChannel = (pattern+vMask*ridge)*(sin(blended.x+cycleT*1.745)*0.5+1.0);
  float bChannel = (pattern+lines*ridge)*(cos(blended.x+cycleT*0.534)*0.5+1.0);
  vec3 col = (rChannel*uColor1 + gChannel*uColor2 + bChannel*uColor3)*uBrightness;
  float alpha = clamp(length(col),0.0,1.0);
  gl_FragColor = vec4(col, alpha);
}
`;

const container = document.getElementById('hero-waves');

if (container && desktop && !reduced) {
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1200 }) : setTimeout(cb, 200);
  idle(() => {
    try {
      boot(container);
    } catch {
      /* WebGL unavailable → clean static hero, no console error */
    }
  });
}

function boot(host: HTMLElement) {
  // MONOCHROME field: the waves are drawn in ink (read from --ink) over the white
  // ground — black-and-white, never the green accent (the green is reserved for
  // precise marks: thread/numerals/frames/CTA, never a full background field).
  const css = getComputedStyle(document.documentElement);
  const inkHex = css.getPropertyValue('--ink').trim() || '#111111';
  const ink = hexToVec3(inkHex);

  const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: Math.min(2, devicePixelRatio || 1) });
  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  let current = [0.5, 0.5];
  let target = [0.5, 0.5];
  const onMove = (e: PointerEvent) => {
    const r = host.getBoundingClientRect();
    target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  };
  const onLeave = () => {
    target = [0.5, 0.5];
  };

  const resize = () => {
    renderer.setSize(host.offsetWidth, host.offsetHeight);
    if (program) program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
  };

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: [1, 1, 1] },
      uSpeed: { value: 0.26 }, // unhurried drift — serious, not busy
      uInnerLines: { value: 30 },
      uOuterLines: { value: 34 },
      uWarpIntensity: { value: 0.9 },
      uRotation: { value: (-32 * Math.PI) / 180 },
      uEdgeFadeWidth: { value: 0.0 },
      uColorCycleSpeed: { value: 0.0 }, // no hue cycle — monochrome ink, black & white
      uBrightness: { value: 1.5 }, // ink is dark; lift so the lines read as charcoal on white
      uColor1: { value: ink },
      uColor2: { value: ink },
      uColor3: { value: ink },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uMouseInfluence: { value: 0.9 }, // gentle cursor pull
      uEnableMouse: { value: true },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });
  gl.canvas.classList.add('hero-waves__canvas');
  host.appendChild(gl.canvas);
  addEventListener('resize', resize);
  resize();
  // listen on the hero host (not the canvas) so the cursor still warps the field
  // when hovering the centred copy that sits above the canvas
  const hero = host.closest('.hero') ?? host;
  hero.addEventListener('pointermove', onMove as EventListener);
  hero.addEventListener('pointerleave', onLeave as EventListener);

  let raf = 0;
  let running = true;
  const tick = (t: number) => {
    raf = requestAnimationFrame(tick);
    if (!running) return;
    program.uniforms.uTime.value = t * 0.001;
    current[0] += 0.05 * (target[0] - current[0]);
    current[1] += 0.05 * (target[1] - current[1]);
    program.uniforms.uMouse.value[0] = current[0];
    program.uniforms.uMouse.value[1] = current[1];
    renderer.render({ scene: mesh });
  };
  raf = requestAnimationFrame(tick);

  // pause the rAF when the hero scrolls out of view / tab hidden (battery + TBT)
  const io = new IntersectionObserver((es) => (running = es[0].isIntersecting), { threshold: 0 });
  io.observe(host);
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
  });
}
