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


/* Accessibility Tools */
function initAccessibilityTools() {
  // Create accessibility widget HTML
  const a11yHTML = `
    <div class="a11y-widget" id="a11yWidget">
      <button class="a11y-toggle" id="a11yToggle" aria-label="Toggle accessibility tools" aria-expanded="false" aria-controls="a11yPanel">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6m0 4v.01"></path>
        </svg>
        <span class="sr-only">Accessibility</span>
      </button>
      
      <div class="a11y-panel" id="a11yPanel" role="region" aria-label="Accessibility controls">
        <div class="a11y-header">
          <h3>Accessibility Tools</h3>
          <button class="a11y-close" id="a11yClose" aria-label="Close accessibility panel">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="a11y-content">
          <div class="a11y-section">
            <label for="a11yTextSize" class="a11y-label">Text Size</label>
            <div class="a11y-control">
              <button class="a11y-btn-small" id="a11yTextSmall" aria-label="Decrease text size">A−</button>
              <input type="range" id="a11yTextSize" min="80" max="150" value="100" step="10" aria-label="Adjust text size percentage">
              <button class="a11y-btn-large" id="a11yTextLarge" aria-label="Increase text size">A+</button>
            </div>
            <span class="a11y-value" id="a11yTextValue">100%</span>
          </div>
          
          <div class="a11y-section">
            <label for="a11yContrast" class="a11y-label">
              <input type="checkbox" id="a11yContrast" aria-label="Toggle high contrast mode">
              <span>High Contrast</span>
            </label>
          </div>
          
          <div class="a11y-section">
            <label for="a11yDyslexia" class="a11y-label">
              <input type="checkbox" id="a11yDyslexia" aria-label="Toggle dyslexia-friendly font">
              <span>Dyslexia-Friendly Font</span>
            </label>
          </div>
          
          <div class="a11y-section">
            <label for="a11yLineHeight" class="a11y-label">Line Height</label>
            <div class="a11y-control">
              <button class="a11y-btn-small" id="a11yLineSmall" aria-label="Decrease line height">−</button>
              <input type="range" id="a11yLineHeight" min="1.2" max="2" value="1.6" step="0.1" aria-label="Adjust line height">
              <button class="a11y-btn-large" id="a11yLineLarge" aria-label="Increase line height">+</button>
            </div>
            <span class="a11y-value" id="a11yLineValue">1.6</span>
          </div>
          
          <div class="a11y-section">
            <label for="a11yFocusMode" class="a11y-label">
              <input type="checkbox" id="a11yFocusMode" aria-label="Toggle focus mode">
              <span>Focus Mode</span>
            </label>
          </div>
          
          <div class="a11y-section">
            <label for="a11yReadingGuide" class="a11y-label">
              <input type="checkbox" id="a11yReadingGuide" aria-label="Toggle reading guide">
              <span>Reading Guide</span>
            </label>
          </div>
          
          <div class="a11y-section">
            <label for="a11yTextToSpeech" class="a11y-label">
              <input type="checkbox" id="a11yTextToSpeech" aria-label="Toggle text-to-speech">
              <span>Text-to-Speech</span>
            </label>
          </div>
          
          <button class="a11y-reset" id="a11yReset">Reset to Default</button>
        </div>
      </div>
    </div>
  `;
  
  // Insert widget into the page
  document.body.insertAdjacentHTML('beforeend', a11yHTML);
  
  // Get elements
  const toggle = safeQuery('#a11yToggle');
  const panel = safeQuery('#a11yPanel');
  const closeBtn = safeQuery('#a11yClose');
  const textSizeInput = safeQuery('#a11yTextSize');
  const textSmallBtn = safeQuery('#a11yTextSmall');
  const textLargeBtn = safeQuery('#a11yTextLarge');
  const textValue = safeQuery('#a11yTextValue');
  const contrastCheckbox = safeQuery('#a11yContrast');
  const dyslexiaCheckbox = safeQuery('#a11yDyslexia');
  const lineHeightInput = safeQuery('#a11yLineHeight');
  const lineSmallBtn = safeQuery('#a11yLineSmall');
  const lineLargeBtn = safeQuery('#a11yLineLarge');
  const lineValue = safeQuery('#a11yLineValue');
  const focusModeCheckbox = safeQuery('#a11yFocusMode');
  const readingGuideCheckbox = safeQuery('#a11yReadingGuide');
  const textToSpeechCheckbox = safeQuery('#a11yTextToSpeech');
  const resetBtn = safeQuery('#a11yReset');
  
  // Reading guide element
  let readingGuide = null;
  
  // Load saved preferences
  function loadPreferences() {
    const saved = localStorage.getItem('a11yPreferences');
    if (saved) {
      const prefs = JSON.parse(saved);
      textSizeInput.value = prefs.textSize || 100;
      contrastCheckbox.checked = prefs.contrast || false;
      dyslexiaCheckbox.checked = prefs.dyslexia || false;
      lineHeightInput.value = prefs.lineHeight || 1.6;
      focusModeCheckbox.checked = prefs.focusMode || false;
      readingGuideCheckbox.checked = prefs.readingGuide || false;
      textToSpeechCheckbox.checked = prefs.textToSpeech || false;
      applyPreferences();
    }
  }
  
  // Apply preferences
  function applyPreferences() {
    const textSize = textSizeInput.value;
    const contrast = contrastCheckbox.checked;
    const dyslexia = dyslexiaCheckbox.checked;
    const lineHeight = lineHeightInput.value;
    const focusMode = focusModeCheckbox.checked;
    const readingGuide = readingGuideCheckbox.checked;
    const textToSpeech = textToSpeechCheckbox.checked;
    
    // Apply text size
    document.documentElement.style.fontSize = (16 * (textSize / 100)) + 'px';
    textValue.textContent = textSize + '%';
    
    // Apply line height
    document.body.style.lineHeight = lineHeight;
    lineValue.textContent = lineHeight;
    
    // Apply contrast
    if (contrast) {
      document.body.classList.add('a11y-high-contrast');
    } else {
      document.body.classList.remove('a11y-high-contrast');
    }
    
    // Apply dyslexia font
    if (dyslexia) {
      document.body.classList.add('a11y-dyslexia-font');
    } else {
      document.body.classList.remove('a11y-dyslexia-font');
    }
    
    // Apply focus mode
    if (focusMode) {
      document.body.classList.add('a11y-focus-mode');
    } else {
      document.body.classList.remove('a11y-focus-mode');
    }
    
    // Apply reading guide
    if (readingGuide) {
      enableReadingGuide();
    } else {
      disableReadingGuide();
    }
    
    // Save preferences
    const prefs = {
      textSize: textSize,
      contrast: contrast,
      dyslexia: dyslexia,
      lineHeight: lineHeight,
      focusMode: focusMode,
      readingGuide: readingGuide,
      textToSpeech: textToSpeech
    };
    localStorage.setItem('a11yPreferences', JSON.stringify(prefs));
  }
  
  // Reading guide functions
  function enableReadingGuide() {
    if (readingGuide) return;
    
    readingGuide = document.createElement('div');
    readingGuide.className = 'a11y-reading-guide';
    readingGuide.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 30px;
      background: rgba(201, 168, 76, 0.3);
      border-bottom: 2px solid var(--gold);
      pointer-events: none;
      z-index: 999;
    `;
    document.body.appendChild(readingGuide);
    
    document.addEventListener('mousemove', updateReadingGuide);
  }
  
  function disableReadingGuide() {
    if (readingGuide) {
      readingGuide.remove();
      readingGuide = null;
    }
    document.removeEventListener('mousemove', updateReadingGuide);
  }
  
  function updateReadingGuide(e) {
    if (!readingGuide) return;
    readingGuide.style.top = (e.clientY - 15) + 'px';
  }
  
  // Text-to-speech function
  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }
  
  // Add text-to-speech to main content
  textToSpeechCheckbox.addEventListener('change', () => {
    if (textToSpeechCheckbox.checked) {
      const mainContent = safeQuery('main');
      if (mainContent) {
        const text = mainContent.innerText;
        if (text) {
          speakText(text.substring(0, 500));
        }
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    applyPreferences();
  });
  
  // Toggle panel
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.contains('is-open');
    panel.classList.toggle('is-open', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });
  
  // Close panel
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
  
  // Text size controls
  textSizeInput.addEventListener('input', applyPreferences);
  textSmallBtn.addEventListener('click', () => {
    textSizeInput.value = Math.max(80, parseInt(textSizeInput.value) - 10);
    applyPreferences();
  });
  textLargeBtn.addEventListener('click', () => {
    textSizeInput.value = Math.min(150, parseInt(textSizeInput.value) + 10);
    applyPreferences();
  });
  
  // Line height controls
  lineHeightInput.addEventListener('input', applyPreferences);
  lineSmallBtn.addEventListener('click', () => {
    lineHeightInput.value = Math.max(1.2, (parseFloat(lineHeightInput.value) - 0.1).toFixed(1));
    applyPreferences();
  });
  lineLargeBtn.addEventListener('click', () => {
    lineHeightInput.value = Math.min(2, (parseFloat(lineHeightInput.value) + 0.1).toFixed(1));
    applyPreferences();
  });
  
  // Contrast and dyslexia toggles
  contrastCheckbox.addEventListener('change', applyPreferences);
  dyslexiaCheckbox.addEventListener('change', applyPreferences);
  focusModeCheckbox.addEventListener('change', applyPreferences);
  readingGuideCheckbox.addEventListener('change', applyPreferences);
  
  // Reset button
  resetBtn.addEventListener('click', () => {
    textSizeInput.value = 100;
    contrastCheckbox.checked = false;
    dyslexiaCheckbox.checked = false;
    lineHeightInput.value = 1.6;
    focusModeCheckbox.checked = false;
    readingGuideCheckbox.checked = false;
    textToSpeechCheckbox.checked = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    applyPreferences();
  });
  
  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#a11yWidget')) {
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Load saved preferences on page load
  loadPreferences();
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
  initAccessibilityTools();
  initContactForm();
});


/* Contact Form Handler with FormSubmit.co */
function initContactForm() {
  const contactForm = safeQuery('#contact-form');
  if (!contactForm) return;
  
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = safeQuery('#submitBtn');
    const submitText = safeQuery('#submitText');
    const formStatus = safeQuery('#formStatus');
    
    // Disable submit button
    submitBtn.disabled = true;
    const originalText = submitText.textContent;
    submitText.textContent = 'Sending...';
    
    try {
      // Create FormData from the form
      const formData = new FormData(contactForm);
      
      // Send using fetch API
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Show success message
        formStatus.style.display = 'block';
        formStatus.style.background = '#d4edda';
        formStatus.style.color = '#155724';
        formStatus.style.border = '1px solid #c3e6cb';
        formStatus.textContent = 'Message sent successfully! We\'ll get back to you soon.';
        
        // Reset form
        contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          formStatus.style.display = 'none';
        }, 5000);
      } else {
        throw new Error('Form submission failed');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show error message
      formStatus.style.display = 'block';
      formStatus.style.background = '#f8d7da';
      formStatus.style.color = '#721c24';
      formStatus.style.border = '1px solid #f5c6cb';
      formStatus.textContent = 'Error sending message. Please try again or contact us directly at axum.scholars12@gmail.com';
      
      // Hide error message after 5 seconds
      setTimeout(() => {
        formStatus.style.display = 'none';
      }, 5000);
    }
    
    // Re-enable submit button
    submitBtn.disabled = false;
    submitText.textContent = originalText;
  });
}

// Initialize contact form on page load
document.addEventListener("DOMContentLoaded", () => {
  initContactForm();
});
