const canvas = document.getElementById("c");

const CANVAS_SIZE = () => Math.min(window.innerWidth, window.innerHeight, 800);
const NUM_POINTS = 10000;

let animationFrame = 0;
let device = null;
let time = 0;

async function initWebGPU() {
  if (!navigator.gpu) {
    return false;
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    return false;
  }
  device = await adapter.requestDevice();

  const context = canvas.getContext("webgpu");
  if (!context) {
    return false;
  }

  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: canvasFormat,
    alphaMode: "premultiplied",
  });

  const vertexShaderCode = `
        struct Uniforms {
          time: f32,
          resolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> uniforms: Uniforms;

        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) @interpolate(flat) pointSize: f32,
        }

        @vertex
        fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          var output: VertexOutput;

          let i = f32(vertexIndex);
          let x = i % 200.0;
          let y = floor(i / 55.0);

          let k = 9.0 * cos(x / 8.0);
          let e = y / 8.0 - 12.5;

          let d = (length(vec2<f32>(k, e)) * length(vec2<f32>(k, e))) / 99.0
                + sin(uniforms.time) / 8.0
                + 0.8;

          let theta = atan2(k, e) * 7.0;

          let q = 99.0
                - e * sin(theta) / d
                + k * (3.0 + 2.0 * cos(d * d - uniforms.time));

          let c = d / 2.0 + e / 69.0 - uniforms.time / 16.0;

          let px = q * sin(c) + 200.0;
          let py = (q + 19.0 * d) * cos(c) + 200.0;

          let clip = (vec2<f32>(px, py) / uniforms.resolution) * 2.0 - 1.0;

          output.position = vec4<f32>(clip.x, -clip.y, 0.0, 1.0);
          output.pointSize = 2.0;

          return output;
        }
      `;

  const fragmentShaderCode = `
        @fragment
        fn fs_main() -> @location(0) vec4<f32> {
          return vec4<f32>(1.0, 1.0, 1.0, 0.26);
        }
      `;

  const vertexShader = device.createShaderModule({ code: vertexShaderCode });
  const fragmentShader = device.createShaderModule({ code: fragmentShaderCode });

  const uniformBuffer = device.createBuffer({
    size: 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: "uniform" },
      },
    ],
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  const renderPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    vertex: {
      module: vertexShader,
      entryPoint: "vs_main",
    },
    fragment: {
      module: fragmentShader,
      entryPoint: "fs_main",
      targets: [
        {
          format: canvasFormat,
          blend: {
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
            },
            alpha: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
            },
          },
        },
      ],
    },
    primitive: {
      topology: "point-list",
    },
  });

  function setCanvasSize() {
    const s = CANVAS_SIZE();
    canvas.width = s;
    canvas.height = s;
    context.configure({
      device,
      format: canvasFormat,
      alphaMode: "premultiplied",
    });
  }
  setCanvasSize();

  function render() {
    time += Math.PI / 45;
    const s = Math.min(canvas.width, canvas.height);
    const uniformData = new Float32Array([time, 0, s, s]);
    device.queue.writeBuffer(uniformBuffer, 0, uniformData);

    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 9 / 255, g: 9 / 255, b: 9 / 255, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    renderPass.setPipeline(renderPipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.draw(NUM_POINTS);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);

    animationFrame = requestAnimationFrame(render);
  }

  window.addEventListener("resize", setCanvasSize);

  animationFrame = requestAnimationFrame(render);

  return () => {
    window.removeEventListener("resize", setCanvasSize);
    cancelAnimationFrame(animationFrame);
    device.destroy();
  };
}

initWebGPU().then((cleanup) => {
  if (cleanup === false) {
    const ctx = canvas.getContext("2d");
    const s = CANVAS_SIZE();
    canvas.width = s;
    canvas.height = s;
    ctx.fillStyle = "#ffffff";
    ctx.font = "18px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("WebGPU not supported in this browser", s / 2, s / 2);
  }
});
