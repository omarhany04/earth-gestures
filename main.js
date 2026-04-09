    const webglCanvas = document.getElementById("webgl");
    const overlayCanvas = document.getElementById("overlay");
    const overlayContext = overlayCanvas.getContext("2d");
    const video = document.getElementById("video");

    function isMobileView() {
      return window.matchMedia("(max-width: 720px)").matches;
    }

    function getRendererPixelRatio() {
      return Math.min(window.devicePixelRatio, isMobileView() ? 1.25 : 2);
    }

    function getOverlayPixelRatio() {
      return Math.min(window.devicePixelRatio, isMobileView() ? 1.5 : 2);
    }

    const modeValue = document.getElementById("modeValue");
    const zoomValue = document.getElementById("zoomValue");
    const trackingValue = document.getElementById("trackingValue");
    const hint = document.getElementById("hint");
    const hud = document.querySelector(".hud");
    const hudToggle = document.getElementById("hudToggle");
    const hudMediaQuery = window.matchMedia("(max-width: 720px)");

    let hudExpanded = false;

    function setHudExpanded(nextExpanded) {
      hudExpanded = nextExpanded;

      if (!hud) {
        return;
      }

      if (hudExpanded) {
        hud.classList.add("is-expanded");
        hud.classList.remove("is-collapsed");
      } else {
        hud.classList.add("is-collapsed");
        hud.classList.remove("is-expanded");
      }

      if (hudToggle) {
        hudToggle.textContent = hudExpanded ? "Collapse" : "Expand";
        hudToggle.setAttribute("aria-expanded", hudExpanded ? "true" : "false");
      }
    }

    function syncHudLayout() {
      if (!hud) {
        return;
      }

      if (hudMediaQuery.matches) {
        setHudExpanded(false);
      } else {
        hud.classList.remove("is-collapsed");
        hud.classList.remove("is-expanded");
        if (hudToggle) {
          hudToggle.setAttribute("aria-expanded", "false");
        }
      }
    }

    if (hudToggle) {
      hudToggle.addEventListener("click", () => {
        if (hudMediaQuery.matches) {
          setHudExpanded(!hudExpanded);
        }
      });
    }

    hudMediaQuery.addEventListener("change", () => {
      if (!hudMediaQuery.matches) {
        hudExpanded = false;
      }
      syncHudLayout();
    });

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      2400
    );
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    const initialDistance = isMobileView() ? 12.6 : 6.4;
    camera.position.set(0, 0, initialDistance);
    camera.lookAt(cameraTarget);

    const renderer = new THREE.WebGLRenderer({
      canvas: webglCanvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(getRendererPixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const earthRig = new THREE.Group();
    scene.add(earthRig);

    const hemisphereLight = new THREE.HemisphereLight(0xa4d4ff, 0x05070f, 0.85);
    scene.add(hemisphereLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.65);
    sunLight.position.set(5, 2.5, 6);
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(0x4ba8ff, 1.3, 40);
    rimLight.position.set(-8, -1, -5);
    scene.add(rimLight);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg"
    );
    const earthBump = textureLoader.load(
      "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg"
    );
    const earthSpecular = textureLoader.load(
      "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg"
    );
    const cloudTexture = textureLoader.load(
      "https://threejs.org/examples/textures/planets/earth_clouds_1024.png"
    );

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2, 96, 96),
      new THREE.MeshPhongMaterial({
        map: earthTexture,
        normalMap: earthBump,
        specularMap: earthSpecular,
        shininess: 18,
        specular: new THREE.Color(0x224466)
      })
    );
    earthRig.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.03, 96, 96),
      new THREE.MeshLambertMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.34,
        depthWrite: false
      })
    );
    earthRig.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.16, 96, 96),
      new THREE.MeshBasicMaterial({
        color: 0x4dc5ff,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      })
    );
    earthRig.add(atmosphere);

    const outerHalo = new THREE.Mesh(
      new THREE.SphereGeometry(2.55, 96, 96),
      new THREE.MeshBasicMaterial({
        color: 0x1b6cff,
        transparent: true,
        opacity: 0.035,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      })
    );
    earthRig.add(outerHalo);

    const orbitRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.42, 0.022, 20, 240),
      new THREE.MeshBasicMaterial({
        color: 0x71deff,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending
      })
    );
    orbitRing.rotation.x = Math.PI / 2.15;
    orbitRing.rotation.z = 0.22;
    earthRig.add(orbitRing);

    const pulseShell = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 96, 96),
      new THREE.MeshBasicMaterial({
        color: 0xff4d2d,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
      })
    );
    earthRig.add(pulseShell);

    const pulseCore = new THREE.Mesh(
      new THREE.SphereGeometry(2.06, 96, 96),
      new THREE.MeshBasicMaterial({
        color: 0xfff1a8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      })
    );
    earthRig.add(pulseCore);

    const shockwaveRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.32, 0.036, 20, 240),
      new THREE.MeshBasicMaterial({
        color: 0xff9b54,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      })
    );
    shockwaveRing.rotation.x = Math.PI / 2;
    earthRig.add(shockwaveRing);

    const blastRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.18, 0.05, 20, 240),
      new THREE.MeshBasicMaterial({
        color: 0xffd36a,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      })
    );
    blastRing.rotation.x = Math.PI / 2;
    blastRing.rotation.z = 0.28;
    earthRig.add(blastRing);

    const pulseFlash = new THREE.PointLight(0xff7a45, 0, 28);
    pulseFlash.position.set(0, 0, 4.5);
    scene.add(pulseFlash);

    const sparkCount = isMobileView() ? 120 : 180;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);
    const sparkDirections = [];

    for (let i = 0; i < sparkCount; i += 1) {
      sparkPositions[(i * 3) + 0] = 0;
      sparkPositions[(i * 3) + 1] = 0;
      sparkPositions[(i * 3) + 2] = 0;

      sparkColors[(i * 3) + 0] = 1;
      sparkColors[(i * 3) + 1] = 0.55 + (Math.random() * 0.2);
      sparkColors[(i * 3) + 2] = 0.18 + (Math.random() * 0.08);

      sparkDirections.push(new THREE.Vector3());
    }

    const sparkGeometry = new THREE.BufferGeometry();
    sparkGeometry.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeometry.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));

    const sparkCloud = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({
        size: 0.11,
        transparent: true,
        opacity: 0,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    earthRig.add(sparkCloud);

    const spinBands = new THREE.Group();

    const spinBandConfigs = [
      { radius: 2.65, tube: 0.028, x: Math.PI / 2.1, z: 0.18 },
      { radius: 2.92, tube: 0.024, x: Math.PI / 2.45, z: -0.34 },
      { radius: 3.18, tube: 0.02, x: Math.PI / 2.75, z: 0.56 }
    ];

    spinBandConfigs.forEach((config, index) => {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(config.radius, config.tube, 20, 240),
        new THREE.MeshBasicMaterial({
          color: index === 1 ? 0xffd36a : 0xff6a3d,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending
        })
      );
      band.rotation.x = config.x;
      band.rotation.z = config.z;
      spinBands.add(band);
    });

    earthRig.add(spinBands);

    const nodePositions = [];
    const nodeColors = [];

    for (let i = 0; i < 220; i += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 2.06;

      nodePositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      const tint = Math.random();
      nodeColors.push(0.45 + (tint * 0.25), 0.72 + (tint * 0.18), 1);
    }

    const nodesGeometry = new THREE.BufferGeometry();
    nodesGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(nodePositions, 3)
    );
    nodesGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(nodeColors, 3)
    );

    const networkNodes = new THREE.Points(
      nodesGeometry,
      new THREE.PointsMaterial({
        size: 0.05,
        transparent: true,
        opacity: 0.48,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    earthRig.add(networkNodes);

    const starPositions = [];
    const starColors = [];

    const starCount = isMobileView() ? 4500 : 9500;

    for (let i = 0; i < starCount; i += 1) {
      const radius = 900 + Math.random() * 1200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      starPositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      const shade = 0.7 + Math.random() * 0.3;
      starColors.push(shade, shade, 1);
    }

    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );
    starsGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(starColors, 3)
    );

    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        size: isMobileView() ? 1.6 : 2,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
      })
    );
    scene.add(stars);

    const gesture = {
      mode: "Booting",
      tracking: "Initializing camera",
      hint: "Requesting webcam access for gesture tracking.",
      zoomPercent: 100,
      rotationVelocityX: 0,
      rotationVelocityY: 0,
      rollTarget: 0,
      targetDistance: initialDistance,
      activeDistance: initialDistance,
      smoothedRotationInputX: 0,
      smoothedRotationInputY: 0,
      leftHand: null,
      rightHand: null,
      handsForOverlay: [],
      lastGrabPoint: null,
      lastTwoHandDistance: null,
      lastTwoHandMidpoint: null,
      lastTwoHandAngle: null,
      pulseHoldStart: null,
      pulseReady: true,
      overdriveHoldStart: null,
      overdriveReady: true,
      lastPulseAt: -Infinity,
      lastOverdriveAt: -Infinity,
      confidence: 0
    };

    const MIN_DISTANCE = 3.1;
    const MAX_DISTANCE = isMobileView() ? 18 : 10;
    const AUTO_SPIN = 0.0025;
    const ROTATION_DAMPING = 0.18;
    const CAMERA_DAMPING = 0.12;
    const ROLL_DAMPING = 0.08;
    const PULSE_HOLD_MS = 260;
    const OVERDRIVE_HOLD_MS = 380;
    const PULSE_DURATION_MS = 1200;
    const OVERDRIVE_FLASH_MS = 950;
    const ATMOSPHERE_BASE_OPACITY = 0.16;
    const HALO_BASE_OPACITY = 0.035;
    const ORBIT_RING_BASE_OPACITY = 0.18;
    const ATMOSPHERE_BASE_COLOR = new THREE.Color(0x4dc5ff);
    const ATMOSPHERE_BOOM_COLOR = new THREE.Color(0xff5c33);
    const HALO_BASE_COLOR = new THREE.Color(0x1b6cff);
    const HALO_BOOM_COLOR = new THREE.Color(0xff2d1f);
    const ORBIT_RING_BASE_COLOR = new THREE.Color(0x71deff);
    const ORBIT_RING_BOOM_COLOR = new THREE.Color(0xff6a3d);
    const PULSE_SHELL_BASE_COLOR = new THREE.Color(0xff4d2d);
    const PULSE_SHELL_HOT_COLOR = new THREE.Color(0xffd36a);
    const SHOCKWAVE_BASE_COLOR = new THREE.Color(0xff7a45);
    const SHOCKWAVE_HOT_COLOR = new THREE.Color(0xfff0a6);

    const HAND_CONNECTIONS = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17]
    ];

    function setHUD() {
      modeValue.textContent = gesture.mode;
      zoomValue.textContent = `${gesture.zoomPercent}%`;
      trackingValue.textContent = gesture.tracking;
      hint.innerHTML = `<strong>Status:</strong> ${gesture.hint}`;
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function lerp(start, end, alpha) {
      return start + ((end - start) * alpha);
    }

    function getHandednessLabel(results, index) {
      const entry = results.multiHandedness && results.multiHandedness[index];
      const classification = entry && entry.label ? entry.label : entry && entry.classification && entry.classification[0] ? entry.classification[0].label : null;
      return classification || (index === 0 ? "Left" : "Right");
    }

    function pointDistance(a, b) {
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function averagePoints(points) {
      const sum = points.reduce(
        (accumulator, point) => {
          accumulator.x += point.x;
          accumulator.y += point.y;
          return accumulator;
        },
        { x: 0, y: 0 }
      );

      return {
        x: sum.x / points.length,
        y: sum.y / points.length
      };
    }

    function getPalmCenter(hand) {
      return averagePoints([hand[0], hand[5], hand[9], hand[13], hand[17]]);
    }

    function getGrabPoint(hand) {
      return averagePoints([hand[8], hand[9]]);
    }

    function getPinchStrength(hand) {
      const tipDistance = pointDistance(hand[4], hand[8]);
      const palmWidth = pointDistance(hand[5], hand[17]);
      const ratio = palmWidth > 0 ? tipDistance / palmWidth : 1;
      return clamp(1 - ((ratio - 0.15) / 0.45), 0, 1);
    }

    function getClenchStrength(hand) {
      const palm = getPalmCenter(hand);
      const palmWidth = pointDistance(hand[5], hand[17]) || 1;
      const fingerTips = [8, 12, 16, 20];

      const curledFingers = fingerTips.reduce((sum, tipIndex) => {
        const ratio = pointDistance(hand[tipIndex], palm) / palmWidth;
        return sum + clamp(1 - ((ratio - 0.48) / 0.68), 0, 1);
      }, 0) / fingerTips.length;

      const thumbRatio = pointDistance(hand[4], hand[2]) / palmWidth;
      const thumbCurl = clamp(1 - ((thumbRatio - 0.26) / 0.6), 0, 1);

      return clamp((curledFingers * 0.82) + (thumbCurl * 0.18), 0, 1);
    }

    function assignHands(results) {
      const landmarks = results.multiHandLandmarks || [];
      const handedness = results.multiHandedness || [];

      gesture.leftHand = null;
      gesture.rightHand = null;
      gesture.handsForOverlay = [];

      landmarks.forEach((hand, index) => {
        const label = getHandednessLabel({ multiHandedness: handedness }, index);
        const pinchStrength = getPinchStrength(hand);
        const clenchStrength = getClenchStrength(hand);
        const palm = getPalmCenter(hand);
        const grab = getGrabPoint(hand);
        const descriptor = {
          landmarks: hand,
          label,
          palm,
          grab,
          pinchStrength,
          clenchStrength
        };

        gesture.handsForOverlay.push(descriptor);

        if (label === "Left") {
          gesture.leftHand = descriptor;
        } else if (label === "Right") {
          gesture.rightHand = descriptor;
        } else if (!gesture.leftHand) {
          gesture.leftHand = descriptor;
        } else {
          gesture.rightHand = descriptor;
        }
      });

      gesture.handsForOverlay.sort((firstHand, secondHand) => firstHand.palm.x - secondHand.palm.x);

      if (!gesture.leftHand && gesture.handsForOverlay[0]) {
        gesture.leftHand = gesture.handsForOverlay[0];
      }

      if (!gesture.rightHand && gesture.handsForOverlay[1]) {
        gesture.rightHand = gesture.handsForOverlay[1];
      }
    }

    function resetSingleHandState() {
      gesture.lastGrabPoint = null;
    }

    function resetTwoHandState() {
      gesture.lastTwoHandDistance = null;
      gesture.lastTwoHandMidpoint = null;
      gesture.lastTwoHandAngle = null;
    }

    function seedPulseSparks() {
      for (let i = 0; i < sparkCount; i += 1) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 2.05 + (Math.random() * 0.08);
        const spread = 0.5 + (Math.random() * 0.75);
        const offset = i * 3;

        sparkDirections[i].set(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        ).multiplyScalar(spread);

        sparkPositions[offset + 0] = sparkDirections[i].x * radius;
        sparkPositions[offset + 1] = sparkDirections[i].y * radius;
        sparkPositions[offset + 2] = sparkDirections[i].z * radius;
      }

      sparkGeometry.attributes.position.needsUpdate = true;
    }

    function triggerPulseBurst() {
      gesture.lastPulseAt = performance.now();
      gesture.mode = "Pulse Burst";
      gesture.tracking = "Energy fired";
      gesture.hint = "Single-hand squeeze detected. An energy pulse rippled through the globe.";
      gesture.smoothedRotationInputY += 0.03;
      seedPulseSparks();
    }

    function triggerOverdriveBurst() {
      gesture.lastOverdriveAt = performance.now();
      gesture.mode = "Overdrive Burst";
      gesture.tracking = "Spin surge";
      gesture.hint = "Double-fist squeeze detected. The globe kicked into overdrive.";
      gesture.smoothedRotationInputY += 0.4;
      gesture.smoothedRotationInputX += 0.08;
      gesture.rotationVelocityY += 0.22;
      gesture.rollTarget = clamp(gesture.rollTarget + 0.3, -0.65, 0.65);
    }

    function useSingleHandRotation(activeHand) {
      const now = performance.now();
      const pinching = activeHand.pinchStrength > 0.72;
      const clenching = activeHand.clenchStrength > 0.76;

      gesture.overdriveHoldStart = null;
      gesture.overdriveReady = true;

      if (clenching && !pinching) {
        gesture.mode = "Squeeze Charge";
        gesture.tracking = "1 hand live";
        gesture.hint = gesture.pulseReady
          ? "Hold a clenched fist briefly to fire an energy pulse."
          : "Release your fist to arm the next pulse.";

        resetTwoHandState();
        resetSingleHandState();

        if (gesture.pulseHoldStart === null) {
          gesture.pulseHoldStart = now;
        }

        if (gesture.pulseReady && (now - gesture.pulseHoldStart) >= PULSE_HOLD_MS) {
          triggerPulseBurst();
          gesture.pulseReady = false;
        }

        if (!gesture.pulseReady && (now - gesture.lastPulseAt) < 520) {
          gesture.mode = "Pulse Burst";
          gesture.tracking = "Energy fired";
        }

        return;
      }

      gesture.pulseHoldStart = null;
      gesture.pulseReady = true;

      gesture.mode = pinching ? "Grab Rotate" : "Hand Hover";
      gesture.tracking = "1 hand live";
      gesture.hint = pinching
        ? "Pinch with one hand and move it to rotate the Earth."
        : "One hand is visible. Pinch to rotate or clench into a fist to trigger a pulse.";

      resetTwoHandState();

      if (!pinching) {
        gesture.lastGrabPoint = null;
        return;
      }

      const currentGrab = activeHand.grab;

      if (gesture.lastGrabPoint) {
        const deltaX = currentGrab.x - gesture.lastGrabPoint.x;
        const deltaY = currentGrab.y - gesture.lastGrabPoint.y;

        gesture.smoothedRotationInputY = lerp(
          gesture.smoothedRotationInputY,
          deltaX * 10,
          0.34
        );
        gesture.smoothedRotationInputX = lerp(
          gesture.smoothedRotationInputX,
          deltaY * 8,
          0.34
        );
      }

      gesture.lastGrabPoint = currentGrab;
    }

    function useTwoHandZoom(leftHand, rightHand) {
      const now = performance.now();
      const doubleClench = leftHand.clenchStrength > 0.73 && rightHand.clenchStrength > 0.73;

      gesture.pulseHoldStart = null;
      gesture.pulseReady = true;

      if (doubleClench) {
        gesture.mode = "Dual Squeeze";
        gesture.tracking = "2 hands live";
        gesture.hint = gesture.overdriveReady
          ? "Hold both fists briefly to trigger overdrive spin."
          : "Release both fists to arm the next overdrive burst.";

        resetSingleHandState();
        resetTwoHandState();

        if (gesture.overdriveHoldStart === null) {
          gesture.overdriveHoldStart = now;
        }

        if (gesture.overdriveReady && (now - gesture.overdriveHoldStart) >= OVERDRIVE_HOLD_MS) {
          triggerOverdriveBurst();
          gesture.overdriveReady = false;
        }

        if (!gesture.overdriveReady && (now - gesture.lastOverdriveAt) < 640) {
          gesture.mode = "Overdrive Burst";
          gesture.tracking = "Spin surge";
        }

        return;
      }

      gesture.overdriveHoldStart = null;
      gesture.overdriveReady = true;

      gesture.mode = "Dual Zoom";
      gesture.tracking = "2 hands live";
      gesture.hint = "Keep both hands in frame. Move them apart to zoom in and closer together to zoom out. Clench both fists to trigger overdrive.";
      resetSingleHandState();

      const midpoint = averagePoints([leftHand.palm, rightHand.palm]);
      const distance = pointDistance(leftHand.palm, rightHand.palm);
      const angle = Math.atan2(
        rightHand.palm.y - leftHand.palm.y,
        rightHand.palm.x - leftHand.palm.x
      );

      if (gesture.lastTwoHandDistance !== null) {
        const distanceDelta = distance - gesture.lastTwoHandDistance;
        gesture.targetDistance = clamp(
          gesture.targetDistance - (distanceDelta * 11.5),
          MIN_DISTANCE,
          MAX_DISTANCE
        );
      }

      if (gesture.lastTwoHandMidpoint) {
        const midpointDeltaX = midpoint.x - gesture.lastTwoHandMidpoint.x;
        const midpointDeltaY = midpoint.y - gesture.lastTwoHandMidpoint.y;

        gesture.smoothedRotationInputY = lerp(
          gesture.smoothedRotationInputY,
          midpointDeltaX * 8,
          0.2
        );
        gesture.smoothedRotationInputX = lerp(
          gesture.smoothedRotationInputX,
          midpointDeltaY * 6.5,
          0.2
        );
      }

      if (gesture.lastTwoHandAngle !== null) {
        const angleDelta = angle - gesture.lastTwoHandAngle;
        gesture.rollTarget = clamp(
          gesture.rollTarget + angleDelta * 1.2,
          -0.45,
          0.45
        );
      }

      gesture.lastTwoHandDistance = distance;
      gesture.lastTwoHandMidpoint = midpoint;
      gesture.lastTwoHandAngle = angle;
    }

    function onResults(results) {
      assignHands(results);

      const handCount = gesture.handsForOverlay.length;

      if (handCount === 0) {
        gesture.mode = "Idle";
        gesture.tracking = "No hands";
        gesture.hint = "Show one hand and pinch to grab the globe, clench one fist for a pulse, or clench two fists to trigger overdrive spin.";
        resetSingleHandState();
        resetTwoHandState();
        gesture.pulseHoldStart = null;
        gesture.pulseReady = true;
        gesture.overdriveHoldStart = null;
        gesture.overdriveReady = true;
      } else if (handCount === 1) {
        useSingleHandRotation(gesture.handsForOverlay[0]);
      } else {
        useTwoHandZoom(gesture.handsForOverlay[0], gesture.handsForOverlay[1]);
      }

      const normalizedZoom = 1 - ((gesture.targetDistance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE));
      gesture.zoomPercent = Math.round(lerp(68, 142, normalizedZoom));
      gesture.confidence = gesture.handsForOverlay.reduce(
        (sum, hand) => sum + hand.pinchStrength,
        0
      ) / Math.max(1, handCount);

      setHUD();
      drawOverlay();
    }

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.75,
      minTrackingConfidence: 0.7
    });
    hands.onResults(onResults);

    const cameraWidth = isMobileView() ? 640 : 960;
    const cameraHeight = isMobileView() ? 480 : 720;

    const mediaPipeCamera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: cameraWidth,
      height: cameraHeight
    });

    async function startHandTracking() {
      try {
        await mediaPipeCamera.start();
        gesture.mode = "Ready";
        gesture.tracking = "Camera live";
        gesture.hint = "Show one hand and pinch to start rotating the planet.";
      } catch (error) {
        console.error("Unable to start MediaPipe camera:", error);
        gesture.mode = "Camera Blocked";
        gesture.tracking = "Permission needed";
        gesture.hint = "Webcam access is required for gesture navigation. Allow camera access and reload the page.";
      }

      setHUD();
    }

    function resizeOverlay() {
      const pixelRatio = getOverlayPixelRatio();
      overlayCanvas.width = Math.floor(window.innerWidth * pixelRatio);
      overlayCanvas.height = Math.floor(window.innerHeight * pixelRatio);
      overlayCanvas.style.width = `${window.innerWidth}px`;
      overlayCanvas.style.height = `${window.innerHeight}px`;
      overlayContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function drawHand(hand, index) {
      const hue = index === 0 ? "113, 222, 255" : "125, 255, 204";
      const solid = `rgba(${hue}, 0.95)`;
      const soft = `rgba(${hue}, 0.2)`;
      const gestureGlowStrength = Math.max(hand.pinchStrength, hand.clenchStrength * 0.9);
      const pinchGlow = `rgba(${hue}, ${0.12 + (gestureGlowStrength * 0.35)})`;

      overlayContext.lineWidth = 2;
      overlayContext.strokeStyle = soft;

      HAND_CONNECTIONS.forEach(([start, end]) => {
        const startPoint = hand.landmarks[start];
        const endPoint = hand.landmarks[end];

        overlayContext.beginPath();
        overlayContext.moveTo(startPoint.x * window.innerWidth, startPoint.y * window.innerHeight);
        overlayContext.lineTo(endPoint.x * window.innerWidth, endPoint.y * window.innerHeight);
        overlayContext.stroke();
      });

      hand.landmarks.forEach((point, pointIndex) => {
        const x = point.x * window.innerWidth;
        const y = point.y * window.innerHeight;
        const isKeyPoint = pointIndex === 4 || pointIndex === 8 || pointIndex === 9;

        overlayContext.beginPath();
        overlayContext.fillStyle = isKeyPoint ? solid : "rgba(255, 255, 255, 0.78)";
        overlayContext.arc(x, y, isKeyPoint ? 5 : 3, 0, Math.PI * 2);
        overlayContext.fill();
      });

      overlayContext.beginPath();
      overlayContext.fillStyle = pinchGlow;
      overlayContext.arc(
        hand.grab.x * window.innerWidth,
        hand.grab.y * window.innerHeight,
        18 + (gestureGlowStrength * 16),
        0,
        Math.PI * 2
      );
      overlayContext.fill();
    }

    function drawOverlay() {
      overlayContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

      gesture.handsForOverlay.forEach((hand, index) => {
        drawHand(hand, index);
      });

      if (gesture.handsForOverlay.length === 2) {
        const [firstHand, secondHand] = gesture.handsForOverlay;
        overlayContext.beginPath();
        overlayContext.strokeStyle = "rgba(255, 255, 255, 0.16)";
        overlayContext.lineWidth = 3;
        overlayContext.moveTo(
          firstHand.palm.x * window.innerWidth,
          firstHand.palm.y * window.innerHeight
        );
        overlayContext.lineTo(
          secondHand.palm.x * window.innerWidth,
          secondHand.palm.y * window.innerHeight
        );
        overlayContext.stroke();
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      const now = performance.now();
      const pulseStrength = clamp(1 - ((now - gesture.lastPulseAt) / PULSE_DURATION_MS), 0, 1);
      const overdriveStrength = clamp(1 - ((now - gesture.lastOverdriveAt) / OVERDRIVE_FLASH_MS), 0, 1);
      const pulseProgress = 1 - pulseStrength;
      const pulseBloom = Math.sin(pulseProgress * Math.PI);
      const overdriveProgress = 1 - overdriveStrength;
      const overdrivePulse = Math.sin(overdriveProgress * Math.PI * 10) * overdriveStrength;

      gesture.rotationVelocityX = lerp(
        gesture.rotationVelocityX,
        gesture.smoothedRotationInputX,
        ROTATION_DAMPING
      );
      gesture.rotationVelocityY = lerp(
        gesture.rotationVelocityY,
        gesture.smoothedRotationInputY,
        ROTATION_DAMPING
      );

      earthRig.rotation.y += AUTO_SPIN + gesture.rotationVelocityY;
      earthRig.rotation.x = clamp(
        earthRig.rotation.x + gesture.rotationVelocityX,
        -1.05,
        1.05
      );
      earthRig.rotation.z = lerp(earthRig.rotation.z, gesture.rollTarget, ROLL_DAMPING);
      earthRig.rotation.y += overdriveStrength * 0.18;

      clouds.rotation.y += 0.0018 + (overdriveStrength * 0.028);
      orbitRing.rotation.z += 0.0022 + (pulseStrength * 0.016) + (overdriveStrength * 0.08);
      orbitRing.rotation.y += 0.0016 + (overdriveStrength * 0.032);
      shockwaveRing.rotation.z += 0.012 + (overdriveStrength * 0.05);
      blastRing.rotation.z -= 0.022 + (overdriveStrength * 0.055);
      stars.rotation.y += 0.00005;
      stars.rotation.x += 0.000015 + (pulseStrength * 0.00028) + (overdriveStrength * 0.00026);

      gesture.smoothedRotationInputX *= 0.82;
      gesture.smoothedRotationInputY *= 0.82;
      gesture.rollTarget *= 0.97;

      gesture.activeDistance = lerp(
        gesture.activeDistance,
        gesture.targetDistance,
        CAMERA_DAMPING
      );
      camera.position.x = Math.sin(now * 0.024) * overdriveStrength * 0.22;
      camera.position.y = Math.cos(now * 0.028) * overdriveStrength * 0.16;
      camera.position.z = gesture.activeDistance + (overdriveStrength * 0.85) + (pulseBloom * 0.06);
      camera.lookAt(cameraTarget);

      pulseCore.scale.setScalar(1 + (pulseProgress * 0.14));
      pulseCore.material.opacity = pulseStrength * 0.52;
      pulseShell.scale.setScalar(1 + (pulseProgress * 0.78));
      pulseShell.material.opacity = (pulseStrength * 0.15) + (pulseBloom * 0.18);
      shockwaveRing.scale.setScalar(1 + (pulseProgress * 1.75));
      shockwaveRing.material.opacity = pulseStrength * 0.52;
      blastRing.scale.setScalar(1 + (pulseProgress * 1.08));
      blastRing.material.opacity = pulseStrength * 0.32;

      pulseCore.material.color.copy(PULSE_SHELL_HOT_COLOR).lerp(PULSE_SHELL_BASE_COLOR, pulseProgress * 0.5);
      pulseShell.material.color.copy(PULSE_SHELL_BASE_COLOR).lerp(PULSE_SHELL_HOT_COLOR, pulseBloom * 0.85);
      shockwaveRing.material.color.copy(SHOCKWAVE_BASE_COLOR).lerp(SHOCKWAVE_HOT_COLOR, pulseBloom * 0.7);
      blastRing.material.color.copy(SHOCKWAVE_HOT_COLOR).lerp(PULSE_SHELL_BASE_COLOR, pulseProgress * 0.6);
      atmosphere.material.color.copy(ATMOSPHERE_BASE_COLOR).lerp(ATMOSPHERE_BOOM_COLOR, (pulseStrength * 0.92) + (overdriveStrength * 0.22));
      outerHalo.material.color.copy(HALO_BASE_COLOR).lerp(HALO_BOOM_COLOR, (pulseStrength * 0.95) + (overdriveStrength * 0.28));
      orbitRing.material.color.copy(ORBIT_RING_BASE_COLOR).lerp(ORBIT_RING_BOOM_COLOR, (pulseStrength * 0.86) + (overdriveStrength * 0.42));

      atmosphere.material.opacity = ATMOSPHERE_BASE_OPACITY + (pulseStrength * 0.24) + (overdriveStrength * 0.18);
      outerHalo.material.opacity = HALO_BASE_OPACITY + (pulseStrength * 0.1) + (overdriveStrength * 0.09);
      orbitRing.material.opacity = ORBIT_RING_BASE_OPACITY + (pulseStrength * 0.24) + (overdriveStrength * 0.2);
      networkNodes.material.opacity = 0.48 + (pulseStrength * 0.32) + (overdriveStrength * 0.24);
      networkNodes.rotation.y += 0.0028 + (pulseStrength * 0.016) + (overdriveStrength * 0.05);
      networkNodes.rotation.x = Math.sin(now * 0.00025) * 0.12;
      stars.material.size = 2 + (pulseStrength * 1.9) + (overdriveStrength * 1.9);
      pulseFlash.intensity = (pulseBloom * 5.6) + (overdriveStrength * 2.6);
      pulseFlash.distance = 30 + (pulseStrength * 10) + (overdriveStrength * 8);

      spinBands.children.forEach((band, index) => {
        band.rotation.y += (0.018 + (index * 0.006)) * overdriveStrength;
        band.rotation.z += (index % 2 === 0 ? 1 : -1) * (0.024 + (index * 0.008)) * overdriveStrength;
        band.material.opacity = overdriveStrength * (0.34 - (index * 0.06));
      });

      for (let i = 0; i < sparkCount; i += 1) {
        const offset = i * 3;
        const travel = 2.05 + (pulseProgress * (2.1 + (sparkDirections[i].length() * 1.15)));

        sparkPositions[offset + 0] = sparkDirections[i].x * travel;
        sparkPositions[offset + 1] = sparkDirections[i].y * travel;
        sparkPositions[offset + 2] = sparkDirections[i].z * travel;
      }

      sparkGeometry.attributes.position.needsUpdate = pulseStrength > 0;
      sparkCloud.material.opacity = pulseStrength * 0.82;
      sparkCloud.material.size = 0.11 + (pulseStrength * 0.06) + (pulseBloom * 0.03);
      sparkCloud.rotation.y += 0.01 + (overdriveStrength * 0.03);
      sparkCloud.rotation.x += 0.004 + (overdrivePulse * 0.01);

      renderer.render(scene, camera);
    }

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(getRendererPixelRatio());
      renderer.setSize(window.innerWidth, window.innerHeight);
      resizeOverlay();
      drawOverlay();
    }

    window.addEventListener("resize", handleResize);

    resizeOverlay();
    setHUD();
    syncHudLayout();
    startHandTracking();
    animate();
