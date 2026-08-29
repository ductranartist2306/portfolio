import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      });

      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: 'power3.out',
      });
    };

    const onMouseDown = () => {
      gsap.to([cursor, follower], { scale: 0.8, duration: 0.2 });
    };

    const onMouseUp = () => {
      gsap.to([cursor, follower], { scale: 1, duration: 0.2 });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      {/* Tiny Point Cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-[#C8A97E] rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />

      {/* Lagging Ring Follower */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-[#C8A97E]/50 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 hidden md:block transition-transform"
      />
    </>
  );
};
