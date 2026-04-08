import { fetchText, compileShader, linkProgram } from "./gl-utils.js";

/** OpenGL GL_PROGRAM_POINT_SIZE — vertex shader gl_PointSize is ignored if not enabled on some stacks. */
const GL_PROGRAM_POINT_SIZE = 0x8642;

export async function startSquidPointsDemo(canvas, vertUrl, fragUrl, options) {
  const { timeScale = 1 } = options;
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    powerPreference: "high-performance",
  });
  if (!gl) throw new Error("WebGL2 not available");

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.STENCIL_TEST);
  try {
    gl.enable(GL_PROGRAM_POINT_SIZE);
  } catch (_) {
    /* ignore if enum unsupported */
  }

  const vertSrc = await fetchText(vertUrl);
  const fragSrc = await fetchText(fragUrl);
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const program = linkProgram(gl, vert, frag);
  gl.deleteShader(vert);
  gl.deleteShader(frag);

  const NUM_POINTS = 10000;
  const uTimeLoc = gl.getUniformLocation(program, "u_time");
  const uResolutionLoc = gl.getUniformLocation(program, "u_resolution");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let time = 0;
  let raf = 0;

  function sizeCanvas() {
    const s = Math.min(window.innerWidth, window.innerHeight, 800);
    canvas.width = s;
    canvas.height = s;
    gl.viewport(0, 0, s, s);
    gl.useProgram(program);
    gl.uniform2f(uResolutionLoc, s, s);
  }

  sizeCanvas();

  function render() {
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.clearColor(9 / 255, 9 / 255, 9 / 255, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    time += (Math.PI / 45) * timeScale;
    gl.uniform1f(uTimeLoc, time);
    gl.drawArrays(gl.POINTS, 0, NUM_POINTS);
    raf = requestAnimationFrame(render);
  }
  raf = requestAnimationFrame(render);

  function onResize() {
    sizeCanvas();
  }
  window.addEventListener("resize", onResize);

  return () => {
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(raf);
    gl.deleteProgram(program);
  };
}
