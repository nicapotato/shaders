(async () => {
  const { showCaughtError } = await import(new URL("../../shared/show-error.js", import.meta.url).href);
  const canvas = document.getElementById("c");
  try {
    const { startSquidPointsDemo } = await import(new URL("../../shared/squid-points.js", import.meta.url).href);
    await startSquidPointsDemo(
      canvas,
      new URL("./shaders/squid.vert", import.meta.url).href,
      new URL("./shaders/squid.frag", import.meta.url).href,
      { timeScale: 45 / 20 },
    );
  } catch (e) {
    console.error(e);
    showCaughtError(e);
  }
})();
