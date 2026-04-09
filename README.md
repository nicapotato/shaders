# shaders

**Static shader gallery** (plain HTML, CSS, and JavaScript). The index links to self-contained **WebGL2 (GLSL)** demos (squid, fractal patterns, corridor, and similar) and a **WebGPU (WGSL)** demo, each under `demos/` and `webgpu-squid/`.

## User guide

There is no install or build step; open `index.html` or use a local static server.

| Command | Description |
|--------|-------------|
| `make help` | Show available targets |
| `make serve` | Serve the repo on `127.0.0.1:8882` |
| `make kill-port` | Free port 8882 if something else is using it |

Requires **Python 3** for `make serve`.
