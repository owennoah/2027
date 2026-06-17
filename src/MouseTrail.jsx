import React, { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    
    let mouse = { x: -1000, y: -1000 }; 
    let delayedMouse = { x: -1000, y: -1000 };
    
    // Grid configuration
    const spacing = 45; 
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
            size: 4, // Large enough to survive the gooey alpha threshold
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

    if (canvas.parentElement) {
      canvas.parentElement.style.cursor = 'none';
    }

    const accentColor = { r: 196, g: 240, b: 0 }; // #c4f000 Neon Greenish

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Smooth interpolation for the main liquid cursor
      delayedMouse.x += (mouse.x - delayedMouse.x) * 0.2;
      delayedMouse.y += (mouse.y - delayedMouse.y) * 0.2;
      
      // All shapes MUST be fully solid opacity for the gooey filter to work properly.
      ctx.fillStyle = `rgb(${accentColor.r}, ${accentColor.g}, ${accentColor.b})`;

      dots.forEach(dot => {
        const dx = delayedMouse.x - dot.originX;
        const dy = delayedMouse.y - dot.originY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Interaction radius
        const maxDist = 180;
        
        if (dist < maxDist) {
          // Mouse is near: pull dot towards mouse strongly to create a liquid merge
          const pull = Math.pow((maxDist - dist) / maxDist, 1.5); 
          
          const targetX = dot.originX + dx * 0.45 * pull;
          const targetY = dot.originY + dy * 0.45 * pull;
          
          dot.x += (targetX - dot.x) * 0.15;
          dot.y += (targetY - dot.y) * 0.15;
          
          // Scale up heavily so it melts seamlessly into the cursor blob
          const targetSize = 4 + pull * 10;
          dot.size += (targetSize - dot.size) * 0.2;
          
        } else {
          // Mouse is far: snap back to grid elastically
          dot.x += (dot.originX - dot.x) * 0.1;
          dot.y += (dot.originY - dot.y) * 0.1;
          dot.size += (4 - dot.size) * 0.1;
        }
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw the central cursor blob
      ctx.beginPath();
      ctx.arc(delayedMouse.x, delayedMouse.y, 16, 0, Math.PI * 2);
      ctx.fill();
      
      // Add a couple of trailing droplets for extra liquid feel
      ctx.beginPath();
      ctx.arc(delayedMouse.x - (mouse.x - delayedMouse.x) * 0.3, 
              delayedMouse.y - (mouse.y - delayedMouse.y) * 0.3, 
              10, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas.parentElement) {
        canvas.parentElement.style.cursor = 'auto'; 
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* 
        Custom Gooey Filter tuned specifically for the canvas grid.
        We use a slightly tighter blur (stdDeviation="5") so the resting dots don't disappear.
      */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="gooey-canvas">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'url(#gooey-canvas)' 
        }}
      />
    </>
  );
};

export default MouseTrail;
