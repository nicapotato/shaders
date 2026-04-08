(async () => {
  const { showCaughtError } = await import(new URL("../../shared/show-error.js", import.meta.url).href);
  const canvas = document.getElementById("c");
  try {
    const { startFullscreenFragmentDemo } = await import(
      new URL("../../shared/fullscreen-webgl2.js", import.meta.url).href,
    );
    await startFullscreenFragmentDemo(
      canvas,
      new URL("./shaders/corridor.frag", import.meta.url).href,
      (gl, _p, loc, w, h, t) => {
        if (loc.iTime == null || loc.iResolution == null) {
          throw new Error(
            `Shader missing active uniforms. iTime=${loc.iTime} iResolution=${loc.iResolution}`,
          );
        }
        gl.uniform1f(loc.iTime, t);
        gl.uniform2f(loc.iResolution, w, h);
      },
    );
  } catch (e) {
    console.error(e);
    showCaughtError(e);
  }
})();
