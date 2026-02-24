'use client';

import { useEffect, useRef } from 'react';

interface RainCanvasProps {
  chance: number; // 0–100
}

function getThemeConfig(chance: number) {
  if (chance <= 20) {
    // Clear — warm golden sun motes drifting up (dust particles, not rain)
    return {
      dropCount: 18,
      speedMin: -0.8,
      speedMax: -0.3,
      lenMin: 2,
      lenMax: 5,
      angleX: 0,
      opacityMin: 0.08,
      opacityMax: 0.25,
      color: '255, 210, 100', // golden
      lineWidth: 1.5,
      drifting: true,
    };
  } else if (chance <= 50) {
    // Overcast — light drizzle, nearly vertical, slow
    return {
      dropCount: 55,
      speedMin: 2,
      speedMax: 4,
      lenMin: 6,
      lenMax: 14,
      angleX: 0.05,
      opacityMin: 0.06,
      opacityMax: 0.2,
      color: '180, 200, 230',
      lineWidth: 0.8,
      drifting: false,
    };
  } else if (chance <= 75) {
    // Rainy — moderate rain, slight angle
    return {
      dropCount: 130,
      speedMin: 5,
      speedMax: 9,
      lenMin: 12,
      lenMax: 22,
      angleX: 0.18,
      opacityMin: 0.12,
      opacityMax: 0.38,
      color: '126, 184, 247',
      lineWidth: 1,
      drifting: false,
    };
  } else {
    // Storm — heavy downpour, aggressive angle, fast
    return {
      dropCount: 260,
      speedMin: 12,
      speedMax: 20,
      lenMin: 20,
      lenMax: 38,
      angleX: 0.35,
      opacityMin: 0.18,
      opacityMax: 0.55,
      color: '180, 140, 255',
      lineWidth: 1.2,
      drifting: false,
    };
  }
}

export default function RainCanvas({ chance }: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chanceRef = useRef(chance);

  // Keep ref in sync so the animation loop always reads latest value
  useEffect(() => {
    chanceRef.current = chance;
  }, [chance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Drop {
      x: number;
      y: number;
      len: number;
      speed: number;
      opacity: number;
    }

    // Max pool size — we'll only render up to config.dropCount of them
    const MAX_DROPS = 300;
    const drops: Drop[] = Array.from({ length: MAX_DROPS }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: 10,
      speed: 5,
      opacity: 0.2,
    }));

    const draw = () => {
      const cfg = getThemeConfig(chanceRef.current);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < cfg.dropCount; i++) {
        const d = drops[i];

        // Lazily initialise / re-initialise drops when config changes
        if (d.len < cfg.lenMin || d.len > cfg.lenMax + 10) {
          d.len = Math.random() * (cfg.lenMax - cfg.lenMin) + cfg.lenMin;
          d.speed = Math.random() * (cfg.speedMax - cfg.speedMin) + cfg.speedMin;
          d.opacity = Math.random() * (cfg.opacityMax - cfg.opacityMin) + cfg.opacityMin;
        }

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * cfg.angleX, d.y + d.len);
        ctx.strokeStyle = `rgba(${cfg.color}, ${d.opacity})`;
        ctx.lineWidth = cfg.lineWidth;
        ctx.stroke();

        d.y += d.speed;
        d.x -= d.len * cfg.angleX * 0.3;

        if (d.y > canvas.height + d.len) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
          d.len = Math.random() * (cfg.lenMax - cfg.lenMin) + cfg.lenMin;
          d.speed = Math.random() * (cfg.speedMax - cfg.speedMin) + cfg.speedMin;
          d.opacity = Math.random() * (cfg.opacityMax - cfg.opacityMin) + cfg.opacityMin;
        }
        if (d.x < -50) d.x = canvas.width + 50;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="rain-canvas" />;
}
