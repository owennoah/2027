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
    
    // Make sure background dots adapt to light/dark mode
    const getRestingAlpha = () => {
      return document.body.classList.contains('light-mode') 
        ? 'rgba(0, 0, 0, 0.08)' 
        : 'rgba(255, 255, 255, 0.08)';
    };

    const render = () => {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      gooeyCtx.clearRect(0, 0, gooeyCanvas.width, gooeyCanvas.height);
      
      delayedMouse.x += (mouse.x - delayedMouse.x) * 0.2;
      delayedMouse.y += (mouse.y - delayedMouse.y) * 0.2;
      
      const restingColor = getRestingAlpha();
      
      gooeyCtx.fillStyle = `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`;
      bgCtx.fillStyle = restingColor;

      dots.forEach(dot => {
        const dx = delayedMouse.x - dot.originX;
        const dy = delayedMouse.y - dot.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const maxDist = 180;
        let isGooey = false;
        let gooeySize = 0;
        let bgSize = 1.5;
        
        if (dist < maxDist) {
          const pull = Math.pow((maxDist - dist) / maxDist, 1.5); 
          
          const targetX = dot.originX + dx * 0.5 * pull;
          const targetY = dot.originY + dy * 0.5 * pull;
          
          dot.x += (targetX - dot.x) * 0.15;
          dot.y += (targetY - dot.y) * 0.15;
          
          if (pull > 0.05) {
            isGooey = true;
            gooeySize = pull * 15; 
          }
          
        } else {
          dot.x += (dot.originX - dot.x) * 0.1;
          dot.y += (dot.originY - dot.y) * 0.1;
        }
        
        // Always draw the crisp background dot so the grid is visible
        bgCtx.beginPath();
        bgCtx.arc(dot.x, dot.y, bgSize, 0, Math.PI * 2);
        bgCtx.fill();
        
        // Draw the liquid glob if it is close enough to melt
        if (isGooey) {
          gooeyCtx.beginPath();
          gooeyCtx.arc(dot.x, dot.y, gooeySize, 0, Math.PI * 2);
          gooeyCtx.fill();
        }
      });
      
      // The massive heavy liquid cursor blob
      gooeyCtx.beginPath();
      gooeyCtx.arc(delayedMouse.x, delayedMouse.y, 22, 0, Math.PI * 2);
      gooeyCtx.fill();
      
      // Heavy trailing liquid droplets that stretch
      const velX = mouse.x - delayedMouse.x;
      const velY = mouse.y - delayedMouse.y;
      
      gooeyCtx.beginPath();
      gooeyCtx.arc(delayedMouse.x - velX * 0.4, delayedMouse.y - velY * 0.4, 14, 0, Math.PI * 2);
      gooeyCtx.fill();

      // Sharp mouse tracker dot on the clean background layer
      bgCtx.fillStyle = `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`;
      bgCtx.beginPath();
      bgCtx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
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
      {/* Layer 1: Clean, sharp resting dots that don't get blurred */}
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
      
      {/* Custom Liquid Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="gooey-canvas">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      
      {/* Layer 2: Liquid blobs melting together */}
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
          filter: 'url(#gooey-canvas)' 
        }}
      />
    </>
  );
};

export default MouseTrail;
