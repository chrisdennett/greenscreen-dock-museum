// ***********************
// FRAG SHADER
// ***********************
export const frag = /* glsl */ `

precision mediump float;
      
uniform sampler2D tex;

uniform vec3 keyColor;
uniform float similarity;
uniform float smoothness;
uniform float spill;

varying vec2 v_texCoord;

vec4 getWebcamColour(sampler2D webcamColour, vec2 texCoord){
    return texture2D(webcamColour, texCoord);
}

// From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
vec2 RGBtoUV(vec3 rgb) {
    return vec2(
        rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
        rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
    );
}
  
vec4 ProcessChromaKey(vec4 rgba, vec2 texCoord) {
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

vec4 getSepiaColour(vec4 currColour){

    float amount = 0.5;

    vec4 outColour = currColour;

    float r = currColour.r;
    float g = currColour.g;
    float b = currColour.b;
            
    outColour.r = min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
    outColour.g = min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));
    outColour.b = min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));
            
    return outColour;
}

vec4 getGreenScreenColour(vec4 currColour, vec2 texCoord){
    vec4 outColour = currColour;

    if(outColour.r == 0.0 && outColour.g == 0.0 && outColour.b == 0.0 ){
        outColour = vec4(0.0, 0.0, 0.0, 0.0);
    }
    else if(outColour.a < 0.3){
        outColour = vec4(0.0, 0.0, 0.0, 0.0);
    }
    else{
        outColour = ProcessChromaKey(outColour, texCoord);
    }
            
    return outColour;
}

vec4 getTextureColour(sampler2D u_image, vec2 texCoord){
    return texture2D(u_image, texCoord);
}

// Blur
vec4 getBlurredColour(float intensity, vec2 texCoord){
    vec4 blurredColour;
    const int passes = 12;

    vec4 c1 = vec4(0.0);

    float disp = intensity;
    for (int xi=0; xi<passes; xi++)
    {
        float x = float(xi) / float(passes) - 0.5;
        for (int yi=0; yi<passes; yi++)
        {
            float y = float(yi) / float(passes) - 0.5;
            vec2 v = vec2(x,y);
            float d = disp;
            c1 += getTextureColour(tex, texCoord + d*v);
        }
    }
    c1 /= float(passes*passes);

    blurredColour = c1;

    return blurredColour;
}
  
    
void main(void) {
    vec4 webcamColour = getWebcamColour(tex, v_texCoord);
    vec4 greenScreenColor = getGreenScreenColour(webcamColour, v_texCoord);

    gl_FragColor = greenScreenColor;
}
`;

// ***********************
// VERT SHADER
// ***********************
export const vert = /* glsl */ `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
  
    uniform vec2 u_resolution;
    varying vec2 v_texCoord;
  
    void main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;
    
        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;
    
        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        // convert from 0->2 to -1->+1 (clipspace)
        //vec2 clipSpace = zeroToOne - 1.0;
    
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    
        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        v_texCoord = a_texCoord;
    }
`;
