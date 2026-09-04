if (window.location.hash === '#top') {
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');
const siteHeader = document.querySelector('.site-header');
const progressBar = document.querySelector('.scroll-progress span');
const hero = document.querySelector('.hero');
const heroVisual = document.querySelector('.hero-visual');
const menuBackground = document.querySelectorAll('.skip-link, main, .site-footer');
let menuScrollPosition = 0;

if (heroVisual && window.matchMedia('(max-width: 980px)').matches && 'IntersectionObserver' in window) {
  const heroVisualObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    heroVisual.classList.add('is-rendered');
    heroVisualObserver.disconnect();
  }, { rootMargin: '0px', threshold: 0 });
  heroVisualObserver.observe(heroVisual);
} else {
  heroVisual?.classList.add('is-rendered');
}

function closeMenu() {
  const wasOpen = document.body.classList.contains('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  navigation.classList.remove('is-open');
  menuBackground.forEach((element) => { element.inert = false; });
  document.documentElement.classList.remove('menu-open');
  document.body.classList.remove('menu-open');
  document.body.style.removeProperty('top');

  if (wasOpen) {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, menuScrollPosition);
    if (previousScrollBehavior) root.style.scrollBehavior = previousScrollBehavior;
    else root.style.removeProperty('scroll-behavior');
  }
}

function openMenu() {
  menuScrollPosition = window.scrollY;
  document.body.style.top = `-${menuScrollPosition}px`;
  document.documentElement.classList.add('menu-open');
  document.body.classList.add('menu-open');
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Close navigation');
  navigation.classList.add('is-open');
  menuBackground.forEach((element) => { element.inert = true; });
  navigation.scrollTop = 0;
}

menuButton.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  if (willOpen) openMenu();
  else closeMenu();
});

navigation.querySelectorAll('a:not([href^="#"])').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')].filter(
  (link) => link.getAttribute('href') !== '#top'
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      sectionLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  },
  { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
);

sectionLinks.forEach((link) => {
  const section = document.querySelector(link.getAttribute('href'));
  if (section) sectionObserver.observe(section);
});

let pageScrollFrame;
let pageScrollPreviousBehavior = null;

function restorePageScrollBehavior() {
  if (pageScrollPreviousBehavior === null) return;
  if (pageScrollPreviousBehavior) document.documentElement.style.scrollBehavior = pageScrollPreviousBehavior;
  else document.documentElement.style.removeProperty('scroll-behavior');
  pageScrollPreviousBehavior = null;
}

function cancelPageScroll() {
  if (!pageScrollFrame) return;
  cancelAnimationFrame(pageScrollFrame);
  pageScrollFrame = undefined;
  restorePageScrollBehavior();
}

function scrollPageTo(targetY, onComplete) {
  const startY = window.scrollY;
  const destinationY = Math.max(0, Math.min(targetY, document.documentElement.scrollHeight - window.innerHeight));
  const distance = destinationY - startY;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  if (pageScrollPreviousBehavior === null) pageScrollPreviousBehavior = root.style.scrollBehavior;

  if (pageScrollFrame) cancelAnimationFrame(pageScrollFrame);

  if (reduceMotion || Math.abs(distance) < 2) {
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: destinationY, behavior: 'auto' });
    restorePageScrollBehavior();
    onComplete?.();
    return;
  }

  const startedAt = performance.now();
  const duration = Math.min(900, Math.max(520, Math.abs(distance) * 0.28));
  root.style.scrollBehavior = 'auto';

  function move(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    window.scrollTo(0, Math.round(startY + distance * eased));

    if (progress < 1) {
      pageScrollFrame = requestAnimationFrame(move);
      return;
    }

    pageScrollFrame = undefined;
    restorePageScrollBehavior();
    onComplete?.();
  }

  pageScrollFrame = requestAnimationFrame(move);
}

document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    const target = hash === '#top' ? document.getElementById('top') : document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    closeMenu();

    if (hash === '#top') {
      history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    } else if (window.location.hash !== hash) {
      history.pushState(null, '', hash);
    }
    const headerOffset = hash === '#top' ? 0 : window.innerWidth <= 980 ? 78 : 96;

    const settleLanding = (attempt = 0) => {
      if (hash === '#top') {
        refreshPageScrollRange();
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const drift = target.getBoundingClientRect().top - headerOffset;
          if (Math.abs(drift) > 2 && attempt < 2) {
            scrollPageTo(window.scrollY + drift, () => settleLanding(attempt + 1));
            return;
          }
          refreshPageScrollRange();
        });
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const targetY = hash === '#top'
          ? 0
          : target.getBoundingClientRect().top + window.scrollY - headerOffset;
        scrollPageTo(targetY, settleLanding);
      });
    });
  });
});

