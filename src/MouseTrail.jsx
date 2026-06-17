import React, { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    
    // Physics Configuration for Buttery Smooth revolt.digital effect
    const numLines = 6;      // Number of intertwining strands
    const numPoints = 80;    // Length of the trail (higher = longer tail)
    const spring = 0.015;    // Lower = smoother, more delayed
    const friction = 0.93;   // Higher = glides further
    
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let mouseVelocity = { x: 0, y: 0 };
    
    const lines = [];
    for (let i = 0; i < numLines; i++) {
        const points = [];
        for (let j = 0; j < numPoints; j++) {
            points.push({ x: mouse.x, y: mouse.y, vx: 0, vy: 0 });
        }
        lines.push(points);
    }
    
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastMouse = { x: mouse.x, y: mouse.y };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      
      mouseVelocity.x = mouse.x - lastMouse.x;
      mouseVelocity.y = mouse.y - lastMouse.y;
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Accent color: #c4f000 (Neon Greenish)
    const color = { r: 196, g: 240, b: 0 };

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Smooth mouse interpolation
      pos.x += (mouse.x - pos.x) * 0.1;
      pos.y += (mouse.y - pos.y) * 0.1;
      
      // Decay velocity
      mouseVelocity.x *= 0.95;
      mouseVelocity.y *= 0.95;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      // Screen blending mode for that glowing light effect
      ctx.globalCompositeOperation = 'screen';

      const speed = Math.sqrt(mouseVelocity.x ** 2 + mouseVelocity.y ** 2);
      const spread = Math.min(speed * 0.5, 30); // Spread increases with speed

      lines.forEach((points, lineIndex) => {
          
          const timeOffset = time * 0.002 + lineIndex * (Math.PI * 2 / numLines);
          
          // Head orbits around the mouse based on speed, giving a 3D ribbon look
          points[0].x = pos.x + Math.cos(timeOffset) * spread;
          points[0].y = pos.y + Math.sin(timeOffset) * spread;
          
          // Physics calculation
          for (let i = 1; i < numPoints; i++) {
              const p = points[i];
              const prev = points[i - 1];
              
              const dx = prev.x - p.x;
              const dy = prev.y - p.y;
              
              p.vx += dx * spring;
              p.vy += dy * spring;
              
              p.vx *= friction;
              p.vy *= friction;
              
              p.x += p.vx;
              p.y += p.vy;
          }
          
          // Draw segments with cubic bezier for ultimate smoothness
          for (let i = 1; i < numPoints - 1; i++) {
              const p0 = points[i - 1];
              const p1 = points[i];
              const p2 = points[i + 1];
              
              const progress = i / numPoints;
              const reverseProgress = 1 - progress;
              
              // Thick head, sharp taper
              const lineWidth = 30 * Math.pow(reverseProgress, 3); 
              
              if (lineWidth < 0.1) continue;
              
              ctx.beginPath();
              const xc1 = (p0.x + p1.x) / 2;
              const yc1 = (p0.y + p1.y) / 2;
              const xc2 = (p1.x + p2.x) / 2;
              const yc2 = (p1.y + p2.y) / 2;
              
              ctx.moveTo(xc1, yc1);
              ctx.quadraticCurveTo(p1.x, p1.y, xc2, yc2);
              
              const opacity = Math.pow(reverseProgress, 1.5) * 0.4;
              
              // Outer glow
              ctx.lineWidth = lineWidth;
              ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
              ctx.stroke();
              
              // Inner bright core
              ctx.lineWidth = lineWidth * 0.2;
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 1.5})`;
              ctx.stroke();
          }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
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
        zIndex: 1,
        filter: 'blur(2px)' // Emulates the soft WebGL shader blur
      }}
    />
  );
};

export default MouseTrail;
