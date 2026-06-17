import React, { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let points = [];
    const maxPoints = 60;
    const numStrands = 5;
    
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
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
      // Mouse coordinates relative to the canvas
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Accent color: #c4f000 (RGB: 196, 240, 0)
    const baseColor = { r: 196, g: 240, b: 0 };

    const render = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      points.push({ x: mouse.x, y: mouse.y, time: time });
      if (points.length > maxPoints) {
        points.shift();
      }

      if (points.length > 1) {
        for (let s = 0; s < numStrands; s++) {
          for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            
            const progress1 = (i - 1) / points.length;
            const progress2 = i / points.length;
            
            // The further back in history (lower progress), the more spread out the strands
            const spread1 = 50 * (1 - progress1); 
            const spread2 = 50 * (1 - progress2); 
            
            // Add oscillation based on time and strand index
            const offset1X = Math.sin(p1.time * 0.002 + s * 1.5) * spread1;
            const offset1Y = Math.cos(p1.time * 0.002 + s * 1.5) * spread1;
            
            const offset2X = Math.sin(p2.time * 0.002 + s * 1.5) * spread2;
            const offset2Y = Math.cos(p2.time * 0.002 + s * 1.5) * spread2;
            
            ctx.beginPath();
            ctx.moveTo(p1.x + offset1X, p1.y + offset1Y);
            ctx.lineTo(p2.x + offset2X, p2.y + offset2Y);
            
            // Opacity fades out towards the tail
            const opacity = Math.pow(progress2, 2.5);
            
            ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
            ctx.lineWidth = 3 * progress2 + 0.5;
            ctx.lineCap = 'round';
            ctx.shadowColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
            ctx.shadowBlur = 15 * progress2;
            ctx.stroke();
          }
        }
      }

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
        zIndex: 1 // Put above background but behind content
      }}
    />
  );
};

export default MouseTrail;