document.querySelectorAll('[data-scroll-top]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    closeMenu();
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    scrollPageTo(0, refreshPageScrollRange);
  });
});

window.addEventListener('wheel', cancelPageScroll, { passive: true });
window.addEventListener('touchstart', cancelPageScroll, { passive: true });

// iOS Safari can ignore CSS overscroll containment on the root scroller.
// Block only outward swipes at the document boundaries; normal page and menu
// scrolling remain untouched.
let boundaryTouchY = 0;
document.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) boundaryTouchY = event.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchmove', (event) => {
  if (!event.cancelable || event.touches.length !== 1 || event.target.closest?.('.site-nav.is-open')) return;

  const currentTouchY = event.touches[0].clientY;
  const movementY = currentTouchY - boundaryTouchY;
  const maximumScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const movingPastTop = window.scrollY <= 0 && movementY > 0;
  const movingPastBottom = window.scrollY >= maximumScrollY - 1 && movementY < 0;

  boundaryTouchY = currentTouchY;
  if (movingPastTop || movingPastBottom) event.preventDefault();
}, { passive: false });

document.addEventListener('keydown', (event) => {
  if (!document.body.classList.contains('menu-open')) return;

  if (event.key === 'Escape') {
    closeMenu();
    menuButton.focus({ preventScroll: true });
    return;
  }

  if (event.key !== 'Tab') return;

  const focusableElements = [...siteHeader.querySelectorAll('a[href], button:not([disabled])')].filter(
    (element) => getComputedStyle(element).visibility !== 'hidden'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 980 && document.body.classList.contains('menu-open')) closeMenu();
});

const observer = new IntersectionObserver(
  (entries) => {
    let revealedContent = false;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
        revealedContent = true;
      }
    });
    if (revealedContent && !pageResizeObserver) requestAnimationFrame(refreshPageScrollRange);
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const ambientMotionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-motion-active', entry.isIntersecting));
  },
  { rootMargin: '12% 0px 12% 0px', threshold: 0.04 }
);

document.querySelectorAll('.section-signal, .timeline, .contact-marquee').forEach((element) => ambientMotionObserver.observe(element));

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = Number(counter.dataset.count || 0);
      const suffix = counter.dataset.suffix || '';
      const startedAt = performance.now();
      const duration = 1100;

      function tick(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.7 }
);

document.querySelectorAll('[data-count]').forEach((counter) => {
  counter.textContent = `0${counter.dataset.suffix || ''}`;
  counterObserver.observe(counter);
});

let scrollFrame;
let maxPageScroll = 1;
let observedPageHeight = 0;
let pageResizeObserver;

function refreshPageScrollRange() {
  maxPageScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

function updateScrollDetails() {
  const currentScrollY = window.scrollY;
  const progress = currentScrollY / maxPageScroll;
  progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
  siteHeader.classList.toggle('is-scrolled', currentScrollY > 40);
  scrollFrame = undefined;
}

window.addEventListener(
  'scroll',
  () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollDetails);
  },
  { passive: true }
);

if (window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    hero.style.setProperty('--pointer-x', `${x}%`);
    hero.style.setProperty('--pointer-y', `${y}%`);
  });
}

const portraitLogoStage = document.querySelector('.portrait-logo-stage');
const portraitLogoMotion = document.querySelector('.portrait-logo-motion');
const reducedLogoMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (portraitLogoStage && portraitLogoMotion && !reducedLogoMotion) {
  const compactLogoLayout = window.matchMedia('(max-width: 980px), (pointer: coarse)').matches;
  let portraitLogoStarted = false;

  const startPortraitLogoMotion = () => {
    if (portraitLogoStarted) return;
    portraitLogoStarted = true;
    document.body.classList.add('ambient-ready');
    portraitLogoMotion.addEventListener('load', () => portraitLogoStage.classList.add('is-motion-ready'), { once: true });
    portraitLogoMotion.addEventListener('error', () => portraitLogoMotion.remove(), { once: true });
    if (compactLogoLayout) {
      const mobileAnimationSource = new URL(portraitLogoMotion.dataset.animationMobileSrc, document.baseURI);
      mobileAnimationSource.searchParams.set('play', String(Math.round(performance.timeOrigin)));
      portraitLogoMotion.src = mobileAnimationSource.href;
    } else {
      portraitLogoMotion.src = portraitLogoMotion.dataset.animationSrc;
    }
    if (portraitLogoMotion.complete && portraitLogoMotion.naturalWidth > 0) portraitLogoStage.classList.add('is-motion-ready');
  };

  if (compactLogoLayout && 'IntersectionObserver' in window) {
    const portraitLogoObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        portraitLogoObserver.disconnect();
        window.setTimeout(startPortraitLogoMotion, 250);
      },
      { rootMargin: '0px', threshold: 0.35 }
    );
    portraitLogoObserver.observe(portraitLogoStage);
  } else {
    window.addEventListener('load', () => {
      window.setTimeout(startPortraitLogoMotion, compactLogoLayout ? 250 : 9000);
    }, { once: true });
  }
} else if (portraitLogoMotion) {
  portraitLogoMotion.remove();
}

