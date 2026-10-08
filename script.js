const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const loadingScreen = document.querySelector('.loading-screen');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const commandPalette = document.querySelector('.command-palette');
const commandTrigger = document.querySelector('[data-open-command]');
const revealItems = document.querySelectorAll('.reveal-up');
const tiltCards = document.querySelectorAll('.tilt-card');
const statNumbers = document.querySelectorAll('[data-target]');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const networkCanvas = document.getElementById('networkCanvas');
const terminalBody = document.getElementById('terminalBody');

const terminalCommands = [
  { command: '$ whoami', output: 'rasya — network enthusiast' },
  { command: '$ status', output: '● available' },
  { command: '$ interests', output: 'mikrotik / ftth / vlan / linux' },
  { command: '$ uptime', output: 'networking since school' },
  { command: '$ connect', output: '> waiting for connection...' }
];

function hideLoadingScreen() {
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 1200);
  }
}

function initScrambleText() {
  const target = document.querySelector('[data-scramble]');
  if (!target || reduceMotion) return;

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let iteration = 0;

  const scramble = () => {
    target.textContent = target.textContent
      .split('')
      .map((char, index) => {
        if (index < iteration) return target.dataset.value ? target.dataset.value[index] : char;
        return letters[Math.floor(Math.random() * letters.length)];
      })
      .join('');

    if (iteration <= target.dataset.value.length) {
      iteration += 1 / 2;
      requestAnimationFrame(scramble);
    }
  };

  target.dataset.value = target.textContent;
  target.textContent = target.dataset.value.split('').map(() => 'A').join('');
  scramble();
}

function initRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((el) => observer.observe(el));
}

function animateCounters() {
  statNumbers.forEach((numberEl) => {
    const target = Number(numberEl.dataset.target || 0);
    const duration = 1200;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      numberEl.textContent = current >= 999 && target >= 999 ? '∞' : current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        numberEl.textContent = target >= 999 ? '∞' : target;
      }
    }

    requestAnimationFrame(update);
  });
}

