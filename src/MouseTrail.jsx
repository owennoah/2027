import React, { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const bgCanvasRef = useRef(null);
  const gooeyCanvasRef = useRef(null);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const gooeyCanvas = gooeyCanvasRef.current;
    if (!bgCanvas || !gooeyCanvas) return;
    
    const bgCtx = bgCanvas.getContext('2d');
    const gooeyCtx = gooeyCanvas.getContext('2d');
    
    let animationFrameId;
    
    let mouse = { x: -1000, y: -1000 }; 
    let delayedMouse = { x: -1000, y: -1000 };
    
    // Grid configuration
    const spacing = 45; 
    let dots = [];
    
    const initGrid = () => {
      dots = [];
      const cols = Math.ceil(bgCanvas.width / spacing) + 2;
      const rows = Math.ceil(bgCanvas.height / spacing) + 2;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          dots.push({
            originX: i * spacing,
            originY: j * spacing,
            x: i * spacing,
            y: j * spacing,
            size: 1.5, // Keep the resting dots small and faint
          });
        }
      }
    };
    
    const resizeCanvas = () => {
      if (bgCanvas.parentElement) {
        const w = bgCanvas.parentElement.clientWidth;
        const h = bgCanvas.parentElement.clientHeight;
        bgCanvas.width = w;
        bgCanvas.height = h;
        gooeyCanvas.width = w;
        gooeyCanvas.height = h;
        initGrid();
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      const rect = bgCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    if (bgCanvas.parentElement) {
      bgCanvas.parentElement.style.cursor = 'none';
    }

    const accentColor = { r: 196, g: 240, b: 0 }; 
    
    const getRestingAlpha = () => {
      return document.body.classList.contains('light-mode') 
        ? 'rgba(0, 0, 0, 0.08)' 
        : 'rgba(255, 255, 255, 0.08)';
    };

    const render = () => {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      gooeyCtx.clearRect(0, 0, gooeyCanvas.width, gooeyCanvas.height);
      
      // Slower, heavier interpolation for extreme liquid physics
      delayedMouse.x += (mouse.x - delayedMouse.x) * 0.12;
      delayedMouse.y += (mouse.y - delayedMouse.y) * 0.12;
      
      const restingColor = getRestingAlpha();
      
      gooeyCtx.fillStyle = `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`;
      bgCtx.fillStyle = restingColor;

      dots.forEach(dot => {
        const dx = delayedMouse.x - dot.originX;
        const dy = delayedMouse.y - dot.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Massive interaction radius for intense gravity
        const maxDist = 300;
        
        let isGooey = false;
        let gooeySize = 0;
        
        if (dist < maxDist) {
          const pull = Math.pow((maxDist - dist) / maxDist, 1.5); 
          
          // Extreme gravity pull toward the mouse
          const targetX = dot.originX + dx * 0.85 * pull;
          const targetY = dot.originY + dy * 0.85 * pull;
          
          dot.x += (targetX - dot.x) * 0.15;
          dot.y += (targetY - dot.y) * 0.15;
          
          // If pull is strong enough, spawn a liquid glob on the gooey layer
          if (pull > 0.05) {
            isGooey = true;
            gooeySize = pull * 22; // Inflates massively to melt into the cursor
          }
        } else {
          // Snap back to grid elastically
          dot.x += (dot.originX - dot.x) * 0.08;
          dot.y += (dot.originY - dot.y) * 0.08;
        }
        
        // 1. Draw the faint grid dot on the background
        bgCtx.beginPath();
        bgCtx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        bgCtx.fill();
        
        // 2. Draw the liquid glob on the gooey layer if affected by gravity
        if (isGooey) {
          gooeyCtx.beginPath();
          gooeyCtx.arc(dot.x, dot.y, gooeySize, 0, Math.PI * 2);
          gooeyCtx.fill();
        }
      });
      
      // Draw the central heavy liquid cursor blob
      gooeyCtx.beginPath();
      gooeyCtx.arc(delayedMouse.x, delayedMouse.y, 25, 0, Math.PI * 2);
      gooeyCtx.fill();
      
      // Add heavy trailing gravity droplets that stretch based on velocity
      const velX = mouse.x - delayedMouse.x;
      const velY = mouse.y - delayedMouse.y;
      
      gooeyCtx.beginPath();
      gooeyCtx.arc(delayedMouse.x - velX * 0.4, delayedMouse.y - velY * 0.4, 15, 0, Math.PI * 2);
      gooeyCtx.fill();
      
      gooeyCtx.beginPath();
      gooeyCtx.arc(delayedMouse.x - velX * 0.7, delayedMouse.y - velY * 0.7, 8, 0, Math.PI * 2);
      gooeyCtx.fill();

      // Exact mouse tracker dot on the clean background layer
      bgCtx.fillStyle = `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`;
      bgCtx.beginPath();
      bgCtx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      bgCtx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (bgCanvas.parentElement) {
        bgCanvas.parentElement.style.cursor = 'auto'; 
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Layer 1: Clean, small resting dots */}
      <canvas 
        ref={bgCanvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      {/* 
        Extreme Liquid Filter
      */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="extreme-gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      
      {/* Layer 2: Massive liquid blobs melting together */}
      <canvas 
        ref={gooeyCanvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1, 
          filter: 'url(#extreme-gooey)' 
        }}
      />
    </>
  );
};

export default MouseTrail;
