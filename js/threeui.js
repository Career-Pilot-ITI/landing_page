/**
 * ThreeUI Engine — Career Pilot Platform
 * Lightweight, high-performance UI physics and micro-interactions
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. THREEUI 3D CARD PARALLAX & SPECULAR GLOSS (Tilt Physics)
     ========================================================================== */
  function init3DCardParallax() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('[data-threeui-tilt], .hero-phone, .card, .download-card, .price-card');
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

        const maxRotateX = card.classList.contains('hero-phone') ? 10 : 6;
        const maxRotateY = card.classList.contains('hero-phone') ? 14 : 8;

        const rotX = -yPct * maxRotateX;
        const rotY = xPct * maxRotateY;

        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

        // Position specular gloss sheen
        if (sheen) {
          sheen.style.opacity = '1';
          sheen.style.background = `radial-gradient(circle 260px at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.14), transparent 70%)`;
        }
      };

      const onMouseLeave = () => {
        isHovered = false;
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.35s ease';
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
     2. THREEUI MICRO-INTERACTIONS & GLOWING BUTTONS
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
     INITIALIZATION
     ========================================================================== */
  function init() {
    init3DCardParallax();
    initThreeUIMicroInteractions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CareerPilotThreeUI = {
    init3DCardParallax,
    initThreeUIMicroInteractions
  };
})();
