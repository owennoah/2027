import React, { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Physics for the elegant, minimal tail
    const numPoints = 40; 
    const spring = 0.15;
    const friction = 0.75;
    
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        points.push({ x: mouse.x, y: mouse.y, vx: 0, vy: 0 });
    }
    
    const text = "OMER • DIGITAL • AGENCY • ";
    const radius = 45; // Radius of the spinning text badge
    
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
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

    const color = { r: 196, g: 240, b: 0 }; // Primary brand color
    const colorStr = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update head of the tail
      points[0].x = mouse.x;
      points[0].y = mouse.y;
      
      // Physics calculation for the smooth tail
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
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // 1. Draw the elegant, minimal tail with segment fading
      for (let i = 1; i < numPoints - 1; i++) {
          const p0 = points[i - 1];
          const p1 = points[i];
          const p2 = points[i + 1];
          
          const progress = i / numPoints;
          const reverseProgress = 1 - progress;
          
          ctx.beginPath();
          const xc1 = (p0.x + p1.x) / 2;
          const yc1 = (p0.y + p1.y) / 2;
          const xc2 = (p1.x + p2.x) / 2;
          const yc2 = (p1.y + p2.y) / 2;
          
          ctx.moveTo(xc1, yc1);
          ctx.quadraticCurveTo(p1.x, p1.y, xc2, yc2);
          
          ctx.lineWidth = 2 * reverseProgress;
          ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${reverseProgress})`;
          ctx.stroke();
      }
      
      // 2. Draw the exact mouse dot
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = colorStr;
      ctx.fill();
      
      // 3. Draw the premium rotating agency text badge around the mouse
      // Use points[4] for a tiny bit of smooth spring delay on the text circle
      const delayedPos = points[4]; 
      
      ctx.save();
      ctx.translate(delayedPos.x, delayedPos.y);
      
      const rotation = time * 0.001; // Slow, elegant rotation
      ctx.rotate(rotation);
      
      ctx.font = "600 10.5px 'Inter', sans-serif";
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.95)`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const charCount = text.length;
      const anglePerChar = (Math.PI * 2) / charCount;
      
      for (let i = 0; i < charCount; i++) {
          ctx.save();
          // Rotate to the character's position on the circle
          ctx.rotate(i * anglePerChar);
          // Move out to the radius
          ctx.translate(0, -radius);
          // Draw the character
          ctx.fillText(text[i], 0, 0);
          ctx.restore();
      }
      
      ctx.restore();

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
        zIndex: 1
      }}
    />
  );
};

export default MouseTrail;
