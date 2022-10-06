// ***********************
// FRAG SHADER
// ***********************
export const frag = /* glsl */ `
precision mediump float;
      
uniform sampler2D tex;
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

vec4 getBrightnessContrast(vec4 currColour, float brightness, float contrast){
    vec4 outColour = currColour;

    outColour.rgb += brightness;
    if (contrast > 0.0) {
        outColour.rgb = (outColour.rgb - 0.5) / (1.0 - contrast) + 0.5;
    } else {
        outColour.rgb = (outColour.rgb - 0.5) * (1.0 + contrast) + 0.5;
    }
    
    return outColour;
}
  
    
void main(void) {

    float brightness = 0.156;
    float contrast = -0.175;
    float vibrance = 0.354;

    vec4 webcamColour = getWebcamColour(tex, v_texCoord);
    vec4 blurredColour = getBlurredColour(0.001, v_texCoord);
    vec4 brightnessContrastColour = getBrightnessContrast(blurredColour, brightness, contrast);

    vec4 sepiaColour = getSepiaColour(brightnessContrastColour);
    vec4 posterizedColour = Posterize(sepiaColour);

    gl_FragColor = posterizedColour;
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
