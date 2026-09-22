import { useEffect, useRef, useState } from "react";

// A continuous trefoil tube, rendered as a real lit 3D mesh.
const vertexSource = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform vec2 uRotation;
uniform float uAspect;
uniform float uFloat;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  float cx=cos(uRotation.x), sx=sin(uRotation.x), cy=cos(uRotation.y), sy=sin(uRotation.y);
  mat3 rx=mat3(1.,0.,0., 0.,cx,sx, 0.,-sx,cx);
  mat3 ry=mat3(cy,0.,-sy, 0.,1.,0., sy,0.,cy);
  mat3 rot=ry*rx;
  vec3 p=rot*aPosition;
  vNormal=rot*aNormal;
  vPosition=p;
  p.y+=uFloat;
  float depth=5.8-p.z;
  gl_Position=vec4(p.x*3.45/uAspect,p.y*3.45,depth*1.02-0.202,depth);
}`;
const fragmentSource = `
precision highp float;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uMaterial;
vec3 environment(vec3 r) {
  vec3 sky=mix(vec3(.19,.24,.39),vec3(.83,.88,.98),smoothstep(-.5,.7,r.y));
  sky=mix(sky,vec3(.98,.89,.80),1.-smoothstep(-.55,-.12,r.y));
  float softbox=pow(max(0.,dot(r,normalize(vec3(-.7,1.,1.5)))),18.);
  float strip=pow(max(0.,1.-abs(r.x*.75+r.z*.42-.15)),65.);
  float dark=pow(max(0.,dot(r,normalize(vec3(.8,.25,.6)))),9.);
  sky*=1.-dark*.88;
  return sky+softbox*1.4+strip*.72;
}
void main() {
  vec3 n=normalize(vNormal), view=normalize(vec3(0.,0.,5.8)-vPosition);
  vec3 r=reflect(-view,n);
  float fresnel=pow(1.-max(dot(n,view),0.),3.);
  float diffuse=max(0.,dot(n,normalize(vec3(-2.,3.,4.))));
  vec3 chrome=environment(r)*vec3(.88,.92,1.);
  chrome+=vec3(.33,.16,.19)*pow(max(0.,-n.x),3.);
  vec3 pearl=vec3(.79,.76,.71)*(.44+diffuse*.55)+environment(r)*.23;
  pearl+=vec3(.10,.03,.16)*fresnel;
  vec3 cobalt=environment(r)*vec3(.09,.24,.83)+vec3(.025,.04,.18)*diffuse;
  vec3 color=mix(chrome,pearl,clamp(uMaterial,0.,1.));
  color=mix(color,cobalt,clamp(uMaterial-1.,0.,1.));
  color+=fresnel*.15;
  gl_FragColor=vec4(pow(max(color,0.),vec3(.86)),1.);
}`;
type Vec = [number, number, number];
const normalize = (a: Vec): Vec => { const l = Math.hypot(...a); return a.map(v => v / l) as Vec; };
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const point = (t: number): Vec => [(Math.sin(t) + 2 * Math.sin(2 * t)) * .48, (Math.cos(t) - 2 * Math.cos(2 * t)) * .48, -Math.sin(3 * t) * .48];
function createMesh() {
  const positions: number[] = [], normals: number[] = [], indices: number[] = [];
  const segments = 240, sides = 32;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments * Math.PI * 2, center = point(t), next = point(t + .001);
    const tangent = normalize(next.map((v, j) => v - center[j]) as Vec);
    const normal = normalize(cross(tangent, [0, 0, 1]));
    const binormal = normalize(cross(tangent, normal));
    for (let j = 0; j <= sides; j++) {
      const angle = j / sides * Math.PI * 2;
      const n = normal.map((v, k) => v * Math.cos(angle) + binormal[k] * Math.sin(angle));
      positions.push(...center.map((v, k) => v + n[k] * .285)); normals.push(...n);
      if (i < segments && j < sides) { const a = i * (sides + 1) + j, b = a + sides + 1; indices.push(a, b, a + 1, b, b + 1, a + 1); }
    }
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
}
export default function Sculpture({ paused, material }: { paused: boolean; material: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const options = useRef({ paused, material });
  const [fallback, setFallback] = useState(false);
  useEffect(() => { options.current = { paused, material }; }, [paused, material]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
    if (!gl) { setFallback(true); return; }
    const shaders: WebGLShader[] = [], buffers: WebGLBuffer[] = [];
    const program = gl.createProgram();
    if (!program) { setFallback(true); return; }
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type);
      if (!shader) { setFallback(true); shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); return; }
      gl.shaderSource(shader, source); gl.compileShader(shader); shaders.push(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { setFallback(true); shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); return; }
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { setFallback(true); shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); return; }
    gl.useProgram(program);
    const mesh = createMesh();
    for (const [name, data] of [['aPosition', mesh.positions], ['aNormal', mesh.normals]] as const) {
      const buffer = gl.createBuffer(); if (buffer) buffers.push(buffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      const location = gl.getAttribLocation(program, name); gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    }
    const indexBuffer = gl.createBuffer(); if (indexBuffer) buffers.push(indexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST);
    const rotation = gl.getUniformLocation(program, 'uRotation'), aspect = gl.getUniformLocation(program, 'uAspect'), floating = gl.getUniformLocation(program, 'uFloat'), finish = gl.getUniformLocation(program, 'uMaterial');
    let frame = 0, visible = true, time = 0, last = 0, x = 0, y = 0, targetX = 0, targetY = 0, currentMaterial = 0;
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 1.75); canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr); gl.viewport(0, 0, canvas.width, canvas.height); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(canvas); resize();
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }); intersection.observe(canvas);
    const pointer = (event: PointerEvent) => { if (event.pointerType === 'touch') return; targetX = (event.clientX / window.innerWidth - .5) * .7; targetY = (event.clientY / window.innerHeight - .5) * .5; };
    window.addEventListener('pointermove', pointer, { passive: true });
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, .05); last = now;
      if (!visible || document.hidden || gl.isContextLost()) return;
      const still = options.current.paused;
      if (!still) { time += dt; x += (targetX - x) * .04; y += (targetY - y) * .04; }
      currentMaterial += (options.current.material - currentMaterial) * (still ? 1 : .06);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform2f(rotation, .38 + y + Math.sin(time * .22) * .08, -.32 + x + time * .12 + (still ? 0 : Math.min(window.scrollY / window.innerHeight, 1) * .5));
      gl.uniform1f(aspect, canvas.width / Math.max(canvas.height, 1)); gl.uniform1f(floating, Math.sin(time * .65) * .055); gl.uniform1f(finish, currentMaterial);
      gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
    };
    const contextLost = (event: Event) => { event.preventDefault(); setFallback(true); };
    canvas.addEventListener('webglcontextlost', contextLost);
    frame = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame); resizeObserver.disconnect(); intersection.disconnect(); window.removeEventListener('pointermove', pointer); canvas.removeEventListener('webglcontextlost', contextLost); buffers.forEach(b => gl.deleteBuffer(b)); shaders.forEach(s => gl.deleteShader(s)); gl.deleteProgram(program); };
  }, []);
  return <div className="sculpture"><canvas ref={canvasRef} aria-label="A floating chrome trefoil sculpture" role="img" style={{ visibility: fallback ? 'hidden' : 'visible' }} />{fallback && <div className={`sculpture-fallback finish-${material}`} aria-label="Sculptural interlocking loops" role="img"><i /><i /><i /></div>}</div>;
}
