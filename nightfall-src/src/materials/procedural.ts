import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

function createNoiseCanvas(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  drawFn(ctx, width, height);
  return canvas;
}

/**
 * Procedural Rock Textures (Albedo, Normal, Roughness)
 */
export function getProceduralRockTextures(anisotropy = 4) {
  const albedoKey = 'rock_albedo';
  const normalKey = 'rock_normal';
  const roughnessKey = 'rock_roughness';

  if (!textureCache.has(albedoKey)) {
    const canvas = createNoiseCanvas(256, 256, (ctx, w, h) => {
      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        // Dark slate / charcoal rock with mineral grain
        const n1 = Math.random() * 25 - 12;
        const n2 = Math.sin((i / 4 / w) * 0.1) * 10;
        const base = 28 + n1 + n2;
        d[i] = Math.max(0, Math.min(255, base + 2)); // R
        d[i + 1] = Math.max(0, Math.min(255, base + 4)); // G
        d[i + 2] = Math.max(0, Math.min(255, base + 8)); // B (cool blue-charcoal tint)
        d[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    });

    if (canvas) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      textureCache.set(albedoKey, tex);
    }
  }

  if (!textureCache.has(normalKey)) {
    const canvas = createNoiseCanvas(256, 256, (ctx, w, h) => {
      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        // High-frequency rock normal
        const nx = 128 + (Math.random() * 40 - 20);
        const ny = 128 + (Math.random() * 40 - 20);
        d[i] = Math.round(nx);
        d[i + 1] = Math.round(ny);
        d[i + 2] = 255; // pointing out
        d[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    });

    if (canvas) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = anisotropy;
      textureCache.set(normalKey, tex);
    }
  }

  if (!textureCache.has(roughnessKey)) {
    const canvas = createNoiseCanvas(128, 128, (ctx, w, h) => {
      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const val = 210 + Math.random() * 35; // Rough rock (0.8..0.95)
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
        d[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    });

    if (canvas) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      textureCache.set(roughnessKey, tex);
    }
  }

  return {
    map: textureCache.get(albedoKey) || null,
    normalMap: textureCache.get(normalKey) || null,
    roughnessMap: textureCache.get(roughnessKey) || null,
  };
}

/**
 * Procedural Concrete Textures (Albedo, Roughness)
 */
export function getProceduralConcreteTextures(anisotropy = 4) {
  const albedoKey = 'concrete_albedo';
  if (!textureCache.has(albedoKey)) {
    const canvas = createNoiseCanvas(256, 256, (ctx, w, h) => {
      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const base = 42 + Math.random() * 12;
        d[i] = base;
        d[i + 1] = base + 1;
        d[i + 2] = base + 3;
        d[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    });

    if (canvas) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      textureCache.set(albedoKey, tex);
    }
  }

  return {
    map: textureCache.get(albedoKey) || null,
  };
}

/**
 * Procedural Steel Grating Texture (Alpha cutout)
 */
export function getProceduralGratingTextures() {
  const alphaKey = 'grating_alpha';
  if (!textureCache.has(alphaKey)) {
    const canvas = createNoiseCanvas(128, 128, (ctx, w, h) => {
      ctx.fillStyle = '#000000'; // Cutout / transparent hole
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#ffffff'; // Solid steel bar
      ctx.lineWidth = 14;

      // Crosshatch industrial diamond grating
      ctx.beginPath();
      for (let x = -w; x < w * 2; x += 32) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.moveTo(x, h);
        ctx.lineTo(x + h, 0);
      }
      ctx.stroke();
    });

    if (canvas) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      textureCache.set(alphaKey, tex);
    }
  }

  return {
    alphaMap: textureCache.get(alphaKey) || null,
  };
}

/**
 * Procedural Water Normal Map Texture
 */
export function getProceduralWaterNormal() {
  const key = 'water_normal';
  if (!textureCache.has(key)) {
    const canvas = createNoiseCanvas(256, 256, (ctx, w, h) => {
      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          // Sine wave ripple pattern
          const rippleX = Math.sin((x / 16) * Math.PI * 2) * 20;
          const rippleY = Math.cos((y / 16) * Math.PI * 2) * 20;
          d[idx + 0] = Math.round(128 + rippleX);
          d[idx + 1] = Math.round(128 + rippleY);
          d[idx + 2] = 255;
          d[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    });

    if (canvas) {
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      textureCache.set(key, tex);
    }
  }

  return textureCache.get(key) || null;
}
