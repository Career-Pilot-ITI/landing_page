/**
 * ThreeUI Engine — Career Pilot Platform
 * Based on ThreeUI procedural shaders & 3D components (by Design+Code / Meng To)
 * Tailored for high-performance WebGL visual enhancements, theme reactivity, and interactive AI visualization.
 */

(function () {
  'use strict';

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.warn('[ThreeUI] THREE is not loaded. Skipping 3D enhancements.');
    return;
  }

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme palettes for shaders
  const THEME_PALETTES = {
    cloud: {
      primary: 0x2563eb,     // Vibrant Blue
      secondary: 0x60a5fa,   // Light Sky Blue
      accent: 0x0ea5e9,      // Cyan
      orbitColor: 0x93c5fd,  // Soft Ice Blue
      haloColor: 0x3b82f6,
      ambientOpacity: 0.45,
      flowSpeed: 0.8
    },
    pulse: {
      primary: 0x0284c7,     // Deep Cyan
      secondary: 0x6366f1,   // Indigo
      accent: 0x38bdf8,      // Bright Cyan
      orbitColor: 0x818cf8,  // Indigo Orbit
      haloColor: 0x06b6d4,
      ambientOpacity: 0.55,
      flowSpeed: 0.95
    },
    midnight: {
      primary: 0x38bdf8,     // Electric Blue
      secondary: 0x818cf8,   // Neon Purple/Indigo
      accent: 0x34d399,      // Emerald Green
      orbitColor: 0x6366f1,  // Deep Indigo Orbit
      haloColor: 0x38bdf8,
      ambientOpacity: 0.65,
      flowSpeed: 1.1
    }
  };

  const getCurrentTheme = () => {
    return document.documentElement.dataset.theme || 'cloud';
  };

  const getPalette = () => {
    const t = getCurrentTheme();
    return THEME_PALETTES[t] || THEME_PALETTES.cloud;
  };

  // Registry for active 3D renderers to handle theme switches
  const activeRenderers = [];

  // Watch for theme changes on <html>
  const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const palette = getPalette();
        activeRenderers.forEach((renderer) => {
          if (typeof renderer.onThemeChange === 'function') {
            renderer.onThemeChange(palette);
          }
        });
      }
    });
  });
  themeObserver.observe(document.documentElement, { attributes: true });

  /* ==========================================================================
     1. HERO 3D STRUCTURE FLOW (ThreeUI StructureFlow / AtTheHorizon)
     ========================================================================== */
  function initHeroStructureFlow() {
    const heroContainers = document.querySelectorAll('[data-threeui-hero-bg]');
    if (!heroContainers.length) return;

    heroContainers.forEach((container) => {
      const canvas = document.createElement('canvas');
      canvas.className = 'threeui-hero-canvas';
      container.insertBefore(canvas, container.firstChild);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 12, 38);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      let width = container.clientWidth;
      let height = container.clientHeight;
      renderer.setSize(width, height, false);

      // Procedural 3D Wave Grid Particle System
      const countX = 65;
      const countZ = 65;
      const totalParticles = countX * countZ;
      const spacing = 1.4;
      const positions = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);
      const initialY = new Float32Array(totalParticles);

      const palette = getPalette();
      const colA = new THREE.Color(palette.primary);
      const colB = new THREE.Color(palette.secondary);
      const colC = new THREE.Color(palette.accent);

      let idx = 0;
      for (let ix = 0; ix < countX; ix++) {
        for (let iz = 0; iz < countZ; iz++) {
          const x = (ix - countX / 2) * spacing;
          const z = (iz - countZ / 2) * spacing;
          const dist = Math.sqrt(x * x + z * z);
          const y = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 3 - Math.pow(dist * 0.04, 2);

          positions[idx * 3] = x;
          positions[idx * 3 + 1] = y;
          positions[idx * 3 + 2] = z;
          initialY[idx] = y;

          // Color gradient from center outwards
          const ratio = Math.min(dist / 40, 1);
          const c = colA.clone().lerp(colB, ratio).lerp(colC, Math.sin(ix * 0.1) * 0.5 + 0.5);
          colors[idx * 3] = c.r;
          colors[idx * 3 + 1] = c.g;
          colors[idx * 3 + 2] = c.b;

          idx++;
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Particle texture dot
      const createDotTexture = () => {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
        const texture = new THREE.CanvasTexture(c);
        return texture;
      };

      const material = new THREE.PointsMaterial({
        size: 0.65,
        map: createDotTexture(),
        vertexColors: true,
        transparent: true,
        opacity: palette.ambientOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particleGrid = new THREE.Points(geometry, material);
      scene.add(particleGrid);

      // Subtle ambient floating dust particles in the foreground
      const dustCount = 70;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 60;
        dustPos[i * 3 + 1] = Math.random() * 25 - 5;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 40 + 10;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({
        size: 0.45,
        map: createDotTexture(),
        color: palette.accent,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const dustParticles = new THREE.Points(dustGeo, dustMat);
      scene.add(dustParticles);

      // Mouse Parallax
      let mouseX = 0;
      let mouseY = 0;
      let targetCameraX = 0;
      let targetCameraY = 12;

      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX = nx * 14;
        mouseY = -ny * 8;
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      // Resize handler
      const handleResize = () => {
        if (!container) return;
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };
      window.addEventListener('resize', handleResize, { passive: true });

      // Visibility & Animation Loop
      let isVisible = true;
      let animationFrameId = null;
      let clock = new THREE.Clock();

      const render = () => {
        if (!isVisible || prefersReducedMotion) return;

        const delta = clock.getDelta();
        const time = clock.getElapsedTime() * getPalette().flowSpeed;

        // Smooth camera lerp towards mouse
        targetCameraX += (mouseX - targetCameraX) * 0.04;
        targetCameraY += (12 + mouseY - targetCameraY) * 0.04;
        camera.position.x = targetCameraX;
        camera.position.y = targetCameraY;
        camera.lookAt(0, 0, 0);

        // Animate wave positions
        const posAttr = geometry.attributes.position;
        const posArr = posAttr.array;
        let pIdx = 0;

        for (let ix = 0; ix < countX; ix++) {
          for (let iz = 0; iz < countZ; iz++) {
            const x = posArr[pIdx * 3];
            const z = posArr[pIdx * 3 + 2];
            // Multi-frequency wave formula
            const wave1 = Math.sin(x * 0.18 + time * 1.2) * Math.cos(z * 0.18 + time * 0.9) * 2.8;
            const wave2 = Math.sin((x + z) * 0.12 + time * 0.8) * 1.5;
            posArr[pIdx * 3 + 1] = initialY[pIdx] + wave1 + wave2;
            pIdx++;
          }
        }
        posAttr.needsUpdate = true;

        // Gentle dust drift
        const dArr = dustGeo.attributes.position.array;
        for (let i = 0; i < dustCount; i++) {
          dArr[i * 3 + 1] += Math.sin(time + i) * 0.015;
          dArr[i * 3] += Math.cos(time * 0.5 + i) * 0.01;
        }
        dustGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(render);
      };

      // IntersectionObserver to pause when not visible
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationFrameId) {
          clock.start();
          animationFrameId = requestAnimationFrame(render);
        } else if (!isVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }, { threshold: 0.05 });

      observer.observe(container);
      animationFrameId = requestAnimationFrame(render);

      // Register theme change handler
      activeRenderers.push({
        onThemeChange: (newPalette) => {
          material.opacity = newPalette.ambientOpacity;
          dustMat.color.setHex(newPalette.accent);

          const cA = new THREE.Color(newPalette.primary);
          const cB = new THREE.Color(newPalette.secondary);
          const cC = new THREE.Color(newPalette.accent);
          const colArr = geometry.attributes.color.array;

          let cIdx = 0;
          for (let ix = 0; ix < countX; ix++) {
            for (let iz = 0; iz < countZ; iz++) {
              const x = (ix - countX / 2) * spacing;
              const z = (iz - countZ / 2) * spacing;
              const dist = Math.sqrt(x * x + z * z);
              const ratio = Math.min(dist / 40, 1);
              const c = cA.clone().lerp(cB, ratio).lerp(cC, Math.sin(ix * 0.1) * 0.5 + 0.5);
              colArr[cIdx * 3] = c.r;
              colArr[cIdx * 3 + 1] = c.g;
              colArr[cIdx * 3 + 2] = c.b;
              cIdx++;
            }
          }
          geometry.attributes.color.needsUpdate = true;
        }
      });
    });
  }

  /* ==========================================================================
     2. INTERACTIVE 3D AI INTELLIGENCE SPHERE (ThreeUI OrbitalSphere & Constellation)
     ========================================================================== */
  function initCareerIntelligenceSphere() {
    const mountEl = document.getElementById('threeui-ai-sphere');
    if (!mountEl) return;

    // Six core pillars of Career Pilot AI Engine
    const PILLARS = [
      {
        id: 'cv',
        name: 'CV Semantic Embeddings',
        track: 'CORE AI',
        metric: '1536d pgvector · Gemini 1.5 Pro',
        icon: '📄',
        color: 0x38bdf8,
        desc: 'Deep vector extraction, section clustering & semantic requirement gap analysis.',
        orbitRadius: 4.8,
        orbitSpeed: 0.35,
        orbitAngle: 0,
        orbitTiltX: 0.45,
        orbitTiltZ: 0.2
      },
      {
        id: 'star',
        name: 'STAR Rubric Scorer',
        track: 'COACHING',
        metric: '4-Dimension Behavioral Index',
        icon: '🌟',
        color: 0x818cf8,
        desc: 'Situation, Task, Action, Result multi-tier evaluation with actionable suggestions.',
        orbitRadius: 5.6,
        orbitSpeed: -0.28,
        orbitAngle: Math.PI * 0.4,
        orbitTiltX: -0.5,
        orbitTiltZ: 0.35
      },
      {
        id: 'vision',
        name: 'On-Device Computer Vision',
        track: 'MULTIMODAL',
        metric: '30 FPS MediaPipe Gaze & Posture',
        icon: '👁️',
        color: 0x34d399,
        desc: 'Real-time eye contact tracking and upper-body posture stability feedback.',
        orbitRadius: 4.2,
        orbitSpeed: 0.42,
        orbitAngle: Math.PI * 0.8,
        orbitTiltX: 0.25,
        orbitTiltZ: -0.45
      },
      {
        id: 'speech',
        name: 'Speech Analytics & WPM',
        track: 'DELIVERY',
        metric: '130-160 WPM Target · Filler Rate',
        icon: '🎙️',
        color: 0xf59e0b,
        desc: 'Speech-to-text pacing, filler word frequency, and delivery rhythm scoring.',
        orbitRadius: 5.2,
        orbitSpeed: -0.32,
        orbitAngle: Math.PI * 1.2,
        orbitTiltX: -0.35,
        orbitTiltZ: -0.3
      },
      {
        id: 'ats',
        name: 'ATS Vector Matcher',
        track: 'OPTIMIZATION',
        metric: '94% Match Precision · Google X-Y-Z',
        icon: '🎯',
        color: 0xec4899,
        desc: 'Vector cosine similarity with async bullet rewrites using Google X-Y-Z formula.',
        orbitRadius: 6.2,
        orbitSpeed: 0.22,
        orbitAngle: Math.PI * 1.6,
        orbitTiltX: 0.6,
        orbitTiltZ: 0.15
      },
      {
        id: 'arena',
        name: 'Competitive Arena & Gating',
        track: 'COMMUNITY',
        metric: 'Live Cohort Screenings',
        icon: '🏆',
        color: 0xa855f7,
        desc: 'Public sprints, private invite rounds, and creator dashboard analytics.',
        orbitRadius: 6.8,
        orbitSpeed: -0.18,
        orbitAngle: Math.PI * 1.9,
        orbitTiltX: -0.4,
        orbitTiltZ: 0.5
      }
    ];

    const canvas = document.createElement('canvas');
    canvas.className = 'threeui-sphere-canvas';
    mountEl.appendChild(canvas);

    // Create Tooltip Overlay Element
    const tooltip = document.createElement('div');
    tooltip.className = 'threeui-sphere-tooltip';
    tooltip.innerHTML = `
      <div class="sphere-tt-track"></div>
      <div class="sphere-tt-header">
        <span class="sphere-tt-icon"></span>
        <strong class="sphere-tt-name"></strong>
      </div>
      <div class="sphere-tt-metric"></div>
      <p class="sphere-tt-desc"></p>
    `;
    mountEl.appendChild(tooltip);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mountEl.clientWidth / mountEl.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight, false);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Core Neural Sphere
    const coreRadius = 1.8;
    const corePointsCount = 2400;
    const corePos = new Float32Array(corePointsCount * 3);
    const coreCols = new Float32Array(corePointsCount * 3);
    const coreColor = new THREE.Color(getPalette().primary);
    const coreAccent = new THREE.Color(getPalette().accent);

    for (let i = 0; i < corePointsCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / corePointsCount);
      const theta = Math.sqrt(corePointsCount * Math.PI) * phi;
      const noise = 1 + (Math.sin(phi * 6) * Math.cos(theta * 6)) * 0.08;
      const r = coreRadius * noise;

      corePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      corePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      corePos[i * 3 + 2] = r * Math.cos(phi);

      const mix = Math.random();
      const col = coreColor.clone().lerp(coreAccent, mix);
      coreCols[i * 3] = col.r;
      coreCols[i * 3 + 1] = col.g;
      coreCols[i * 3 + 2] = col.b;
    }

    const coreGeo = new THREE.BufferGeometry();
    coreGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
    coreGeo.setAttribute('color', new THREE.BufferAttribute(coreCols, 3));

    const coreMat = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const corePoints = new THREE.Points(coreGeo, coreMat);
    mainGroup.add(corePoints);

    // Inner glowing sphere core mesh
    const innerGeo = new THREE.SphereGeometry(coreRadius * 0.75, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: getPalette().primary,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerSphere);

    // 2. Orbital Rings and Satellite Node Meshes
    const nodeMeshes = [];
    const raycastTargets = [];
    const orbitLines = [];

    PILLARS.forEach((pillar) => {
      // Orbital Path Line
      const orbitGeo = new THREE.BufferGeometry();
      const orbitPoints = [];
      const segments = 90;
      for (let s = 0; s <= segments; s++) {
        const theta = (s / segments) * Math.PI * 2;
        orbitPoints.push(
          Math.cos(theta) * pillar.orbitRadius,
          0,
          Math.sin(theta) * pillar.orbitRadius
        );
      }
      orbitGeo.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));

      const orbitMat = new THREE.LineBasicMaterial({
        color: pillar.color,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitLine.rotation.x = pillar.orbitTiltX;
      orbitLine.rotation.z = pillar.orbitTiltZ;
      mainGroup.add(orbitLine);
      orbitLines.push({ line: orbitLine, pillar });

      // Satellite Node (Glow outer + Core inner)
      const nodeGroup = new THREE.Group();
      const nodeGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: pillar.color
      });
      const nodeCore = new THREE.Mesh(nodeGeo, nodeMat);
      nodeGroup.add(nodeCore);

      const haloGeo = new THREE.SphereGeometry(0.48, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: pillar.color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      const nodeHalo = new THREE.Mesh(haloGeo, haloMat);
      nodeGroup.add(nodeHalo);

      // Store node reference and userData for raycaster
      nodeGroup.userData = { pillar, halo: nodeHalo, core: nodeCore };
      mainGroup.add(nodeGroup);
      nodeMeshes.push({ group: nodeGroup, pillar, halo: nodeHalo, core: nodeCore });
      raycastTargets.push(nodeCore);
    });

    // 3. Constellation Connector Lines (Dynamic connecting rays)
    const connMax = 12;
    const connPositions = new Float32Array(connMax * 6);
    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute('position', new THREE.BufferAttribute(connPositions, 3));
    const connMat = new THREE.LineSegments(
      connGeo,
      new THREE.LineBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      })
    );
    mainGroup.add(connMat);

    // 4. Interactive Drag & Raycasting
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let hoveredNode = null;

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2(-999, -999);

    const onPointerDown = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const rect = mountEl.getBoundingClientRect();

      // Normalize mouse vector for raycasting
      mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        mainGroup.rotation.y += deltaX * 0.007;
        mainGroup.rotation.x += deltaY * 0.007;
        prevMouseX = clientX;
        prevMouseY = clientY;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    mountEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);

    mountEl.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Handle Resize
    const handleResize = () => {
      if (!mountEl) return;
      const w = mountEl.clientWidth;
      const h = mountEl.clientHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      if (w < 600) {
        camera.position.z = 18;
      } else {
        camera.position.z = 15;
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    // Animation Loop
    let isVisible = true;
    let animationFrameId = null;
    const clock = new THREE.Clock();

    const render = () => {
      if (!isVisible || prefersReducedMotion) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto rotation when not dragging
      if (!isDragging) {
        mainGroup.rotation.y += 0.0025;
        mainGroup.rotation.x = Math.sin(time * 0.2) * 0.1;
      }

      // Pulse core sphere
      corePoints.rotation.y += 0.001;
      corePoints.rotation.z += 0.0005;
      innerSphere.rotation.y -= 0.002;

      // Update Satellite Nodes on their 3D orbits
      let connIdx = 0;
      const connArr = connGeo.attributes.position.array;

      nodeMeshes.forEach((item, index) => {
        const p = item.pillar;
        const currentAngle = p.orbitAngle + time * p.orbitSpeed;

        // Position in orbital plane
        const localX = Math.cos(currentAngle) * p.orbitRadius;
        const localZ = Math.sin(currentAngle) * p.orbitRadius;

        // Apply orbital tilts
        const pos = new THREE.Vector3(localX, 0, localZ);
        pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), p.orbitTiltX);
        pos.applyAxisAngle(new THREE.Vector3(0, 0, 1), p.orbitTiltZ);

        item.group.position.copy(pos);

        // Pulse halo
        const scale = 1 + Math.sin(time * 3 + index) * 0.15;
        item.halo.scale.setScalar(scale);

        // Connect node to core or adjacent node with constellation line
        if (connIdx < connMax) {
          connArr[connIdx * 6] = 0;
          connArr[connIdx * 6 + 1] = 0;
          connArr[connIdx * 6 + 2] = 0;
          connArr[connIdx * 6 + 3] = pos.x;
          connArr[connIdx * 6 + 4] = pos.y;
          connArr[connIdx * 6 + 5] = pos.z;
          connIdx++;
        }
      });
      connGeo.attributes.position.needsUpdate = true;

      // Raycasting for interactive hover
      raycaster.setFromCamera(mouseVec, camera);
      const intersects = raycaster.intersectObjects(raycastTargets);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const nodeData = hitMesh.parent.userData;

        if (hoveredNode !== nodeData) {
          hoveredNode = nodeData;
          mountEl.style.cursor = 'pointer';

          // Show tooltip
          const p = nodeData.pillar;
          tooltip.querySelector('.sphere-tt-track').textContent = p.track;
          tooltip.querySelector('.sphere-tt-icon').textContent = p.icon;
          tooltip.querySelector('.sphere-tt-name').textContent = p.name;
          tooltip.querySelector('.sphere-tt-metric').textContent = p.metric;
          tooltip.querySelector('.sphere-tt-desc').textContent = p.desc;
          tooltip.classList.add('visible');
        }

        // Project 3D coordinate to 2D screen for tooltip positioning
        const worldPos = new THREE.Vector3();
        hitMesh.parent.getWorldPosition(worldPos);
        worldPos.project(camera);

        const rect = mountEl.getBoundingClientRect();
        const screenX = (worldPos.x * 0.5 + 0.5) * rect.width;
        const screenY = (-(worldPos.y * 0.5) + 0.5) * rect.height;

        tooltip.style.left = `${Math.min(Math.max(screenX, 20), rect.width - 240)}px`;
        tooltip.style.top = `${Math.min(Math.max(screenY - 120, 20), rect.height - 130)}px`;
      } else {
        if (hoveredNode) {
          hoveredNode = null;
          mountEl.style.cursor = 'grab';
          tooltip.classList.remove('visible');
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    // IntersectionObserver for performance
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationFrameId) {
        clock.start();
        animationFrameId = requestAnimationFrame(render);
      } else if (!isVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }, { threshold: 0.1 });

    observer.observe(mountEl);
    animationFrameId = requestAnimationFrame(render);

    // Register theme changes
    activeRenderers.push({
      onThemeChange: (newPalette) => {
        innerMat.color.setHex(newPalette.primary);
      }
    });
  }

  /* ==========================================================================
     3. THREEUI 3D CARD PARALLAX & SPECULAR GLOSS (ThreeUI Tilt Physics)
     ========================================================================== */
  function init3DCardParallax() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('[data-threeui-tilt], .hero-phone, .card, .download-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      // Add gloss sheen overlay if not present
      if (!card.querySelector('.threeui-gloss-sheen')) {
        const sheen = document.createElement('div');
        sheen.className = 'threeui-gloss-sheen';
        card.appendChild(sheen);
      }

      const sheen = card.querySelector('.threeui-gloss-sheen');
      let bounds;
      let isHovered = false;

      const onMouseEnter = () => {
        bounds = card.getBoundingClientRect();
        isHovered = true;
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.25s ease';
      };

      const onMouseMove = (e) => {
        if (!isHovered) return;
        bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xPct = mouseX / bounds.width - 0.5;
        const yPct = mouseY / bounds.height - 0.5;

        const maxRotateX = card.classList.contains('hero-phone') ? 14 : 9;
        const maxRotateY = card.classList.contains('hero-phone') ? 18 : 11;

        const rotX = -yPct * maxRotateX;
        const rotY = xPct * maxRotateY;

        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        // Position specular gloss sheen
        if (sheen) {
          sheen.style.opacity = '1';
          sheen.style.background = `radial-gradient(circle 280px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.18), transparent 70%)`;
        }
      };

      const onMouseLeave = () => {
        isHovered = false;
        card.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (sheen) {
          sheen.style.opacity = '0';
        }
      };

      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);
    });
  }

  /* ==========================================================================
     4. THREEUI MICRO-INTERACTIONS & GLOWING LUMEN BUTTONS
     ========================================================================== */
  function initThreeUIMicroInteractions() {
    const primaryButtons = document.querySelectorAll('.btn-primary');
    primaryButtons.forEach((btn) => {
      btn.classList.add('threeui-lumen-btn');
    });

    const sparkBadges = document.querySelectorAll('.eyebrow, .badge-tag, .orbit-tag');
    sparkBadges.forEach((badge) => {
      badge.classList.add('threeui-spark-badge');
    });
  }

  /* ==========================================================================
     INITIALIZATION ON DOM CONTENT LOADED
     ========================================================================== */
  function init() {
    initHeroStructureFlow();
    initCareerIntelligenceSphere();
    init3DCardParallax();
    initThreeUIMicroInteractions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export to window for debugging or manual reinitialization
  window.CareerPilotThreeUI = {
    initHeroStructureFlow,
    initCareerIntelligenceSphere,
    init3DCardParallax,
    initThreeUIMicroInteractions,
    getPalette
  };

})();
