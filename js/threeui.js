/**
 * ThreeUI Engine — Career Pilot Enterprise Platform
 * Three.js 3D WebGL Neural Particle Mesh, Fluid Ambient Lighting, and 3D Card Physics
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. THREE.JS INTERACTIVE 3D NEURAL PARTICLE MESH
     ========================================================================== */
  function initThreeBackground() {
    if (prefersReducedMotion) return;

    let canvas = document.getElementById('three-bg');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'three-bg';
      canvas.className = 'three-canvas-bg';
      document.body.prepend(canvas);
    }

    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded. Falling back to CSS ambient glows.');
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Parameters
    const particleCount = window.innerWidth < 768 ? 55 : 110;
    const maxDistance = 65;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    const xRange = window.innerWidth < 768 ? 160 : 320;
    const yRange = 180;
    const zRange = 120;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * xRange;
      positions[i * 3 + 1] = (Math.random() - 0.5) * yRange;
      positions[i * 3 + 2] = (Math.random() - 0.5) * zRange;

      velocities.push({
        x: (Math.random() - 0.5) * 0.22,
        y: (Math.random() - 0.5) * 0.22,
        z: (Math.random() - 0.5) * 0.15
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create glowing circular particle texture
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = 64;
    canvasTexture.height = 64;
    const ctx = canvasTexture.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 122, 69, 1)');
    grad.addColorStop(0.35, 'rgba(255, 158, 114, 0.7)');
    grad.addColorStop(0.7, 'rgba(45, 212, 191, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    const particleTexture = new THREE.CanvasTexture(canvasTexture);

    const pointMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 6.5,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, pointMaterial);
    scene.add(particles);

    // Line Connections Geometry
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xff7a45,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending
    });

    const linesMesh = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      lineMaterial
    );
    scene.add(linesMesh);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    }, { passive: true });

    // Resize Handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth camera interpolation
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);

      // Update particle positions
      const pos = particles.geometry.attributes.position.array;
      const linePositions = [];

      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;

        // Boundary bounce
        if (Math.abs(pos[i * 3]) > xRange / 2) velocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > yRange / 2) velocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > zRange / 2) velocities[i].z *= -1;

        // Connect nearby points
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            linePositions.push(
              pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
              pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
            );
          }
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

      // Slow idle rotation
      particles.rotation.y += 0.0008;
      linesMesh.rotation.y += 0.0008;

      renderer.render(scene, camera);
    }

    animate();
  }

  /* ==========================================================================
     2. 3D CARD PARALLAX & SPECULAR GLOSS (Tilt Physics)
     ========================================================================== */
  function init3DCardParallax() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('[data-tilt], .stat-card, .glass-card, .price-card, .hero-phone');
    if (!cards.length) return;

    cards.forEach((card) => {
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
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.25s ease, border-color 0.25s ease';
      };

      const onMouseMove = (e) => {
        if (!isHovered) return;
        bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xPct = mouseX / bounds.width - 0.5;
        const yPct = mouseY / bounds.height - 0.5;

        const rotX = -yPct * 6.5;
        const rotY = xPct * 7.5;

        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

        if (sheen) {
          sheen.style.opacity = '1';
          sheen.style.background = `radial-gradient(circle 260px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.12), transparent 70%)`;
        }
      };

      const onMouseLeave = () => {
        isHovered = false;
        card.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.35s ease, border-color 0.35s ease';
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
     INITIALIZATION
     ========================================================================== */
  function init() {
    initThreeBackground();
    init3DCardParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CareerPilotThreeUI = {
    initThreeBackground,
    init3DCardParallax
  };
})();

