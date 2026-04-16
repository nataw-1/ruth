function safeQuery(selector, root = document) {
  return root.querySelector(selector);
}

function safeQueryAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function initRevealOnScroll() {
  const revealEls = safeQueryAll(".reveal");
  if (revealEls.length === 0) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  revealEls.forEach((el) => obs.observe(el));
}

function initNavbarScrollState() {
  const header = safeQuery(".site-header");
  if (!header) return;

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initTypewriter() {
  const el = safeQuery("[data-typewriter]");
  if (!el) return; // only on Home

  const full = el.textContent || "";
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    el.classList.add("is-done");
    return;
  }

  el.textContent = "";
  let i = 0;
  const speedMs = 55;

  function tick() {
    i += 1;
    el.textContent = full.slice(0, i);
    if (i < full.length) {
      window.setTimeout(tick, speedMs);
    } else {
      el.classList.add("is-done");
    }
  }

  window.setTimeout(tick, 260);
}

function initHeroParallax() {
  const img = safeQuery(".hero__img");
  const particles = safeQuery(".hero__particles");
  if (!img) return;

  let ticking = false;
  let lastY = window.scrollY || 0;

  function onScroll() {
    lastY = window.scrollY || 0;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const imgOffset = Math.min(lastY * 0.1, 48);
      img.style.transform = `translate3d(0, ${imgOffset}px, 0) scale(1)`;
      if (particles) {
        const pOffset = Math.min(lastY * 0.06, 38);
        particles.style.transform = `translate3d(${-pOffset * 0.2}px, ${pOffset}px, 0)`;
      }
      ticking = false;
    });
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initPageTransitions() {
  document.body.classList.add("is-ready");

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const a = target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return;
    if (a.hasAttribute("download")) return;
    if (a.target && a.target !== "_self") return;
    if (/^https?:\/\//i.test(href)) return;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

    // Only intercept local html navigation
    if (!href.endsWith(".html") && !href.includes(".html#")) return;

    e.preventDefault();
    document.body.classList.add("is-leaving");
    window.setTimeout(() => {
      window.location.href = href;
    }, 180);
  });
}

function initCountUp() {
  const els = safeQueryAll("[data-countup]");
  if (els.length === 0) return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function animate(el) {
    const to = Number(el.getAttribute("data-countup") || "0");
    if (!Number.isFinite(to)) return;
    if (prefersReducedMotion) {
      el.textContent = String(to);
      return;
    }

    const duration = 900;
    const start = performance.now();
    const from = 0;

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.35 }
  );

  els.forEach((el) => obs.observe(el));
}

function initMobileNav() {
  const toggle = safeQuery(".nav__toggle");
  const links = safeQuery("#navLinks");
  if (!toggle || !links) return;

  function setOpen(isOpen) {
    links.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.contains("is-open");
    setOpen(!isOpen);
  });

  // Close on link click (mobile)
  links.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("a")) setOpen(false);
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (toggle.contains(target) || links.contains(target)) return;
    setOpen(false);
  });

  // Close on resize up
  window.addEventListener("resize", () => {
    if (window.innerWidth > 780) setOpen(false);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPageTransitions();
  initRevealOnScroll();
  initMobileNav();
  initNavbarScrollState();
  initTypewriter();
  initHeroParallax();
  initCountUp();
});

