#version 300 es

/* Assignment 5: Artistic Rendering
 * Original C++ implementation by UMN CSCI 4611 Instructors, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

precision mediump float;


// INPUT FROM UNIFORMS SET IN THE MAIN APPLICATION

// Transforms points and vectors from Model Space to World Space (modelToWorld)
uniform mat4 modelMatrix;
// Special version of the modelMatrix to use with normal vectors
uniform mat4 normalMatrix;
// Transforms points and vectors from World Space to View Space (a.k.a. Eye Space) (worldToView) 
uniform mat4 viewMatrix;
// Transforms points and vectors from View Space to Normalized Device Coordinates (viewToNDC)
uniform mat4 projectionMatrix;


// INPUT FROM THE MESH THIS VERTEX SHADER IS RUNNING ON

// per-vertex data, points and vectors are defined in Model Space
in vec3 positionModel;
in vec3 normalModel;
in vec4 color;
in vec2 texCoords;


// OUTPUT TO RASTERIZER TO INTERPOLATE ACROSS TRIANGLES AND SEND TO FRAGMENT SHADERS

out vec3 interpPositionWorld;
out vec3 interpNormalWorld;
out vec4 interpColor;
out vec2 interpTexCoords;


void main() 
{
    // PART 2.0: In class example

    gl_Position = vec4(0,0,0,1);
    
    // --- begin solution code ---
    interpPositionWorld = (modelMatrix * vec4(positionModel, 1)).xyz;
    interpNormalWorld = normalize((normalMatrix * vec4(normalModel, 0)).xyz);
    interpColor = color;
    interpTexCoords = texCoords.xy; 
    gl_Position = projectionMatrix * viewMatrix * vec4(interpPositionWorld, 1);
    // --- end solution code ---
}
