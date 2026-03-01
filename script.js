// script.js

// Year in footer
document.getElementById("y").textContent = new Date().getFullYear();

// Respect reduced motion
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll progress
const progressBar = document.querySelector(".progress__bar");
function updateProgress() {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${p}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Cursor glow (subtle)
const glow = document.querySelector(".cursor-glow");
if (!prefersReducedMotion) {
  let glowVisible = false;
  window.addEventListener("mousemove", (e) => {
    if (!glowVisible) {
      glow.style.opacity = "1";
      glowVisible = true;
    }
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  }, { passive: true });

  window.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
    glowVisible = false;
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll(".reveal");
if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add("is-visible"));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
}

// Smooth accordion for <details>
// We animate max-height + opacity/transform, and keep divider only on open
const accDetails = document.querySelectorAll("details.acc");
accDetails.forEach((d) => {
  const body = d.querySelector(".acc__body");
  if (!body) return;

  // Ensure closed state styles apply
  if (!d.open) {
    body.style.maxHeight = "0px";
  } else {
    // if initially open (unlikely)
    body.style.maxHeight = body.scrollHeight + "px";
    body.style.opacity = "1";
    body.style.transform = "translateY(0)";
  }

  d.addEventListener("toggle", () => {
    if (prefersReducedMotion) return;

    if (d.open) {
      // set to actual height to animate open
      body.style.maxHeight = body.scrollHeight + "px";
      // after transition, allow recalculation if content wraps
      setTimeout(() => {
        if (d.open) body.style.maxHeight = body.scrollHeight + "px";
      }, 420);
    } else {
      // animate close
      body.style.maxHeight = body.scrollHeight + "px";
      requestAnimationFrame(() => {
        body.style.maxHeight = "0px";
      });
    }
  });
});

// Small UX: close other cases when opening one (optional, premium feel)
accDetails.forEach((d) => {
  d.addEventListener("click", (e) => {
    if (!(e.target && e.target.closest("summary"))) return;
    if (d.open) return; // it will close, don't touch others
    accDetails.forEach((other) => {
      if (other !== d && other.open) other.open = false;
    });
  });
});
