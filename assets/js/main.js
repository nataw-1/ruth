function safeQuery(selector, root = document) {
  return root.querySelector(selector);
}

function safeQueryAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function initRevealOnScroll() {
  const revealEls = safeQueryAll(".reveal");
  if (revealEls.length === 0) return;

  if (prefersReducedMotion()) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        
        setTimeout(() => {
          entry.target.classList.add("is-visible");
        }, entry.target.dataset.delay || 0);
        
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
  );

  revealEls.forEach((el) => obs.observe(el));
}

function initStaggeredReveal() {
  const containers = safeQueryAll(".reveal-stagger");
  if (containers.length === 0) return;

  if (prefersReducedMotion()) {
    containers.forEach(c => {
      safeQueryAll(".reveal", c).forEach(el => el.classList.add("is-visible"));
    });
    return;
  }

  containers.forEach((container, containerIndex) => {
    const items = safeQueryAll(".reveal", container);
    
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          
          const childItems = safeQueryAll(".reveal", entry.target);
          childItems.forEach((item, index) => {
            item.style.transitionDelay = `${index * 80}ms`;
            setTimeout(() => {
              item.classList.add("is-visible");
            }, index * 80);
          });
          
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    
    obs.observe(container);
  });
}

function initNavbarScrollState() {
  const header = safeQuery(".site-header");
  if (!header) return;

  let lastScrollY = 0;
  let ticking = false;

  function onScroll() {
    lastScrollY = window.scrollY;
    
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle("is-scrolled", lastScrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initTypewriter() {
  const el = safeQuery("[data-typewriter]");
  if (!el) return;

  const full = el.textContent || "";

  if (prefersReducedMotion()) {
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
      setTimeout(() => el.classList.add("is-done"), 300);
    }
  }

  setTimeout(tick, 400);
}

function initHeroParallax() {
  const hero = safeQuery(".hero");
  if (!hero) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const heroImg = safeQuery(".hero__img");
      const particles = safeQuery(".hero__particles");
      
      if (heroImg) {
        const offset = Math.min(scrollY * 0.12, 60);
        heroImg.style.transform = `translate3d(0, ${offset}px, 0) scale(1.02)`;
      }
      
      if (particles) {
        const pOffset = Math.min(scrollY * 0.08, 45);
        particles.style.transform = `translate3d(${-pOffset * 0.15}px, ${pOffset * 0.5}px, 0)`;
      }
      
      ticking = false;
    });
  }

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

    if (!href.endsWith(".html") && !href.includes(".html#")) return;

    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => {
      window.location.href = href;
    }, 200);
  });
}

function initCountUp() {
  const els = safeQueryAll("[data-countup]");
  if (els.length === 0) return;

  function animate(el) {
    const to = Number(el.getAttribute("data-countup") || "0");
    if (!Number.isFinite(to)) return;
    
    if (prefersReducedMotion()) {
      el.textContent = String(to);
      return;
    }

    const duration = 1200;
    const start = performance.now();
    const from = 0;

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
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
        setTimeout(() => animate(entry.target), 300);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
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
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.contains("is-open");
    setOpen(!isOpen);
  });

  links.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("a")) setOpen(false);
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (toggle.contains(target) || links.contains(target)) return;
    setOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 780) setOpen(false);
  });
}

function initCursorTrail() {
  if (prefersReducedMotion()) return;
  if (window.innerWidth < 1024) return;

  const cursor = document.createElement("div");
  cursor.className = "cursor-trail";
  cursor.style.cssText = `
    position: fixed;
    width: 12px;
    height: 12px;
    background: var(--gold);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s;
    mix-blend-mode: multiply;
  `;
  document.body.appendChild(cursor);

  let lastX = 0, lastY = 0;
  let ticking = false;

  document.addEventListener("mousemove", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;

    if (!ticking) {
      requestAnimationFrame(() => {
        cursor.style.left = lastX - 6 + "px";
        cursor.style.top = lastY - 6 + "px";
        cursor.style.opacity = 0.6;
        ticking = false;
      });
      ticking = true;
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = 0;
  });

  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = 0.6;
  });
}

function initHoverSounds() {
  const cards = safeQueryAll(".card, .btn, .nav__link, .resource-card__link, .social-card");
  
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      card.style.transitionDuration = "200ms";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPageTransitions();
  initRevealOnScroll();
  initStaggeredReveal();
  initMobileNav();
  initNavbarScrollState();
  initTypewriter();
  initHeroParallax();
  initCountUp();
});