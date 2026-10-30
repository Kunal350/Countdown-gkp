import * as THREE from 'three';

/**
 * Creates high-resolution procedural canvas textures.
 * Color textures are explicitly set to SRGBColorSpace with anisotropic filtering.
 */

// Helper to create and setup a CanvasTexture
function makeCanvasTexture(draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void, width = 512, height = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    draw(ctx, width, height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// Bus Stop Main Signboard (Yellow & Black with Hindi/English text)
export function createBusStopSignTexture(): THREE.CanvasTexture {
  return makeCanvasTexture((ctx, w, h) => {
    // Background
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, w, h);

    // Inner Border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    // Header strip
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, 24, w - 48, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚏 BUS STOP • बस स्टॉप', w / 2, 78);

    // Destination
    ctx.fillStyle = '#991b1b';
    ctx.font = '900 68px sans-serif';
    ctx.fillText('गोरखपुर', w / 2, 210);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('GORAKHPUR', w / 2, 280);

    // Subtext
    ctx.fillStyle = '#334155';
    ctx.font = '600 28px sans-serif';
    ctx.fillText('वाया: पंजाब - दिल्ली - लखनऊ', w / 2, 340);
    ctx.fillText('EXPRESS SERVICE', w / 2, 390);

    // Decorative bus icon
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 70, 420, 140, 50, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('UP RTC', w / 2, 455);
  }, 512, 512);
}

// Timetable Schedule Poster
export function createTimetableTexture(): THREE.CanvasTexture {
  return makeCanvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 0, w, 90);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('गोरखपुर डिपो समय-सारणी', w / 2, 58);

    // Table rows
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#1e293b';

    const rows = [
      'सेवा (SERVICE)      समय (TIME)',
      '------------------------------',
      '01. सुपरफास्ट AC     06:00 AM',
      '02. जनरथ एक्सप्रेस   10:30 AM',
      '03. गोरखपुर स्पेशल   05:00 PM',
      '04. रात्रिकालीन सेवा  10:00 PM',
      '------------------------------',
      'हेल्पलाइन: 1800-180-2877',
      'सुरक्षित यात्रा, सुखद अनुभव',
    ];

    rows.forEach((r, i) => {
      if (i === 0) ctx.fillStyle = '#0369a1';
      else if (i === 4) ctx.fillStyle = '#dc2626'; // Highlight Gorakhpur special
      else ctx.fillStyle = '#334155';
      ctx.fillText(r, 26, 140 + i * 36);
    });
  }, 512, 512);
}

// Bus Destination LED Board ("GORAKHPUR EXPRESS • गोरखपुर")
export function createBusDestinationTexture(): THREE.CanvasTexture {
  return makeCanvasTexture((ctx, w, h) => {
    // LED black screen
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, w, h);

    // Glowing border
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, w - 12, h - 12);

    // Amber / Green LED Text
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 54px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 12;

    ctx.fillText('गोरखपुर एक्सप्रेस', w / 2, 70);

    ctx.font = 'bold 38px monospace';
    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.fillText('GORAKHPUR EXP ★ EXP-505', w / 2, 120);
  }, 600, 160);
}

// Pink Suitcase Face Texture (Directly inspired by the user's attachment!)
export function createCuteLuggageTexture(): THREE.CanvasTexture {
  return makeCanvasTexture((ctx, w, h) => {
    // Pink base
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(0, 0, w, h);

    // Subtle polka dots / leather stitch
    ctx.strokeStyle = '#db2777';
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // Cute cartoon eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(w * 0.36, h * 0.45, 14, 0, Math.PI * 2);
    ctx.arc(w * 0.64, h * 0.45, 14, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights (white shine)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w * 0.36 - 4, h * 0.45 - 4, 5, 0, Math.PI * 2);
    ctx.arc(w * 0.64 - 4, h * 0.45 - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Rosy pink blush cheeks
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(w * 0.28, h * 0.54, 16, 0, Math.PI * 2);
    ctx.arc(w * 0.72, h * 0.54, 16, 0, Math.PI * 2);
    ctx.fill();

    // Smiling mouth
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.48, 22, 0.2, Math.PI - 0.2, false);
    ctx.stroke();
  }, 256, 256);
}

// Cool Boy Travel Suitcase Texture (Navy/Cobalt with Speed stripes & Travel badges)
export function createBoyLuggageTexture(): THREE.CanvasTexture {
  return makeCanvasTexture((ctx, w, h) => {
    // Rich Cobalt / Navy Carbon base
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, w, h);

    // Metallic border trim
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Double racing / travel speed stripes
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(w * 0.2, 0, 18, h);
    ctx.fillRect(w * 0.2 + 26, 0, 8, h);

    // Cool Travel Badge in center
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(w * 0.62, h * 0.5, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Star and text
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ EXP ★', w * 0.62, h * 0.46);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('GKP 05', w * 0.62, h * 0.58);
  }, 256, 256);
}

// Cartoon Blinking Eye Texture
export function createCartoonEyeTexture(isHappy = true): THREE.CanvasTexture {
  return makeCanvasTexture((ctx, w, h) => {
    // Eye sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.44, 0, Math.PI * 2);
    ctx.fill();

    // Pupil (rich dark chocolate/navy)
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(w / 2 + 10, h / 2 + 4, w * 0.26, 0, Math.PI * 2);
    ctx.fill();

    // Iris sparkle
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(w / 2 + 14, h / 2 + 10, w * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Gloss catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2 + 2, h / 2 - 8, w * 0.1, 0, Math.PI * 2);
    ctx.arc(w / 2 + 18, h / 2 + 14, w * 0.05, 0, Math.PI * 2);
    ctx.fill();

    if (isHappy) {
      // Eyelash curve
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.44, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
  }, 128, 128);
}
