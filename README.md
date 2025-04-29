# Blocky Animal – 3D Wolf Model  
*CSE 160: Introduction to Computer Graphics*

---

## Overview

This project is a **3D blocky wolf** built using **WebGL** and **JavaScript** for CSE 160 (Introduction to Computer Graphics).  
The goal was to demonstrate **hierarchical modeling** and **matrix transformations** by constructing a recognizable animal shape entirely from cube primitives.

The wolf model includes a **body**, **legs**, **head**, **eyes**, **nose**, **mouth**, and **tail** — all connected and positioned through **translation**, **rotation**, and **scaling** operations.  
The project also implements **basic animation**, including **head rotation**, **tail wagging**, and **interactive camera rotation** using mouse drag or sliders.

---

## Technologies and Tools Used

- **JavaScript** – Core programming language
- **WebGL** – Rendering 3D graphics directly in the browser
- **HTML/CSS** – Web page and canvas setup
- **Matrix4 Class** – Managing transformations with 4x4 matrices
- **Custom Cube Class** – Creating, coloring, and rendering cubes
- **Event Listeners** – Handling mouse, slider, and button interactions

---

## How the Project Works

- The **body** serves as the **root object**.
- **Legs**, **head**, and **facial features** (eyes, nose, mouth) are created relative to the body's transformation matrix, using **hierarchical modeling**.
- **Facial features** are carefully positioned to form a pointed wolf-like snout and face using precise matrix operations.
- **Global Camera Rotation**: The entire model can be rotated around a vertical axis (y-axis) via a slider or by **dragging the mouse**, giving users control over the viewing angle.
- **Head Animation**: The wolf’s head can independently rotate left and right, simulating natural head movements.
- **Tail Animation**: An optional animated tail wagging motion can be toggled on and off through buttons.

Each cube follows this basic process:
1. Instantiate a `Cube` object.
2. Assign color and shading properties.
3. Set its individual **model matrix** using translations, scalings, and rotations.
4. Render it onto the WebGL canvas, composed with a **global rotation matrix** for overall camera movement.

---

## Features

- ✅ **Hierarchical Modeling**: Each body part depends on its parent transformation (e.g., eyes attached to head, head attached to body).
- ✅ **Matrix Transformations**: Use of `translate`, `scale`, and `rotate` to accurately position and size each cube.
- ✅ **Wolf-Like Design**: Emphasis on a slender body, long snout, upright posture, and pointed ears to mimic a wolf’s silhouette.
- ✅ **Head Rotation Animation**: Independently rotate the wolf’s head using a slider control.
- ✅ **Tail Animation**: Wagging tail animation can be toggled on or off.
- ✅ **Camera Control**:
  - **Rotation Slider**: Rotate the entire scene manually.
  - **Mouse Drag**: Click and drag the mouse horizontally across the canvas to rotate the scene freely.

---

## Controls and User Interaction

| Control | Description |
|:--------|:------------|
| **Head Rotation Slider** | Rotate the wolf’s head left and right (`g_headMovement`). |
| **Tail Rotation Slider** | Manually adjust the wolf's tail position (`g_tailAngle`). |
| **Animation Buttons** | Start (`On`) or Stop (`Off`) the tail wagging animation. |
| **Global Rotation Slider** | Rotate the entire wolf model around the y-axis. |
| **Mouse Drag** | Click and drag the mouse horizontally across the canvas to rotate the scene freely. |

These controls simulate natural animal behavior (e.g., looking around, wagging tail) and allow users to view the model dynamically from any angle.

---

## Code Structure Highlights

- **Shaders**: Vertex shader applies both `u_ModelMatrix` (individual object transforms) and `u_GlobalRotateMatrix` (camera angle).
- **Animation Loop**: The `tick()` function uses `requestAnimationFrame()` to render updated frames based on the passage of time and user input.
- **Mouse Events**:
  - `mousedown`: Start tracking mouse movement.
  - `mousemove`: Rotate scene according to mouse drag distance.
  - `mouseup`: Stop tracking movement.

- **UI Events**:
  - Sliders adjust head, tail, and camera rotation.
  - Buttons toggle tail animation on or off.

- **Global Variables**:
  - `g_globalAngle` – Camera's y-axis rotation angle.
  - `g_headMovement` – Head's left/right rotation angle.
  - `g_tailAngle` – Tail’s current rotation angle.
  - `g_tailAnimation` – Boolean to control tail animation state.

---

## Lessons and Key Concepts

- Mastery of **matrix stack** concepts for hierarchical modeling.
- Implementing **smooth user interactions** through event listeners.
- Understanding how **camera transformations** differ from **model transformations**.
- Building an interactive 3D model using only simple primitives (cubes) and transformations.
- Creating a **time-based animation loop** without external libraries.

---

## Future Improvements

- Add more body parts like ears, paws, or a detailed tail structure.
- Introduce more advanced animations (walking, running).
- Implement shading and lighting for improved realism.
- Export as a more general framework for creating other blocky animals.

---