function initTiltCards() {
  if (reduceMotion) return;

  tiltCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = (0.5 - (y / rect.height)) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

function initNavbar() {
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function openCommandPalette() {
  commandPalette.classList.add('visible');
  commandPalette.setAttribute('aria-hidden', 'false');
}

function closeCommandPalette() {
  commandPalette.classList.remove('visible');
  commandPalette.setAttribute('aria-hidden', 'true');
}

function initCommandPalette() {
  if (!commandTrigger || !commandPalette) return;

  commandTrigger.addEventListener('click', openCommandPalette);
  commandPalette.addEventListener('click', (event) => {
    if (event.target === commandPalette) closeCommandPalette();
  });

  document.addEventListener('keydown', (event) => {
    const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (isCtrlK) {
      event.preventDefault();
      commandPalette.classList.contains('visible') ? closeCommandPalette() : openCommandPalette();
    }

    if (event.key === 'Escape' && commandPalette.classList.contains('visible')) {
      closeCommandPalette();
    }
  });
}

function initCursor() {
  if (window.innerWidth < 640 || reduceMotion) {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
    return;
  }

  window.addEventListener('pointermove', (event) => {
    const x = event.clientX;
    const y = event.clientY;
    cursorDot.style.transform = `translate(${x}px, ${y}px)`;
    cursorRing.style.transform = `translate(${x}px, ${y}px)`;
  });

  document.querySelectorAll('a, button, .node, .project-card, .skill-card').forEach((element) => {
    element.addEventListener('pointerenter', () => {
      cursorRing.style.width = '42px';
      cursorRing.style.height = '42px';
      cursorRing.style.borderColor = 'rgba(98,242,255,0.8)';
    });

    element.addEventListener('pointerleave', () => {
      cursorRing.style.width = '30px';
      cursorRing.style.height = '30px';
      cursorRing.style.borderColor = 'rgba(98,242,255,0.45)';
    });
  });
}

function initNodeInfo() {
  const nodes = document.querySelectorAll('.node');
  nodes.forEach((node) => {
    const info = node.dataset.info;
    if (!info) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    tooltip.textContent = info;
    document.body.appendChild(tooltip);

    node.addEventListener('pointermove', (event) => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translate(-50%, 0)';
      tooltip.style.left = `${event.clientX}px`;
      tooltip.style.top = `${event.clientY + 18}px`;
    });

    node.addEventListener('pointerleave', () => {
      tooltip.style.opacity = '0';
    });
  });
}

function addMapTooltipStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .map-tooltip {
      position: fixed;
      left: 0;
      top: 0;
      transform: translate(-50%, 8px);
      padding: 8px 12px;
      border-radius: 10px;
      background: rgba(10,15,20,0.9);
      border: 1px solid rgba(98,242,255,0.24);
      color: var(--text);
      font-family: "JetBrains Mono", monospace;
      letter-spacing: 0.08em;
      font-size: 0.64rem;
      text-transform: uppercase;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.18s ease, transform 0.18s ease;
      z-index: 200;
      box-shadow: 0 8px 24px rgba(0,0,0,0.28);
    }
  `;
  document.head.appendChild(style);
}

function initCanvasParticles() {
  if (!networkCanvas) return;

  const ctx = networkCanvas.getContext('2d');
  const particles = [];
  const particleCount = window.innerWidth < 640 ? 28 : 55;

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    networkCanvas.width = window.innerWidth * ratio;
    networkCanvas.height = window.innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      alpha: Math.random() * 0.7 + 0.2
    };
  }

  function rebuildParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) particles.push(createParticle());
  }

  function render() {
    if (document.hidden) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > window.innerWidth) p.x = Math.random() * window.innerWidth;
      if (p.y < 0 || p.y > window.innerHeight) p.y = Math.random() * window.innerHeight;

      ctx.beginPath();
      ctx.fillStyle = `rgba(98, 242, 255, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i += 1) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(98, 242, 255, ${0.14 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  resizeCanvas();
  rebuildParticles();
  requestAnimationFrame(render);
  window.addEventListener('resize', () => {
    resizeCanvas();
    rebuildParticles();
  });
}

function initTerminalTyping() {
  if (!terminalBody) return;

  const fragment = document.createDocumentFragment();
  let index = 0;

  function renderLine(line, isCommand = false) {
    const lineEl = document.createElement('span');
    lineEl.className = 'terminal-line';
    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = isCommand ? '' : '>';
    const value = document.createTextNode(line);
    lineEl.appendChild(promptSpan);
    lineEl.appendChild(value);
    fragment.appendChild(lineEl);
  }

  const walk = () => {
    if (index >= terminalCommands.length) {
      terminalBody.appendChild(fragment);
      return;
    }

    const item = terminalCommands[index];
    const commandLine = document.createElement('span');
    commandLine.className = 'terminal-line';
    commandLine.innerHTML = `<span class="terminal-prompt">${item.command}</span>`;
    terminalBody.appendChild(commandLine);

    const outputLine = document.createElement('span');
    outputLine.className = 'terminal-line';
    outputLine.textContent = item.output;
    terminalBody.appendChild(outputLine);
    index += 1;

    setTimeout(walk, 430);
  };

  walk();
}

function initBackgroundMouse() {
  const glowOne = document.querySelector('.glow-one');
  const glowTwo = document.querySelector('.glow-two');

  if (!glowOne || !glowTwo || reduceMotion) return;

  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    glowOne.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    glowTwo.style.transform = `translate(${-x * 0.22}px, ${-y * 0.22}px)`;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  hideLoadingScreen();
  initScrambleText();
  initRevealObserver();
  animateCounters();
  initTiltCards();
  initNavbar();
  initCommandPalette();
  initCursor();
  initNodeInfo();
  addMapTooltipStyles();
  initCanvasParticles();
  initTerminalTyping();
  initBackgroundMouse();

  setTimeout(() => {
    document.body.classList.add('ready');
  }, 1200);
});

