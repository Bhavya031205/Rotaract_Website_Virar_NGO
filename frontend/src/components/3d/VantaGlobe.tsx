import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import GLOBE from 'vanta/dist/vanta.globe.min';

export const VantaGlobe = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (vantaEffect) vantaEffect.destroy();

    if (vantaRef.current) {
      setVantaEffect(
        GLOBE({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          
          // === 🎨 PURE WHITE BACKGROUND ===
          color: 0x181897,       // Deep Blue Lines
          color2: 0x231ce8,      // Bright Blue Dots
          backgroundColor: 0xffffff, // 👈 White
          // ============================

          size: 1.10,
          THREE: THREE, 
        })
      );
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return <div ref={vantaRef} className="absolute inset-0 z-0 pointer-events-none" />;
};