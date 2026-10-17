import * as THREE from 'three';

export interface MonitorCanvasManager {
  textures: THREE.CanvasTexture[];
  update: (time: number) => void;
  dispose: () => void;
}

const WIDTH = 512;
const HEIGHT = 288;

/**
 * Creates the 5 animated CanvasTextures for the Batcomputer arc monitors
 */
export function createMonitorCanvases(): MonitorCanvasManager {
  if (typeof document === 'undefined') {
    // SSR / test fallback: return 5 dummy textures
    const dummy = new THREE.Texture() as unknown as THREE.CanvasTexture;
    return {
      textures: [dummy, dummy, dummy, dummy, dummy],
      update: () => {},
      dispose: () => {},
    };
  }

  const canvases: HTMLCanvasElement[] = [];
  const contexts: CanvasRenderingContext2D[] = [];
  const textures: THREE.CanvasTexture[] = [];

  for (let i = 0; i < 5; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    canvases.push(canvas);
    contexts.push(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textures.push(texture);
  }

  // Draw scanlines overlay
  const drawScanlines = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < HEIGHT; y += 4) {
      ctx.fillRect(0, y, WIDTH, 1.5);
    }
  };

  // Draw corner brackets
  const drawBrackets = (ctx: CanvasRenderingContext2D, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const len = 12;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(8, 8 + len);
    ctx.lineTo(8, 8);
    ctx.lineTo(8 + len, 8);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(WIDTH - 8 - len, 8);
    ctx.lineTo(WIDTH - 8, 8);
    ctx.lineTo(WIDTH - 8, 8 + len);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(8, HEIGHT - 8 - len);
    ctx.lineTo(8, HEIGHT - 8);
    ctx.lineTo(8 + len, HEIGHT - 8);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(WIDTH - 8 - len, HEIGHT - 8);
    ctx.lineTo(WIDTH - 8, HEIGHT - 8);
    ctx.lineTo(WIDTH - 8, HEIGHT - 8 - len);
    ctx.stroke();
  };

  // Monitor 0: Far Left — NVIDIA Jetson Edge AI Telemetry
  const drawMonitor0 = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#060a0e';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Header
    ctx.fillStyle = '#7fb38a';
    ctx.fillRect(16, 16, 8, 8);
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e8a23a';
    ctx.fillText('// NVIDIA JETSON EDGE AI TELEMETRY', 32, 24);

    ctx.fillStyle = '#7fb38a';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('SYS: ONLINE · CUDA ACCELERATED', WIDTH - 190, 24);

    // Divider
    ctx.strokeStyle = '#1e2832';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, 34);
    ctx.lineTo(WIDTH - 16, 34);
    ctx.stroke();

    // Stats
    ctx.fillStyle = '#9e9a8e';
    ctx.font = '11px "JetBrains Mono", monospace';
    const lines = [
      ['ENGINE', 'TensorRT FP16 (Active)'],
      ['PIPELINE', 'YOLOv8 Object Detection'],
      ['LATENCY', `${(46.5 + Math.sin(time * 3) * 1.8).toFixed(1)} ms [Sub-50ms Target]`],
      ['CUDA CORES', '128 Cores · Stream #0 Active'],
      ['VRAM USAGE', '3.42 GB / 4.00 GB (85%)'],
      ['INFERENCE FPS', `${(58.5 + Math.cos(time * 2) * 1.5).toFixed(1)} FPS`],
    ];

    lines.forEach(([label, val], idx) => {
      const y = 56 + idx * 22;
      ctx.fillStyle = '#9e9a8e';
      ctx.fillText(label.padEnd(14, ' ') + ':', 18, y);
      ctx.fillStyle = idx === 2 ? '#7fb38a' : '#e6e2d8';
      ctx.fillText(val, 130, y);
    });

    // Histogram bars (16 bars)
    ctx.fillStyle = '#141c24';
    ctx.fillRect(18, 195, WIDTH - 36, 50);

    const barCount = 18;
    const barW = 18;
    const gap = 8;
    for (let i = 0; i < barCount; i++) {
      const h = 15 + Math.sin(time * 4 + i * 0.8) * 12 + ((i * 7) % 15);
      ctx.fillStyle = h > 30 ? '#e8a23a' : '#7fb38a';
      ctx.fillRect(24 + i * (barW + gap), 240 - h, barW, h);
    }

    // Bottom telemetry footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('THERMAL: 43°C · POWER: 10W MODE · BUS: 12V NOMINAL', 18, 268);

    drawBrackets(ctx, '#22303c');
    drawScanlines(ctx);
  };

  // Monitor 1: Mid Left — IoT Fleet & Sensor Nodes
  const drawMonitor1 = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#070a0e';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Header
    ctx.fillStyle = '#e8a23a';
    ctx.fillRect(16, 16, 8, 8);
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e8a23a';
    ctx.fillText('// IOT FLEET TELEMETRY & SENSORS', 32, 24);

    ctx.fillStyle = '#7fb38a';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('SYNQUIC LABS FLEET · 12 NODES', WIDTH - 200, 24);

    // Divider
    ctx.strokeStyle = '#1e2832';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, 34);
    ctx.lineTo(WIDTH - 16, 34);
    ctx.stroke();

    // Text stats on left side
    ctx.font = '11px "JetBrains Mono", monospace';
    const lines = [
      ['BROKER', 'WebSocket WSS / TLS 1.3'],
      ['HARDWARE', 'ESP32 / Arduino / PLC'],
      ['BUS PROTOCOL', 'UART · I2C · SPI · TCP/IP'],
      ['CLOUD TARGET', 'AWS EC2 Deployment'],
      ['PACKET LOSS', '0.00% (Verified ACK)'],
      ['HEARTBEAT', '1000ms Keep-Alive'],
    ];

    lines.forEach(([label, val], idx) => {
      const y = 56 + idx * 22;
      ctx.fillStyle = '#9e9a8e';
      ctx.fillText(label.padEnd(14, ' ') + ':', 18, y);
      ctx.fillStyle = idx === 4 ? '#7fb38a' : '#e6e2d8';
      ctx.fillText(val, 130, y);
    });

    // Radar circle on right side
    const cx = WIDTH - 95;
    const cy = 140;
    const radius = 60;

    ctx.strokeStyle = 'rgba(127, 179, 138, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.66, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.33, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    // Sweeping radar beam
    const angle = (time * 2.2) % (Math.PI * 2);
    ctx.strokeStyle = '#7fb38a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();

    // Blips
    const blips = [
      { x: cx - 25, y: cy - 20 },
      { x: cx + 30, y: cy - 15 },
      { x: cx - 10, y: cy + 35 },
      { x: cx + 22, y: cy + 28 },
    ];
    ctx.fillStyle = '#e8a23a';
    blips.forEach((b) => {
      ctx.fillRect(b.x - 2, b.y - 2, 5, 5);
    });

    // Footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('FIRMWARE: OTA V2.4.1 LIVE · SYSTEMD FLEET RESTART OK', 18, 268);

    drawBrackets(ctx, '#22303c');
    drawScanlines(ctx);
  };

  // Monitor 2: Center Main Screen — NJ-OS Workstation Terminal & Neural Topology
  const drawMonitor2 = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#080d12';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Amber border line around main screen
    ctx.strokeStyle = '#e8a23a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

    // Header banner
    ctx.fillStyle = 'rgba(232, 162, 58, 0.15)';
    ctx.fillRect(12, 12, WIDTH - 24, 28);
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e8a23a';
    ctx.fillText('NJ-OS // THE ENGINEER\'S WORKSTATION COMMAND CONSOLE', 20, 30);
    ctx.fillStyle = '#7fb38a';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('SEC-07 // READY', WIDTH - 120, 30);

    // Left Column: Identity & Verified Credentials
    ctx.fillStyle = '#e6e2d8';
    ctx.font = 'bold 12px "Space Grotesk", sans-serif';
    ctx.fillText('NISHANT JAIN', 24, 64);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e8a23a';
    ctx.fillText('AI/ML · COMPUTER VISION · EDGE AI · IOT', 24, 78);

    ctx.fillStyle = '#9e9a8e';
    ctx.font = '10px "JetBrains Mono", monospace';
    const creds = [
      '• Synquic Labs — AI/ML & IoT Engineer',
      '• Cognicity — Founding Engineer AI/CV',
      '• Patent Filed: EdgeDesk Fleet Architecture',
      '• Winner: NATRAX Sustainathon 2025',
      '• Top Finalist: MPSEDC Mahakumbh 2025',
    ];
    creds.forEach((c, idx) => {
      ctx.fillText(c, 24, 100 + idx * 16);
    });

    // Right Column: Neural Network Topology Graphic
    const startX = 350;
    const startY = 65;
    const layers = [
      [{ x: startX, y: startY + 20 }, { x: startX, y: startY + 50 }, { x: startX, y: startY + 80 }],
      [
        { x: startX + 50, y: startY + 10 },
        { x: startX + 50, y: startY + 35 },
        { x: startX + 50, y: startY + 65 },
        { x: startX + 50, y: startY + 90 },
      ],
      [{ x: startX + 100, y: startY + 35 }, { x: startX + 100, y: startY + 65 }],
    ];

    // Synaptic connections
    ctx.strokeStyle = 'rgba(232, 162, 58, 0.25)';
    ctx.lineWidth = 1;
    layers[0].forEach((n1) => {
      layers[1].forEach((n2) => {
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });
    });
    layers[1].forEach((n1) => {
      layers[2].forEach((n2) => {
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.stroke();
      });
    });

    // Draw nodes
    layers.forEach((layer, lIdx) => {
      layer.forEach((n, nIdx) => {
        const pulse = Math.sin(time * 4 + lIdx * 2 + nIdx) > 0.5;
        ctx.fillStyle = pulse ? '#e8a23a' : '#1e2832';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pulse ? '#fff' : '#7fb38a';
        ctx.stroke();
      });
    });

    // Interactive Access Prompt Bar at bottom
    ctx.fillStyle = 'rgba(7, 10, 14, 0.9)';
    ctx.fillRect(16, 205, WIDTH - 32, 55);
    ctx.strokeStyle = 'rgba(232, 162, 58, 0.6)';
    ctx.strokeRect(16, 205, WIDTH - 32, 55);

    const blink = Math.floor(time * 2) % 2 === 0;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e8a23a';
    ctx.fillText('root@nj-workstation:~# PRESS [E] TO ACCESS NJ-OS' + (blink ? ' █' : ''), 28, 230);
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#7fb38a';
    ctx.fillText('>>> CLICK SCREEN OR PRESS E TO ENTER FULL INTERACTIVE PORTFOLIO OS', 28, 248);

    drawBrackets(ctx, '#e8a23a');
    drawScanlines(ctx);
  };

  // Monitor 3: Mid Right — EdgeDesk Patent Architecture
  const drawMonitor3 = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#070a0e';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Header
    ctx.fillStyle = '#c4872e';
    ctx.fillRect(16, 16, 8, 8);
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e8a23a';
    ctx.fillText('// EDGEDESK: SECURE REMOTE ACCESS', 32, 24);

    ctx.fillStyle = '#c4872e';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('PATENT APPLICATION FILED', WIDTH - 180, 24);

    // Divider
    ctx.strokeStyle = '#1e2832';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, 34);
    ctx.lineTo(WIDTH - 16, 34);
    ctx.stroke();

    // Architecture details
    ctx.font = '11px "JetBrains Mono", monospace';
    const lines = [
      ['REMOTE ACCESS', 'Encrypted Screen & VNC'],
      ['DEVICE FLEET', 'Jetson Nano Cluster Nodes'],
      ['NETWORK RELAY', 'Custom WebSocket TLS Broker'],
      ['FILE TRANSFER', 'Encrypted Cross-Device DnD'],
      ['DAEMON ARCH', 'Systemd Reboot-Safe Services'],
      ['TUNNEL STATUS', 'WSS Secure Handshake OK'],
    ];

    lines.forEach(([label, val], idx) => {
      const y = 56 + idx * 22;
      ctx.fillStyle = '#9e9a8e';
      ctx.fillText(label.padEnd(14, ' ') + ':', 18, y);
      ctx.fillStyle = idx === 5 ? '#7fb38a' : '#e6e2d8';
      ctx.fillText(val, 130, y);
    });

    // Live simulated cryptographic packet hex stream
    ctx.fillStyle = '#101419';
    ctx.fillRect(18, 195, WIDTH - 36, 50);
    ctx.font = '10px "JetBrains Mono", monospace';

    const hexSeed = Math.floor(time * 3);
    const hex1 = `PKT #${(4810 + hexSeed % 900)}: 0x7F 0x45 0x4C 0x46 0x02 0x01 0x01 0x00 0x57 0x53 0x53`;
    const hex2 = `CRC32: 0x8FA4B192 · TLS_AES_256_GCM_SHA384 · STATUS: 200 VERIFIED`;

    ctx.fillStyle = '#7fb38a';
    ctx.fillText(hex1, 26, 216);
    ctx.fillStyle = '#9e9a8e';
    ctx.fillText(hex2, 26, 233);

    ctx.fillStyle = '#6b7280';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('PATENT FILED FOR MULTI-DEVICE ARCHITECTURE (NOT GRANTED)', 18, 268);

    drawBrackets(ctx, '#22303c');
    drawScanlines(ctx);
  };

  // Monitor 4: Far Right — Real-Time Telemetry & Event Diagnostics
  const drawMonitor4 = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#060a0e';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Header
    ctx.fillStyle = '#7fb38a';
    ctx.fillRect(16, 16, 8, 8);
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#e8a23a';
    ctx.fillText('// SYSTEM TELEMETRY & EVENT LOGS', 32, 24);

    ctx.fillStyle = '#7fb38a';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText('EVENT STREAM // BUFFER OK', WIDTH - 180, 24);

    // Divider
    ctx.strokeStyle = '#1e2832';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, 34);
    ctx.lineTo(WIDTH - 16, 34);
    ctx.stroke();

    // Scrolling logs (6 lines)
    ctx.font = '10px "JetBrains Mono", monospace';
    const baseSec = Math.floor(time);
    const logEvents = [
      `[12:20:${String(baseSec % 60).padStart(2, '0')}.12] YOLOv8: inference completed (46.8ms)`,
      `[12:20:${String((baseSec - 1 + 60) % 60).padStart(2, '0')}.45] ESP32 node 04: heartbeat ACK received`,
      `[12:20:${String((baseSec - 2 + 60) % 60).padStart(2, '0')}.08] AWS EC2: REST API heartbeat 200 OK`,
      `[12:20:${String((baseSec - 3 + 60) % 60).padStart(2, '0')}.89] Jetson CUDA: core temp 43°C - nominal`,
      `[12:20:${String((baseSec - 4 + 60) % 60).padStart(2, '0')}.22] EdgeDesk: fleet channel authenticated`,
      `[12:20:${String((baseSec - 5 + 60) % 60).padStart(2, '0')}.74] NJ-OS terminal daemon: listening on /os`,
    ];

    logEvents.forEach((ev, idx) => {
      const y = 55 + idx * 21;
      ctx.fillStyle = idx === 0 ? '#e8a23a' : '#9e9a8e';
      ctx.fillText(ev, 18, y);
    });

    // Dynamic wave line chart at bottom
    ctx.fillStyle = '#10151c';
    ctx.fillRect(18, 195, WIDTH - 36, 50);

    ctx.strokeStyle = '#7fb38a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < WIDTH - 36; x += 4) {
      const wave = Math.sin(time * 5 + x * 0.08) * 12 + Math.cos(time * 2 + x * 0.15) * 6;
      const y = 220 + wave;
      if (x === 0) ctx.moveTo(18 + x, y);
      else ctx.lineTo(18 + x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#6b7280';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillText('UPTIME: 99.98% · 0 FAULTS DETECTED · MEMORY LEAKS: NONE', 18, 268);

    drawBrackets(ctx, '#22303c');
    drawScanlines(ctx);
  };

  const drawFunctions = [drawMonitor0, drawMonitor1, drawMonitor2, drawMonitor3, drawMonitor4];

  // Update routine: re-draws canvases and marks textures for WebGL upload
  const update = (time: number) => {
    for (let i = 0; i < 5; i++) {
      drawFunctions[i](contexts[i], time);
      textures[i].needsUpdate = true;
    }
  };

  // Initial draw
  update(0);

  const dispose = () => {
    textures.forEach((t) => t.dispose());
  };

  return {
    textures,
    update,
    dispose,
  };
}
