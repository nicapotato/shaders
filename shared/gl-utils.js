export async function fetchText(url) {
  let r;
  try {
    r = await fetch(url);
  } catch (e) {
    throw new Error(
      `fetch failed for ${url}. Open via http:// (run "make serve" in the shaders folder), not file:// — ${e}`,
    );
  }
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.text();
}

export function compileShader(gl, type, source) {
  const s = gl.createShader(type);
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    throw new Error(log && log.length > 0 ? log : "shader compile failed");
  }
  return s;
}

export function linkProgram(gl, vertShader, fragShader) {
  const p = gl.createProgram();
  gl.attachShader(p, vertShader);
  gl.attachShader(p, fragShader);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    throw new Error(log && log.length > 0 ? log : "program link failed");
  }
  return p;
}

export function resizeCanvasToDisplaySize(canvas, multiplier) {
  const m = multiplier ?? (window.devicePixelRatio || 1);
  let cw = canvas.clientWidth;
  let ch = canvas.clientHeight;
  if (cw <= 0 || ch <= 0) {
    cw = window.innerWidth;
    ch = window.innerHeight;
  }
  const w = Math.max(1, Math.floor(cw * m));
  const h = Math.max(1, Math.floor(ch * m));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    return true;
  }
  return false;
}
