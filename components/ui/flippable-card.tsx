'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn, getCardGlowStyle } from '@/lib/utils';
import type { Card } from '@/types/card';

interface FlippableCardProps {
  card: Card;
  className?: string;
  isFlipped?: boolean;
}

export function FlippableCard({ card, className, isFlipped }: FlippableCardProps) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [playInitialShine, setPlayInitialShine] = useState(false);

  const src = card.image_url || '/card-back.png';
  const alt = card.name;

  const shouldBeFlipped = isFlipped !== undefined ? isFlipped : hasLoaded;
  
  const glowStyle = getCardGlowStyle(card);

  useEffect(() => {
    // Este efecto solo se encarga de disparar el brillo inicial
    if (shouldBeFlipped && !playInitialShine) {
      const timer = setTimeout(() => {
        setPlayInitialShine(true);
      }, 750); // Empieza justo después de la animación de volteo
      return () => clearTimeout(timer);
    } 
    // Si la carta se vuelve a poner de espaldas, reseteamos el estado
    else if (!shouldBeFlipped) {
      setPlayInitialShine(false);
    }
  }, [shouldBeFlipped]);

  // --- INICIO DE LA MODIFICACIÓN ---
  // Este nuevo efecto se encarga de resetear la animación del brillo inicial
  // para que el hover vuelva a funcionar.
  useEffect(() => {
    if (playInitialShine) {
      // Después de que la animación termine (1200ms), reseteamos el estado.
      const resetTimer = setTimeout(() => {
        setPlayInitialShine(false);
      }, 1200); 
      return () => clearTimeout(resetTimer);
    }
  }, [playInitialShine]);
  // --- FIN DE LA MODIFICACIÓN ---

  return (
    <div className={cn("w-full h-full [perspective:1000px]", className)}>
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
          shouldBeFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Lado Trasero */}
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <Image
            src="/card-back.png"
            alt="Dorso de la carta"
            fill
            sizes="150px"
            className="object-cover"
            priority
          />
        </div>

        {/* Lado Frontal */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] group overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="150px"
            className="object-cover"
            onLoad={() => setHasLoaded(true)}
          />
          <div
            style={glowStyle}
            className={cn(
              "absolute top-[-50%] left-[-50%] w-[200%] h-[200%]",
              "bg-[linear-gradient(0deg,transparent_40%,var(--glow-color)_48%,var(--glow-hotspot-color)_50%,var(--glow-color)_52%,transparent_60%)]",
              "rotate-[-45deg]",
              "transition-transform duration-[1200ms] ease-in-out",
              // Estado inicial: invisible y arriba
              "opacity-0 translate-y-[-100%]",
              // El brillo se activa al pasar el ratón O cuando 'playInitialShine' es verdadero
              "group-hover:opacity-70 group-hover:translate-y-[100%]",
              playInitialShine && "opacity-70 translate-y-[100%]"
            )}
          />
        </div>
      </div>
    </div>
  );
}