const projectGrid = document.getElementById('project-grid');
const projectsToggle = document.querySelector('.projects-toggle');

if (projectGrid && projectsToggle) {
  const projectCards = [...projectGrid.querySelectorAll('.project-card')];
  const initialProjectCount = 2;
  const totalProjects = projectCards.length;
  const extraProjectCards = projectCards.slice(initialProjectCount);
  const projectsToggleLabel = projectsToggle.querySelector('.projects-toggle-label');
  const projectsToggleCount = projectsToggle.querySelector('.projects-toggle-count');
  const workHeading = projectGrid.closest('.work')?.querySelector('.work-heading');
  const lightweightProjects = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  let projectsExpanded = false;
  let projectsBusy = false;

  const animateProjectGridHeight = async (fromHeight, toHeight) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lightweightProjects || reduceMotion || Math.abs(fromHeight - toHeight) < 2) return;

    projectGrid.classList.add('is-toggling');
    const animation = projectGrid.animate(
      [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }],
      { duration: 520, easing: 'cubic-bezier(.2,.75,.2,1)' }
    );

    await animation.finished.catch(() => {});
    animation.cancel();
    projectGrid.classList.remove('is-toggling');
  };

  const updateProjectsToggle = () => {
    projectsToggle.setAttribute('aria-expanded', String(projectsExpanded));
    projectsToggleLabel.textContent = projectsExpanded ? 'Show less' : 'View all projects';
    projectsToggleCount.textContent = `${String(projectsExpanded ? totalProjects : initialProjectCount).padStart(2, '0')} / ${String(totalProjects).padStart(2, '0')}`;
  };

  const scrollToWorkHeading = (reduceMotion) => new Promise((resolve) => {
    if (!workHeading) {
      resolve();
      return;
    }

    const scrollMargin = Number.parseFloat(getComputedStyle(workHeading).scrollMarginTop) || 0;
    const startPosition = window.scrollY;
    let headingDocumentTop = 0;
    let headingOffsetParent = workHeading;

    while (headingOffsetParent) {
      headingDocumentTop += headingOffsetParent.offsetTop;
      headingOffsetParent = headingOffsetParent.offsetParent;
    }

    const targetPosition = Math.max(0, headingDocumentTop - scrollMargin);
    const distance = targetPosition - startPosition;
    const pageRoot = document.documentElement;
    const previousScrollBehavior = pageRoot.style.scrollBehavior;

    if (lightweightProjects) {
      if (reduceMotion || Math.abs(distance) < 2) {
        window.scrollTo({ top: targetPosition, behavior: 'auto' });
        resolve();
        return;
      }

      const duration = Math.min(900, Math.max(650, Math.abs(distance) * 0.14));
      pageRoot.style.scrollBehavior = 'auto';
      let startedAt;

      const move = (timestamp) => {
        startedAt ??= timestamp;
        const progress = Math.min((timestamp - startedAt) / duration, 1);
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        window.scrollTo(0, Math.round(startPosition + distance * eased));

        if (progress < 1) {
          window.requestAnimationFrame(move);
          return;
        }

        pageRoot.style.scrollBehavior = previousScrollBehavior;
        resolve();
      };

      window.requestAnimationFrame(move);
      return;
    }

    pageRoot.style.scrollBehavior = 'auto';

    if (reduceMotion || Math.abs(distance) < 2) {
      window.scrollTo(0, targetPosition);
      pageRoot.style.scrollBehavior = previousScrollBehavior;
      resolve();
      return;
    }

    const duration = Math.min(1100, Math.max(760, Math.abs(distance) * .18));
    let startTime;

    const scrollFrame = (timestamp) => {
      startTime ??= timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = progress < .5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (progress < 1) {
        window.requestAnimationFrame(scrollFrame);
      } else {
        pageRoot.style.scrollBehavior = previousScrollBehavior;
        resolve();
      }
    };

    window.requestAnimationFrame(scrollFrame);
  });

  const toggleProjects = async () => {
    if (projectsBusy) return;

    projectsBusy = true;
    projectsToggle.disabled = true;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!projectsExpanded) {
      const previousHeight = projectGrid.offsetHeight;
      extraProjectCards.forEach((card) => {
        card.hidden = false;
        card.classList.add('is-visible');
      });
      const nextHeight = projectGrid.offsetHeight;

      const enterAnimations = reduceMotion || lightweightProjects ? [] : extraProjectCards.map((card, index) => card.animate(
        [
          { opacity: 0, filter: 'blur(5px)', transform: 'translateY(42px) scale(.975)' },
          { opacity: 1, filter: 'blur(0)', transform: 'translateY(0) scale(1)' }
        ],
        { duration: 560, delay: index * 72, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
      ));

      projectsExpanded = true;
      updateProjectsToggle();
      await Promise.all([
        animateProjectGridHeight(previousHeight, nextHeight),
        ...enterAnimations.map((animation) => animation.finished.catch(() => {}))
      ]);
      enterAnimations.forEach((animation) => animation.cancel());
    } else {
      await scrollToWorkHeading(reduceMotion);

      const exitAnimations = reduceMotion || lightweightProjects ? [] : [...extraProjectCards].reverse().map((card, index) => card.animate(
        [
          { opacity: 1, filter: 'blur(0)', transform: 'translateY(0) scale(1)' },
          { opacity: 0, filter: 'blur(4px)', transform: 'translateY(24px) scale(.985)' }
        ],
        { duration: 260, delay: index * 26, easing: 'ease-in', fill: 'both' }
      ));

      await Promise.all(exitAnimations.map((animation) => animation.finished.catch(() => {})));
      const previousHeight = projectGrid.offsetHeight;
      extraProjectCards.forEach((card) => { card.hidden = true; });
      exitAnimations.forEach((animation) => animation.cancel());
      const nextHeight = projectGrid.offsetHeight;

      projectsExpanded = false;
      updateProjectsToggle();
      await animateProjectGridHeight(previousHeight, nextHeight);
    }

    projectsToggle.disabled = false;
    projectsBusy = false;
    refreshPageScrollRange();
  };

  projectCards.forEach((card, index) => { card.hidden = index >= initialProjectCount; });
  projectsToggle.addEventListener('click', toggleProjects);
  updateProjectsToggle();
}

