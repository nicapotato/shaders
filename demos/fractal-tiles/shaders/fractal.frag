#version 300 es
precision highp float;
uniform float time;
uniform vec2 resolution;
in vec2 v_uv;
out vec4 fragColor;

vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.263, 0.416, 0.557);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = v_uv * 2.0 - 1.0;
  uv.x *= resolution.x / resolution.y;

  uv = fract(uv);

  float d_val = length(uv - 0.5);

  d_val = sin(d_val * 8.0 + time * 2.0) * 2.0;
  d_val = smoothstep(0.8, 1.0, d_val);

  d_val = 0.9 / max(d_val, 0.0001);

  vec3 col = palette(length(uv) + time * 0.4);
  col *= d_val;

  fragColor = vec4(col, 1.0);
}
