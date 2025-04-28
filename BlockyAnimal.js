// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl; 
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return; 
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return; 
  }

  // Set an initial value for this matrix to identity 
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// global related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; 
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;

// Head
let g_headMovement = 0;

// Tail
let g_tailAngle = 0; 
let g_tailAnimation = false;

let g_prevMousePos = null; // Stores the previous mouse position

// Set up actions for HTML UI elements
function addActionsForHTMLUI() {

  // Head movement slider
  document.getElementById('headSlide').addEventListener('mousemove', function() { 
    g_headMovement = this.value; 
    renderAllShapes();
  });

  // Tail movement slider
  document.getElementById('tailSlide').addEventListener('mousemove', function() {
    g_tailAngle = this.value; 
    renderAllShapes();
  });
  
  // animation buttons event
  document.getElementById('animationTailOnButton').onclick = function() { g_tailAnimation = true; };
  document.getElementById('animationTailOffButton').onclick = function() { g_tailAnimation = false; };

  // camera movement slider event 
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

}

// Function to handle mouse movements and update rotation
function mouseMove(ev) {
  // If no previous mouse position, set to current mouse position
  if (!g_prevMousePos) {
    g_prevMousePos = [ev.clientX, ev.clientY];
  }

  const deltaX = ev.clientX - g_prevMousePos[0];

  g_globalAngle += deltaX * 0.5; // Adjust sensitivity as needed
  g_globalAngle = g_globalAngle % 360; // Wrap the angle to stay within 0-360 range

  // Redraw shapes to reflect the new rotation
  renderAllShapes();

  g_prevMousePos = [ev.clientX, ev.clientY];
}

// Function to handle mouse click (to start the tracking)
function mouseDown(ev) {
  g_prevMousePos = [ev.clientX, ev.clientY];
  canvas.addEventListener('mousemove', mouseMove); // Start tracking mouse movement
}

// Function to stop tracking mouse movement when the mouse button is released
function mouseUp(ev) {
  g_prevMousePos = null;
  canvas.removeEventListener('mousemove', mouseMove); // Stop tracking mouse movement
}

// Update the global rotation from the slider
function updateSliderRotation() {
  // Update global rotation based on slider's value
  g_globalAngle = document.getElementById('angleSlide').value;
  renderAllShapes(); // Redraw to reflect the updated angle
}

function main() {
  
  // Set up canvas and gl variables
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for HTML UI elements
  addActionsForHTMLUI();
  
  // Register function (event handler) to be called on a mouse press
  // canvas.onmousedown = click;
  // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmousemove = function(ev) { if(ev.buttons === 1) { mouseMove(ev) }; };  // mouse rotation while pressed

  // // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 + g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Prints some debugging information to console
  g_seconds = performance.now() / 1000.0 + g_startTime;
  console.log(performance.now);

  // Update Animation Angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

var g_shapesList = [];

function click(ev) {

  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create and store the new Point
  let point;

  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }

  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  point.segments = g_segment;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {

  if (g_tailAnimation) {
    g_tailAngle = 20 * Math.sin(g_seconds);  // wag the tail between -20 and 20 degrees

    g_headMovement = 20 * Math.sin(g_seconds); // move the head between -20 and 20 degrees
  }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Render all parts of the animal model (body, head, legs, etc.)

  // Body
  var body = new Cube();
  body.color = [0.6, 0.6, 0.6, 1.0]; // Gray wolf body
  body.matrix.translate(0.0, -0.25, 0.0);
  body.matrix.scale(0.7, 0.4, 0.4);
  body.render();

  // Head
  var head = new Cube();
  head.color = [0.7, 0.7, 0.7, 1.0];
  head.matrix.translate(0.4, 0.0, 0.02);
  head.matrix.rotate(g_headMovement, 0, 0, 1); // head movement rotation
  head.matrix.scale(0.3, 0.3, 0.3);
  head.render();

  // Left Eye
  var leftEye = new Cube();
  leftEye.color = [1.0, 1.0, 1.0, 1.0]; // white
  leftEye.matrix = new Matrix4();
  // leftEye.matrix.translate(0.65, 0.15, 0.2);
  leftEye.matrix.translate(0.55, 0.08 + g_headMovement, 0.11);
  leftEye.matrix.scale(0.05, 0.05, 0.05);
  leftEye.render();

  // Right Eye
  var rightEye = new Cube();
  rightEye.color = [1.0, 1.0, 1.0, 1.0]; // white
  rightEye.matrix = new Matrix4();
  // rightEye.matrix.translate(0.65, 0.15, -0.1);
  rightEye.matrix.translate(0.55, 0.08 + g_headMovement, -0.06);
  rightEye.matrix.scale(0.05, 0.05, 0.05);
  rightEye.render();

  // Nose
  var nose = new Cube();
  nose.color = [0.2, 0.2, 0.2, 1.0]; // black
  // nose.matrix.translate(0.7, 0.0, 0.05);
  nose.matrix.translate(0.55, 0.0 + g_headMovement, 0.025);
  nose.matrix.scale(0.05, 0.05, 0.05);
  nose.render();

  // Mouth
  var mouth = new Cube();
  mouth.color = [0.2, 0.2, 0.2, 1.0];
  // mouth.matrix.translate(0.7, -0.05, 0.05);
  mouth.matrix.translate(0.55, -0.05 + g_headMovement, 0.025);
  mouth.matrix.scale(0.05, 0.01, 0.05);
  mouth.render();

  // Tail
  var tail = new Cube();
  tail.color = [0.5, 0.5, 0.5, 1.0];
  tail.matrix.translate(-0.4, -0.2, 0.0);
  // tail.matrix.rotate(20*Math.sin(g_seconds), 0, 0, 1);  // tail wag animation
  tail.matrix.rotate(g_tailAngle, 0, 0, 1);  // tail wag animation
  tail.matrix.scale(0.3, 0.1, 0.1);
  tail.render();

  // Front left leg
  var frontLeftLeg = new Cube();
  frontLeftLeg.color = [0.4, 0.4, 0.4, 1.0];
  frontLeftLeg.matrix.translate(0.2, -0.5, 0.2);
  frontLeftLeg.matrix.scale(0.1, 0.5, 0.1);
  frontLeftLeg.render();

  // Front right leg
  var frontRightLeg = new Cube();
  frontRightLeg.color = [0.4, 0.4, 0.4, 1.0];
  frontRightLeg.matrix.translate(0.2, -0.5, -0.2);
  frontRightLeg.matrix.scale(0.1, 0.5, 0.1);
  frontRightLeg.render();

  // Back left leg
  var backLeftLeg = new Cube();
  backLeftLeg.color = [0.4, 0.4, 0.4, 1.0];
  backLeftLeg.matrix.translate(-0.2, -0.5, 0.2);
  backLeftLeg.matrix.scale(0.1, 0.5, 0.1);
  backLeftLeg.render();

  // Back right leg
  var backRightLeg = new Cube();
  backRightLeg.color = [0.4, 0.4, 0.4, 1.0];
  backRightLeg.matrix.translate(-0.2, -0.5, -0.2);
  backRightLeg.matrix.scale(0.1, 0.5, 0.1);
  backRightLeg.render();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + (Math.floor(1000/duration))/10, "numdot");
}

// Set the text of an HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}