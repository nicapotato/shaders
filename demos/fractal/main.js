(async () => {
  const { showCaughtError } = await import(new URL("../../shared/show-error.js", import.meta.url).href);
  const canvas = document.getElementById("c");
  try {
    const { startFullscreenFragmentDemo } = await import(
      new URL("../../shared/fullscreen-webgl2.js", import.meta.url).href,
    );
    await startFullscreenFragmentDemo(
      canvas,
      new URL("./shaders/fractal.frag", import.meta.url).href,
      (gl, _p, loc, w, h, t) => {
        if (loc.time == null || loc.resolution == null) {
          throw new Error(
            `Shader missing active uniforms (linking may have stripped them). time=${loc.time} resolution=${loc.resolution}`,
          );
        }
        gl.uniform1f(loc.time, t);
        gl.uniform2f(loc.resolution, w, h);
      },
    );
  } catch (e) {
    console.error(e);
    showCaughtError(e);
  }
})();
