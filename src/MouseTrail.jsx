import React, { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    
    // Physics Configuration matching the exact "revolt.digital" tubes
    const numTubes = 5;      // Number of intertwining 3D tubes
    const numPoints = 80;    // Length of the tubes
    const spring = 0.02;     // Smooth spring physics
    const friction = 0.90;   // Butter-smooth gliding
    
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let velocity = { x: 0, y: 0 };
    
    const tubes = [];
    for (let i = 0; i < numTubes; i++) {
        const points = [];
        for (let j = 0; j < numPoints; j++) {
            points.push({ x: mouse.x, y: mouse.y, vx: 0, vy: 0 });
        }
        tubes.push(points);
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
      
      velocity.x = mouse.x - lastMouse.x;
      velocity.y = mouse.y - lastMouse.y;
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Primary Neon Greenish Color
    const baseColor = { r: 196, g: 240, b: 0 }; 

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Smooth mouse interpolation
      pos.x += (mouse.x - pos.x) * 0.12;
      pos.y += (mouse.y - pos.y) * 0.12;
      
      // Decay velocity
      velocity.x *= 0.95;
      velocity.y *= 0.95;
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      const spread = Math.min(speed * 0.4, 40) + 10;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Screen blending to make the overlapping tubes glow brightly like WebGL
      ctx.globalCompositeOperation = 'screen';

      tubes.forEach((points, tubeIndex) => {
          
          const timeOffset = time * 0.0015 + tubeIndex * (Math.PI * 2 / numTubes);
          
          // Tube head orbits around the mouse based on speed, creating a 3D ribbon twist
          points[0].x = pos.x + Math.cos(timeOffset) * spread;
          points[0].y = pos.y + Math.sin(timeOffset) * spread;
          
          // Physics calculation for butter-smooth tail
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
          
          // Render each tube segment with 4 passes to create the illusion of 3D Glass/Neon
          for (let i = 1; i < numPoints - 1; i++) {
              const p0 = points[i - 1];
              const p1 = points[i];
              const p2 = points[i + 1];
              
              const progress = i / numPoints;
              const reverseProgress = 1 - progress; // 1 at head, 0 at tail
              
              const scale = Math.pow(reverseProgress, 1.2);
              if (scale < 0.02) continue;
              
              const xc1 = (p0.x + p1.x) / 2;
              const yc1 = (p0.y + p1.y) / 2;
              const xc2 = (p1.x + p2.x) / 2;
              const yc2 = (p1.y + p2.y) / 2;
              
              // Helper to draw a spline segment
              const drawSpline = (offsetX, offsetY) => {
                  ctx.beginPath();
                  ctx.moveTo(xc1 + offsetX, yc1 + offsetY);
                  ctx.quadraticCurveTo(p1.x + offsetX, p1.y + offsetY, xc2 + offsetX, yc2 + offsetY);
              };

              // Pass 1: Fat Outer Glow
              drawSpline(0, 0);
              ctx.lineWidth = 45 * scale;
              ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.03 * scale})`;
              ctx.stroke();
              
              // Pass 2: Main Tube Body
              drawSpline(0, 0);
              ctx.lineWidth = 18 * scale;
              ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${0.15 * scale})`;
              ctx.stroke();
              
              // Pass 3: Specular Highlight (Offset to create 3D cylinder illusion)
              const offset = -3 * scale; 
              drawSpline(offset, offset);
              ctx.lineWidth = 4 * scale;
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * scale})`;
              ctx.stroke();
              
              // Pass 4: Bright Inner Core
              drawSpline(0, 0);
              ctx.lineWidth = 2 * scale;
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * scale})`;
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
        filter: 'blur(1px)', // Softens the lines to look like glowing WebGL shaders
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default MouseTrail;
