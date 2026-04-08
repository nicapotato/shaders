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
  vec2 uv = (v_uv * 2.0 - 1.0) * vec2(resolution.x / resolution.y, 1.0);
  vec2 uv0 = uv;
  vec3 finalColor = vec3(0.0);

  for (int fi = 0; fi < 4; fi++) {
    float i = float(fi);
    uv = fract(uv * 1.5) - 0.5;
    float d = length(uv) * exp(-length(uv0));
    vec3 col = palette(length(uv0) + i * 0.4 + time * 0.4);
    d = sin(d * 8.0 + time) / 8.0;
    d = abs(d);
    d = pow(0.01 / d, 1.2);
    finalColor += col * d;
  }

  fragColor = vec4(finalColor, 1.0);
}
