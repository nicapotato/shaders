import {
  compileShader,
  linkProgram,
  fetchText,
  resizeCanvasToDisplaySize,
} from "./gl-utils.js";

const FULLSCREEN_VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_pos;
layout(location = 1) in vec2 a_uv;
out vec2 v_uv;
void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

function createQuadBuffers(gl) {
  const positions = new Float32Array([
    -1, -1, 0, 0,
    1, -1, 1, 0,
    -1, 1, 0, 1,
    -1, 1, 0, 1,
    1, -1, 1, 0,
    1, 1, 1, 1,
  ]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const stride = 4 * 4;
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 8);
  return { vao, buf };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} fragmentShaderUrl
 * @param {(gl: WebGL2RenderingContext, program: WebGLProgram, locs: object, w: number, h: number, timeSec: number) => void} setUniforms
 */
export async function startFullscreenFragmentDemo(canvas, fragmentShaderUrl, setUniforms) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    powerPreference: "high-performance",
  });
  if (!gl) throw new Error("WebGL2 not available");

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.STENCIL_TEST);
  gl.disable(gl.BLEND);
  gl.disable(gl.CULL_FACE);
  gl.colorMask(true, true, true, true);

  const fsSource = await fetchText(fragmentShaderUrl);
  const vs = compileShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERT);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = linkProgram(gl, vs, fs);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  gl.useProgram(program);
  const { vao } = createQuadBuffers(gl);

  const loc = {
    time: gl.getUniformLocation(program, "time"),
    iTime: gl.getUniformLocation(program, "iTime"),
    resolution: gl.getUniformLocation(program, "resolution"),
    iResolution: gl.getUniformLocation(program, "iResolution"),
  };

  const t0 = performance.now();
  let raf = 0;
  function frame() {
    resizeCanvasToDisplaySize(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const timeSec = (performance.now() - t0) * 0.001;
    gl.useProgram(program);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    setUniforms(gl, program, loc, canvas.width, canvas.height, timeSec);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    gl.deleteProgram(program);
  };
}
