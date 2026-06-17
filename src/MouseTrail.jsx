import React, { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    
    // Physics variables for the premium cursor
    let mouse = { x: -1000, y: -1000 }; // Start offscreen
    let ring = { x: -1000, y: -1000 };
    
    // Grid configuration for the interactive agency background
    const spacing = 45; // Space between dots
    let dots = [];
    
    const initGrid = () => {
      dots = [];
      const cols = Math.ceil(canvas.width / spacing) + 2;
      const rows = Math.ceil(canvas.height / spacing) + 2;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            originX: i * spacing,
            originY: j * spacing,
            x: i * spacing,
            y: j * spacing,
            size: 1.5,
          });
        }
      }
    };
    
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        initGrid();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Hide default cursor in the hero section to use our custom premium cursor
    if (canvas.parentElement) {
      canvas.parentElement.style.cursor = 'none';
    }

    // Brand Colors
    const accentColor = { r: 196, g: 240, b: 0 }; // #c4f000 Neon Greenish
    
    // Check theme for resting dots
    const getRestingAlpha = () => {
      return document.body.classList.contains('light-mode') 
        ? 'rgba(0, 0, 0, 0.06)' 
        : 'rgba(255, 255, 255, 0.06)';
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update delayed cursor ring (buttery smooth spring)
      ring.x += (mouse.x - ring.x) * 0.15;
      ring.y += (mouse.y - ring.y) * 0.15;
      
      const restingColor = getRestingAlpha();
      
      // -- 1. DRAW INTERACTIVE MAGNETIC GRID --
      dots.forEach(dot => {
        const dx = mouse.x - dot.originX;
        const dy = mouse.y - dot.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Spotlight interaction radius
        const maxDist = 250;
        
        if (dist < maxDist) {
          // Interactive state: Mouse is near the dot
          const pull = Math.pow((maxDist - dist) / maxDist, 1.5); // Exponential falloff for smooth lighting
          
          // Magnetic pull: Dots are gently pulled towards the mouse
          const targetX = dot.originX + dx * 0.2 * pull;
          const targetY = dot.originY + dy * 0.2 * pull;
          
          dot.x += (targetX - dot.x) * 0.1;
          dot.y += (targetY - dot.y) * 0.1;
          
          // Size scales up smoothly
          const currentSize = dot.size + pull * 3;
          
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, currentSize, 0, Math.PI * 2);
          
          // Light up with brand color
          ctx.fillStyle = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${0.1 + pull * 0.9})`;
          
          // Add neon glow to the brightest dots
          if (pull > 0.4) {
            ctx.shadowColor = `rgba(${accentColor.r}, ${accentColor.g}, ${accentColor.b}, ${pull})`;
            ctx.shadowBlur = 15 * pull;
          } else {
            ctx.shadowBlur = 0;
          }
          
          ctx.fill();
          
        } else {
          // Rest state: Mouse is far away
          dot.x += (dot.originX - dot.x) * 0.1;
          dot.y += (dot.originY - dot.y) * 0.1;
          
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.shadowBlur = 0;
          ctx.fillStyle = restingColor;
          ctx.fill();
        }
      });
      
      ctx.shadowBlur = 0; // Reset shadow for cursor

      // -- 2. DRAW PREMIUM CUSTOM CURSOR --
      
      // The exact mouse dot
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`;
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas.parentElement) {
        canvas.parentElement.style.cursor = 'auto'; // Restore cursor
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0 // Place behind hero text
      }}
    />
  );
};

export default MouseTrail;
