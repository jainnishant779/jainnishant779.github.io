(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  $('#year').textContent = new Date().getFullYear();

  const menuButton = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    mobileNav.hidden = !open;
  });
  $$('#mobile-nav a').forEach(link => link.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
  }));

  const toast = $('.toast');
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
  }
  $$('.copy-email').forEach(button => button.addEventListener('click', async () => {
    const email = button.dataset.email;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
        notify('EMAIL COPIED · ' + email);
      } else {
        const area = document.createElement('textarea'); area.value = email; area.setAttribute('readonly', '');
        area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select();
        const ok = document.execCommand('copy'); area.remove();
        notify(ok ? 'EMAIL COPIED · ' + email : 'EMAIL · ' + email);
      }
    } catch { notify('EMAIL · ' + email); }
  }));

  const projectInfo = {
    edgedesk: {
      type: 'EDGE COMPUTING / PATENT APPLICATION FILED', title: 'EdgeDesk',
      summary: 'A secure multi-device remote access platform designed to manage a fleet of Jetson Nano edge devices from one dashboard.',
      build: 'Designed a VPN-style secure remote desktop workflow with encrypted screen access, file transfer, a custom WebSocket broker, cross-device drag-and-drop, and reboot-safe Linux services.',
      tech: 'Python · WebSocket · VNC · TLS/WSS · Jetson Nano · Linux',
      notes: 'The CV describes a patent application filed for the multi-device architecture. It does not state that a patent has been granted. No unverified public demo URL is claimed.'
    },
    crowd: {
      type: 'COMPUTER VISION / REAL-TIME ANALYTICS', title: 'Crowd Analytics & Stampede Detection',
      summary: 'A GPU-accelerated multi-object tracking pipeline for person counting and density/velocity-based crowd-risk alerts.',
      build: 'Combined YOLOv8 detection, ByteTrack tracking, and OpenCV processing for live analytics. The CV reports sub-50 ms inference latency; actual performance depends on the original hardware and test conditions.',
      tech: 'Python · YOLOv8 · ByteTrack · OpenCV · Jetson Nano · CUDA',
      notes: 'Top Finalist among 200+ teams at the MPSEDC Mahakumbh Hackathon 2025. The displayed visualization is illustrative UI artwork, not a screenshot of a deployed product.'
    },
    poultry: {
      type: 'APPLIED AI / CLIENT PROJECT', title: 'AI-Powered Poultry Health Monitoring',
      summary: 'An applied computer-vision workflow developed for a real farm-operator client.',
      build: 'Owned the machine-learning lifecycle across data collection, annotation, model training, and deployment for hen detection and monitoring use cases.',
      tech: 'Python · YOLO · OpenCV · Object Detection',
      notes: 'The visual is a concept illustration. No unverified accuracy, farm-scale impact, or public demo is asserted.'
    },
    assistant: {
      type: 'PERSONAL R&D / IN PROGRESS', title: 'On-device AI Assistant',
      summary: 'Research into an offline-first Android assistant that transcribes speech and produces useful meeting summaries on constrained hardware.',
      build: 'The current exploration combines Whisper-family speech recognition with a local language-model runtime, focusing on latency, memory usage, thermal behaviour, and practical Hinglish transcription quality.',
      tech: 'Android · Whisper · sherpa-onnx · ONNX · llama.cpp · GGUF',
      notes: 'This is an in-progress R&D project. Benchmarks from the Motorola Edge 60 Fusion test setup are documented separately; this card does not claim a released consumer app.'
    }
  };
  const dialog = $('#project-dialog');
  const architectureFlows = {
    edgedesk: { nodes: ['Jetson edge nodes', 'Secure WSS broker', 'Remote desktop gateway', 'Operator dashboard'], caption: 'Conceptual flow based on the described EdgeDesk architecture; exact deployment topology may vary.' },
    crowd: { nodes: ['CCTV / video stream', 'Frame preprocessing', 'YOLO detection + tracking', 'Density / velocity signals', 'Risk alert'], caption: 'High-level system flow. Alert thresholds and runtime depend on the deployment configuration.' },
    poultry: { nodes: ['Farm video / images', 'Dataset annotation', 'YOLO training + evaluation', 'Inference pipeline', 'Monitoring output'], caption: 'High-level machine-learning lifecycle; the diagram is explanatory, not a live system trace.' },
    assistant: { nodes: ['Microphone / audio file', 'VAD + segmentation', 'On-device speech-to-text', 'Local LLM summary', 'SQLite conversation store'], caption: 'Current R&D architecture direction; components and model choices remain subject to device benchmarks.' }
  };
  function renderArchitecture(key) {
    const target = $('#architecture-diagram');
    const flow = architectureFlows[key] || architectureFlows.edgedesk;
    target.replaceChildren();
    const row = document.createElement('div'); row.className = 'architecture-flow';
    flow.nodes.forEach((label, index) => {
      const node = document.createElement('div'); node.className = 'flow-node'; node.textContent = label; row.appendChild(node);
      if (index < flow.nodes.length - 1) { const arrow = document.createElement('span'); arrow.className = 'flow-arrow'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '→'; row.appendChild(arrow); }
    });
    target.appendChild(row);
    const caption = document.createElement('p'); caption.className = 'architecture-caption'; caption.textContent = flow.caption; target.appendChild(caption);
  }
  $$('[data-open]').forEach(button => button.addEventListener('click', () => {
    const data = projectInfo[button.dataset.open]; if (!data) return;
    $('#dialog-type').textContent = data.type;
    $('#dialog-title').textContent = data.title;
    $('#dialog-summary').textContent = data.summary;
    $('#dialog-build').textContent = data.build;
    $('#dialog-tech').textContent = data.tech;
    $('#dialog-notes').textContent = data.notes;
    renderArchitecture(button.dataset.open);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { $$('[data-open]').forEach(button => button.blur()); });

  // Clickable technology constellation: connects skills to relevant portfolio projects.
  const techData = {
    All: { title: 'Tools connected to outcomes.', copy: 'Choose a node to highlight related work and see how the technology fits into a real system.', projects: ['edgedesk', 'crowd', 'poultry', 'assistant'], label: 'SYSTEM MAP / OVERVIEW' },
    Python: { title: 'The glue across the stack.', copy: 'Used across computer vision pipelines, model experiments, edge tooling, and local AI research.', projects: ['edgedesk', 'crowd', 'poultry', 'assistant'], label: 'LANGUAGE / PYTHON' },
    YOLO: { title: 'Detection becomes a system.', copy: 'Object detection and tracking are part of the crowd analytics and poultry-monitoring workflows.', projects: ['crowd', 'poultry'], label: 'VISION / DETECTION' },
    Jetson: { title: 'Inference near the action.', copy: 'Edge hardware brings compute closer to cameras and devices, where latency and deployment constraints matter.', projects: ['edgedesk', 'crowd'], label: 'EDGE / NVIDIA JETSON' },
    OpenCV: { title: 'Pixels into signals.', copy: 'Image and video processing supports the computer-vision workflows before and after model inference.', projects: ['crowd', 'poultry'], label: 'VISION / OPENCV' },
    ONNX: { title: 'Portable model runtime.', copy: 'ONNX-based runtimes are being explored for efficient speech recognition and on-device inference.', projects: ['assistant'], label: 'RUNTIME / ONNX' },
    LLM: { title: 'Language on-device.', copy: 'Speech transcription and local summarization research focuses on memory, speed, and offline usability.', projects: ['assistant'], label: 'GENAI / ASR + LLM' },
    IoT: { title: 'Intelligence meets hardware.', copy: 'Embedded devices and edge systems connect software workflows to physical environments.', projects: ['edgedesk', 'poultry'], label: 'SYSTEMS / IOT' }
  };
  const projectNames = { edgedesk: 'EdgeDesk', crowd: 'Crowd Analytics', poultry: 'Poultry Health AI', assistant: 'On-device AI' };
  const techButtons = $$('.tech-node');
  const cards = $$('.project-card[data-project]');
  function selectTech(key) {
    const item = techData[key] || techData.All;
    techButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.tech === key)));
    $('#tech-inspector-kicker').textContent = item.label;
    $('#tech-inspector-title').textContent = item.title;
    $('#tech-inspector-copy').textContent = item.copy;
    const list = $('#tech-inspector-projects'); list.replaceChildren();
    item.projects.forEach(project => { const tag = document.createElement('span'); tag.textContent = projectNames[project]; list.appendChild(tag); });
    cards.forEach(card => { const match = item.projects.includes(card.dataset.project); card.classList.toggle('tech-dimmed', key !== 'All' && !match); card.classList.toggle('tech-highlighted', key !== 'All' && match); });
  }
  techButtons.forEach(button => button.addEventListener('click', () => selectTech(button.dataset.tech)));
  $('#reset-tech').addEventListener('click', () => selectTech('All'));

  // Optional WebGL constellation layer. Accessible HTML buttons remain the interaction surface;
  // the SVG links remain as a graceful fallback if WebGL or the CDN is unavailable.
  function initWebGLConstellation() {
    const webglCanvas = $('#constellation-webgl');
    if (!webglCanvas || !window.THREE || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: webglCanvas, alpha: true, antialias: true }); }
    catch { return; }
    const stage = webglCanvas.parentElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
    camera.position.set(0, 0, 12);
    const group = new THREE.Group(); scene.add(group);
    const points = [];
    for (let i = 0; i < 100; i++) {
      const theta = Math.acos(2 * Math.random() - 1), phi = Math.PI * 2 * Math.random();
      const r = 2.1 + Math.random() * 1.3;
      points.push(new THREE.Vector3(r * Math.sin(theta) * Math.cos(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(theta) * .55));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const dots = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xc8ff3d, size: .045, transparent: true, opacity: .75 }));
    group.add(dots);
    const vertices = [];
    points.forEach((point, i) => {
      const near = points.map((other, j) => ({ other, j, d: point.distanceTo(other) })).filter(item => item.j > i && item.d < 1.15).sort((a,b)=>a.d-b.d).slice(0,3);
      near.forEach(item => vertices.push(point.x,point.y,point.z,item.other.x,item.other.y,item.other.z));
    });
    const linesGeo = new THREE.BufferGeometry(); linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices,3));
    group.add(new THREE.LineSegments(linesGeo,new THREE.LineBasicMaterial({color:0xc8ff3d,transparent:true,opacity:.18})));
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.75,1),new THREE.MeshBasicMaterial({color:0xc8ff3d,wireframe:true,transparent:true,opacity:.4}));
    group.add(core);
    let w=1,h=1,raf=0,px=0,py=0,tx=0,ty=0,active=true;
    function resize(){const r=stage.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    function draw(){if(!active)return;px+=(tx-px)*.035;py+=(ty-py)*.035;group.rotation.y+=.0018;group.rotation.x+=(py*.12-group.rotation.x)*.02;group.rotation.y+=px*.002;core.rotation.x+=.003;core.rotation.y-=.004;renderer.render(scene,camera);raf=requestAnimationFrame(draw);}
    stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;},{passive:true});
    stage.addEventListener('pointerleave',()=>{tx=0;ty=0;});
    window.addEventListener('resize',resize,{passive:true});
    if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active&&!raf)draw();else{cancelAnimationFrame(raf);raf=0;}},{threshold:.05}).observe(stage);
    resize();draw();
  }
  initWebGLConstellation();

  // Lightweight, dependency-free animated neural object. Reduced-motion users get a static illustration.
  const canvas = $('#neural-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0, dpr = 1, raf = 0, pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  const nodes = [];
  const count = 112;
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    const radius = .3 + Math.random() * .7;
    nodes.push({ x: Math.sin(theta) * Math.cos(phi) * radius, y: Math.sin(theta) * Math.sin(phi) * radius, z: Math.cos(theta) * radius, phase: Math.random() * Math.PI * 2, size: .6 + Math.random() * 1.3 });
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height); dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(0);
  }
  function draw(time) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const t = reducedMotion ? 0 : time * .00022;
    pointerX += (targetX - pointerX) * .035; pointerY += (targetY - pointerY) * .035;
    const ry = t + pointerX * .28, rx = Math.sin(t * .8) * .25 + pointerY * .16;
    const sinY = Math.sin(ry), cosY = Math.cos(ry), sinX = Math.sin(rx), cosX = Math.cos(rx);
    const scale = Math.min(width, height) * .34;
    const projected = nodes.map((n, i) => {
      const x1 = n.x * cosY - n.z * sinY, z1 = n.x * sinY + n.z * cosY;
      const y1 = n.y * cosX - z1 * sinX, z2 = n.y * sinX + z1 * cosX;
      const perspective = 2.6 / (2.6 + z2);
      return { x: width / 2 + x1 * scale * perspective, y: height / 2 + y1 * scale * perspective, z: z2, size: n.size * perspective, i, phase: n.phase };
    });
    const maxDist = Math.min(width, height) * .16;
    for (let i = 0; i < projected.length; i++) {
      const a = projected[i];
      for (let j = i + 1; j < projected.length; j++) {
        const b = projected[j], dx = a.x - b.x, dy = a.y - b.y, dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * (.11 + (1 - (a.z + b.z + 2) / 4) * .12);
          ctx.strokeStyle = `rgba(200,255,61,${alpha})`; ctx.lineWidth = .55; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    const cx = width / 2, cy = height / 2;
    const glow = ctx.createRadialGradient(cx, cy, 3, cx, cy, scale * .9);
    glow.addColorStop(0, 'rgba(200,255,61,.09)'); glow.addColorStop(.65, 'rgba(200,255,61,.025)'); glow.addColorStop(1, 'rgba(200,255,61,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, scale * .9, 0, Math.PI * 2); ctx.fill();
    projected.sort((a, b) => a.z - b.z).forEach(p => {
      const alpha = .3 + (1 - (p.z + 1) / 2) * .7;
      ctx.fillStyle = `rgba(211,255,113,${alpha})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = 'rgba(200,255,61,.22)'; ctx.lineWidth = .7; ctx.beginPath(); ctx.ellipse(cx, cy, scale * .94, scale * .28, -.45 + Math.sin(t) * .08, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, scale * .94, scale * .28, .55 + Math.cos(t) * .08, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#c8ff3d'; ctx.shadowColor = '#c8ff3d'; ctx.shadowBlur = 22; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    if (!reducedMotion) raf = requestAnimationFrame(draw);
  }
  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect(); targetX = ((event.clientX - rect.left) / rect.width - .5) * 2; targetY = ((event.clientY - rect.top) / rect.height - .5) * 2;
  });
  canvas.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); if (!reducedMotion) raf = requestAnimationFrame(draw); }, { passive: true });
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { if (!raf) raf = requestAnimationFrame(draw); }
      else { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: .05 }); observer.observe(canvas);
  }
  resize(); if (!reducedMotion) raf = requestAnimationFrame(draw);
})();
