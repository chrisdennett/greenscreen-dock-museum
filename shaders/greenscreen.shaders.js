export const vert = /* glsl */ `
attribute vec2 c; 
void main(void) { 
    gl_Position=vec4(c, 0.0, 1.0); 
}
`;

export const frag = /* glsl */ `
precision mediump float;
      
uniform sampler2D tex;
uniform float texWidth;
uniform float texHeight;

uniform vec3 u_Color[10];
uniform vec3 keyColor;
uniform float similarity;
uniform float smoothness;
uniform float spill;


vec4 testColour1 = vec4(1.0, 0.0, 0.0, 1.0);
vec4 testColour2 = vec4(0.0, 1.0, 0.0, 1.0);
vec4 testColour3 = vec4(0.0, 0.0, 1.0, 1.0);

// From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
vec2 RGBtoUV(vec3 rgb) {
    return vec2(
        rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
        rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
    );
}
    
vec4 ProcessChromaKey(vec2 texCoord) {
    vec4 rgba = texture2D(tex, texCoord);
    float chromaDist = distance(RGBtoUV(texture2D(tex, texCoord).rgb), RGBtoUV(keyColor));
    
    float baseMask = chromaDist - similarity;
    float fullMask = pow(clamp(baseMask / smoothness, 0., 1.), 1.5);
    rgba.a = fullMask;
    
    float spillVal = pow(clamp(baseMask / spill, 0., 1.), 1.5);
    float desat = clamp(rgba.r * 0.2126 + rgba.g * 0.7152 + rgba.b * 0.0722, 0., 1.);
    rgba.rgb = mix(vec3(desat, desat, desat), rgba.rgb, spillVal);
    
    return rgba;
}

vec4 Posterize(in vec4 inputColor){
    float gamma = 0.99;
    float numColors = 5.0;
    
    vec3 c = inputColor.rgb;
    c = pow(c, vec3(gamma, gamma, gamma));
    c = c * numColors;
    c = floor(c);
    c = c / numColors;
    c = pow(c, vec3(1.0/gamma));
    
    return vec4(c, inputColor.a);
}

vec4 MapToPalette(in vec4 inputColor){
    if(inputColor[3] < 0.5){
        return inputColor;
    }

    float minDist = 9.9;
    float dist;
    vec4 paletteColour = inputColor;

    for(int i=0; i<10; i++){
        vec4 testColour = vec4(u_Color[i], 1.0);

        dist = distance(inputColor, testColour);

        if(dist < minDist){
            minDist = dist;
            paletteColour = testColour;
        }
    }
    
    return paletteColour;
}
    
void main(void) {
    vec2 texCoord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));

    vec4 greenScreenColor = ProcessChromaKey(texCoord);
    vec4 paletteColour = greenScreenColor;
    
    // don't bother posterizing the transparent pixels
    if(greenScreenColor[3] > 0.0){
        paletteColour = Posterize(greenScreenColor);
    }

    // gl_FragColor = MapToPalette(paletteColour);
    gl_FragColor = paletteColour;
}
`;
