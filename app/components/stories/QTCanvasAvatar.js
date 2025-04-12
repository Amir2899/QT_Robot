import React, { useEffect, useRef, useCallback } from 'react';

const QTCanvasAvatar = ({ emotion, speaking }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const eyeBlinkInterval = useRef(null);

  // Configuration de base de l'avatar
  const config = {
    faceColor: '#ffffff',
    eyeColor: '#000000',
    mouthColor: '#ff6b6b',
    blinkDuration: 150,
    blinkInterval: 3000,
  };

  // Fonction pour dessiner les yeux
  const drawEyes = useCallback((ctx, blinking = false) => {
    const eyeWidth = blinking ? 5 : 20;
    const eyeHeight = blinking ? 3 : 20;

    // Œil gauche
    ctx.fillStyle = config.eyeColor;
    ctx.beginPath();
    ctx.ellipse(80, 100, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Œil droit
    ctx.beginPath();
    ctx.ellipse(160, 100, eyeWidth, eyeHeight, 0, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  // Fonction pour dessiner la bouche selon l'émotion
  const drawMouth = useCallback((ctx) => {
    ctx.strokeStyle = config.mouthColor;
    ctx.lineWidth = 3;
    ctx.beginPath();

    switch(emotion) {
      case 'happy':
        // Sourire
        ctx.beginPath();
        ctx.arc(120, 140, 30, 0.2, Math.PI - 0.2);
        break;
      case 'surprised':
        // Bouche en O
        ctx.beginPath();
        ctx.arc(120, 140, 20, 0, 2 * Math.PI);
        break;
      default:
        // Bouche neutre
        ctx.moveTo(90, 140);
        ctx.lineTo(150, 140);
    }
    
    if (speaking) {
      // Animation de parole
      const amplitude = 5;
      const frequency = Date.now() / 100;
      ctx.moveTo(90, 140 + Math.sin(frequency) * amplitude);
      ctx.lineTo(150, 140 + Math.sin(frequency + Math.PI) * amplitude);
    }

    ctx.stroke();
  }, [emotion, speaking]);

  // Fonction principale de dessin
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner le visage (cercle de base)
    ctx.fillStyle = config.faceColor;
    ctx.beginPath();
    ctx.arc(120, 120, 100, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dessiner les yeux et la bouche
    drawEyes(ctx);
    drawMouth(ctx);

    // Animation continue
    if (speaking) {
      animationFrameRef.current = requestAnimationFrame(draw);
    }
  }, [speaking, drawEyes, drawMouth]);

  // Gestion du clignement des yeux
  const startBlinking = useCallback(() => {
    eyeBlinkInterval.current = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      // Clignement
      drawEyes(ctx, true);
      
      // Retour à la normale après un court délai
      setTimeout(() => {
        drawEyes(ctx, false);
      }, config.blinkDuration);
    }, config.blinkInterval);
  }, [drawEyes]);

  useEffect(() => {
    draw();
    startBlinking();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (eyeBlinkInterval.current) {
        clearInterval(eyeBlinkInterval.current);
      }
    };
  }, [draw, startBlinking]);

  return (
    <canvas
      ref={canvasRef}
      width="240"
      height="240"
      className="border rounded-lg shadow-lg"
      style={{ backgroundColor: '#f0f0f0' }}
    />
  );
};

export default QTCanvasAvatar; 