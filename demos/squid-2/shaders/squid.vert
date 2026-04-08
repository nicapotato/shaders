#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
  float i = float(gl_VertexID);
  float x = mod(i, 200.0);
  float y = floor(i / 43.0);

  float k = 5.0 * cos(x / 14.0) * cos(y / 30.0);
  float e = y / 8.0 - 13.0;

  float d = (length(vec2(k, e)) * length(vec2(k, e))) / 59.0 + 4.0;

  float q = 60.0
    - 3.0 * sin(atan(k, e) * e)
    + k * (3.0 + 4.0 / d * sin(d * d - u_time * 2.0));

  float c = d / 2.0 + e / 99.0 - u_time / 18.0;

  float px = q * sin(c) + 200.0;
  float py = (q + d * 9.0) * cos(c) + 200.0;

  vec2 clip = (vec2(px, py) / u_resolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = 6.0;
}
