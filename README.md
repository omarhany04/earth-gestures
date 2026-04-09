# Gesture Earth

Gesture Earth is a browser-based 3D globe controlled with hand gestures using `Three.js` and `MediaPipe Hands`.

The current build includes:
- A textured 3D Earth with atmosphere, clouds, starfield, and glow effects
- Webcam-based hand tracking
- One-hand pinch rotation
- Two-hand zoom
- One-fist energy pulse
- Two-fist overdrive spin
- Live camera preview and on-screen HUD

## Controls

- `One hand + pinch`: rotate the Earth
- `Two hands`: move hands apart or closer to zoom
- `One fist`: trigger the energy pulse
- `Two fists`: trigger overdrive spin

## Project Structure

```text
.
|-- index.html
|-- style.css
|-- main.js
|-- Logo.png
```

- `index.html`: page structure and external script/style includes
- `style.css`: layout, HUD, camera preview, and visual styling
- `main.js`: Three.js scene setup, MediaPipe gesture handling, animation loop, and effect logic
- `Logo.png`: favicon/logo asset

## Run Locally

Because webcam access works best on `localhost` or HTTPS, run the project through a local server instead of opening the file directly.

Option 1:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Option 2:

- Use VS Code Live Server
- Or any static file server you prefer

## Tech Stack

- `Three.js` for the 3D scene
- `MediaPipe Hands` for gesture tracking
- Plain `HTML`, `CSS`, and `JavaScript`

## Tips

- Keep your hands inside the camera frame
- Use decent lighting for better tracking
- Allow camera access when the browser asks
- If the favicon or camera behavior seems stale, hard refresh the page

## Notes

This project currently uses CDN imports and does not require a build step.