const actionTargets = document.querySelectorAll('a[href], button:not([disabled])');

actionTargets.forEach((target) => {
  let pressTimer;

  const press = () => {
    clearTimeout(pressTimer);
    target.classList.add('is-pressing');
  };

  const release = () => {
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => target.classList.remove('is-pressing'), 140);
  };

  target.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    press();
  });
  ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach((eventName) => {
    target.addEventListener(eventName, release);
  });
  target.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') press();
  });
  target.addEventListener('keyup', release);
});

if (window.matchMedia('(hover: none)').matches) {
  const touchTargets = document.querySelectorAll('.button, .nav-contact, .phone-link, .project-card, .expertise-row, .skill-pills span');

  touchTargets.forEach((target) => {
    let releaseTimer;

    target.addEventListener('pointerdown', () => {
      clearTimeout(releaseTimer);
      target.classList.add('is-touch-active');
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
      target.addEventListener(eventName, () => {
        releaseTimer = setTimeout(() => target.classList.remove('is-touch-active'), 420);
      });
    });
  });
}

if ('ResizeObserver' in window) {
  pageResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    const borderBox = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;
    observedPageHeight = Math.ceil(borderBox?.blockSize || entry.contentRect.height);
    maxPageScroll = Math.max(1, observedPageHeight - window.innerHeight);
    updateScrollDetails();
  });
  pageResizeObserver.observe(document.body);
} else {
  refreshPageScrollRange();
  window.addEventListener('load', refreshPageScrollRange, { once: true });
  document.fonts?.ready.then(refreshPageScrollRange);
}
window.addEventListener('resize', () => requestAnimationFrame(() => {
  if (pageResizeObserver) maxPageScroll = Math.max(1, observedPageHeight - window.innerHeight);
  else refreshPageScrollRange();
  updateScrollDetails();
}), { passive: true });
document.getElementById('year').textContent = new Date().getFullYear();
