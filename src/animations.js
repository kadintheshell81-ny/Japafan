/**
 * animations.js — Japafan Animation Layer
 * Applies: GSAP stagger, AOS scroll reveals, tsParticles starfield
 * Skill: frontend-design/animation-guide.md
 *
 * Rules applied from skill:
 * - Animate only transform/opacity (GPU-accelerated)
 * - Entering = ease-out, exiting = ease-in
 * - Stagger for lists: proportional to item count
 * - Respect prefers-reduced-motion
 * - Delays that frustrate users are anti-patterns → keep stagger ≤ 0.08s
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';
import 'aos/dist/aos.css';

gsap.registerPlugin(ScrollTrigger);

// ── Reduced motion check ───────────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==========================================================================
// 1. AOS — Scroll-triggered reveals on all major sections
// ==========================================================================
export function initAOS() {
  if (prefersReducedMotion) return;

  AOS.init({
    duration: 480,          // Standard transition (200-300ms base + card weight)
    easing: 'ease-out-cubic', // Entering = ease-out (settling)
    once: true,             // Only animate in once — not on scroll up
    offset: 60,             // Trigger 60px before element enters viewport
    delay: 0,
    anchorPlacement: 'top-bottom',
  });
}

// ==========================================================================
// 2. GSAP — Anime card stagger entrance when grid renders
// ==========================================================================
export function animateCardGrid(selector = '.anime-card') {
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll(selector);
  if (!cards.length) return;

  // Kill previous instances to avoid stacking
  gsap.killTweensOf(cards);

  gsap.fromTo(cards,
    { y: 36, opacity: 0, scale: 0.97 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.52,       // Complex entrance: 300-500ms range from skill
      ease: 'power2.out',   // Ease-out = cards arrive/settle naturally
      stagger: {
        each: 0.07,         // 70ms between each card — fast enough to not frustrate
        from: 'start',
      },
      clearProps: 'transform',
    }
  );
}

// ==========================================================================
// 3. GSAP — Hero section entrance (page load)
// ==========================================================================
export function animateHeroEntrance() {
  if (prefersReducedMotion) return;

  const hero = document.querySelector('.discover-hero');
  const h1   = document.querySelector('.hero-content h1');
  const p    = document.querySelector('.hero-content p');
  const search = document.querySelector('.search-bar-container');

  if (!hero) return;

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.fromTo(hero,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.55 }
  )
  .fromTo([h1, p, search],
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.45, stagger: 0.1 },
    '-=0.3'   // Overlap: start 300ms before previous finishes
  );
}

// ==========================================================================
// 4. GSAP — 3D tilt on anime card hover
// ==========================================================================
export function initCardTilt(selector = '.anime-card') {
  if (prefersReducedMotion) return;

  document.querySelectorAll(selector).forEach(card => {
    const handleMove = (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2); // -1 to 1
      const dy     = (e.clientY - cy) / (rect.height / 2); // -1 to 1

      gsap.to(card, {
        rotateX: -dy * 6,       // Max 6° tilt — subtle, premium feel
        rotateY:  dx * 6,
        duration: 0.25,
        ease: 'power1.out',
        transformPerspective: 800,
        transformOrigin: 'center center',
      });
    };

    const handleLeave = () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.45,
        ease: 'power2.out',   // Settle back slowly = luxurious
        clearProps: 'rotateX,rotateY',
      });
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
  });
}

// ==========================================================================
// 5. GSAP ScrollTrigger — Section heading reveals
// ==========================================================================
export function initScrollRevealSections() {
  if (prefersReducedMotion) return;

  // Reveal section titles as they enter view
  gsap.utils.toArray('.section-title, .panel-title, h2, h3').forEach(el => {
    if (el.closest('.toast-message') || el.closest('.modal')) return; // Skip toasts/modals

    gsap.fromTo(el,
      { opacity: 0, x: -20 },
      {
        opacity: 1, x: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',   // Trigger when element is 90% down viewport
          toggleActions: 'play none none none',
        },
      }
    );
  });
}

// ==========================================================================
// 6. tsParticles — Teal starfield background on hero
// ==========================================================================
export async function initStarfield(containerId = 'hero-particles') {
  if (prefersReducedMotion) return;

  // Lazy-load tsparticles to avoid bundle bloat
  try {
    const { tsParticles } = await import('tsparticles');
    const tsparticlesSlim = await import('tsparticles-slim');
    const loadSlim = tsparticlesSlim.loadSlim || tsparticlesSlim.default?.loadSlim;
    if (loadSlim) await loadSlim(tsParticles);

    await tsParticles.load({
      id: containerId,
      options: {
        fpsLimit: 40,
        background: { color: { value: 'transparent' } },
        particles: {
          color:  { value: ['#00f0ff', '#ff007f', '#8b5cf6'] }, // neon-cyan, neon-pink, purple
          links:  { enable: false },
          move: {
            enable: true,
            speed: 0.4,       // Very slow drift — ambient, not distracting
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'out' },
          },
          number: {
            value: 55,        // Enough for atmosphere, not overwhelming
            density: { enable: true, area: 900 },
          },
          opacity: {
            value: { min: 0.05, max: 0.35 },
            animation: { enable: true, speed: 0.5, minimumValue: 0.05, sync: false },
          },
          shape: { type: 'circle' },
          size: {
            value: { min: 0.8, max: 2.2 },
            animation: { enable: false },
          },
        },
        detectRetina: true,
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'repulse' },
          },
          modes: {
            repulse: { distance: 60, duration: 0.4 },
          },
        },
      },
    });
  } catch (err) {
    console.warn('tsParticles not loaded:', err);
  }
}

// ==========================================================================
// 7. GSAP — Tab switch page transition (called from switchTab)
// ==========================================================================
export function animateTabSwitch(incomingEl) {
  if (prefersReducedMotion || !incomingEl) return;

  gsap.fromTo(incomingEl,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
  );
}

// ==========================================================================
// 8. GSAP — Pulse a button to draw attention
// ==========================================================================
export function pulseElement(selector) {
  if (prefersReducedMotion) return;
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) return;

  gsap.fromTo(el,
    { scale: 1 },
    {
      scale: 1.06,
      duration: 0.18,
      ease: 'power1.out',
      yoyo: true,
      repeat: 1,
    }
  );
}
