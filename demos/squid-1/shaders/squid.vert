#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
  float i = float(gl_VertexID);
  float x = mod(i, 200.0);
  float y = floor(i / 55.0);

  float k = 9.0 * cos(x / 8.0);
  float e = y / 8.0 - 12.5;

  float d = (length(vec2(k, e)) * length(vec2(k, e))) / 99.0
    + sin(u_time) / 9.0
    + 0.8;

  float theta = atan(k, e) * 7.0;

  float q = 99.0
    - e * sin(theta) / d
    + k * (3.0 + 2.0 * cos(d * d - u_time));

  float c = d / 2.0 + e / 69.0 - u_time / 16.0;

  float px = q * sin(c) + 200.0;
  float py = (q + 19.0 * d) * cos(c) + 200.0;

  vec2 clip = (vec2(px, py) / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = 6.0;
}
