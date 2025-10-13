'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FlippableCardProps {
  src: string;
  alt: string;
  className?: string;
  isFlipped?: boolean;
}

export function FlippableCard({ src, alt, className, isFlipped }: FlippableCardProps) {
  const [hasLoaded, setHasLoaded] = useState(false);

  // Lógica de volteo:
  // 1. Si el padre nos dice si está volteada (isFlipped no es undefined), obedecemos.
  // 2. Si no, nos volteamos solos cuando la imagen ha cargado (hasLoaded).
  const shouldBeFlipped = isFlipped !== undefined ? isFlipped : hasLoaded;

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
            className="object-cover" // Sin bordes redondeados
            priority
          />
        </div>

        {/* Lado Frontal */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] group"> {/* 'group' se mueve aquí para aislar el hover */}
          <Image
            src={src}
            alt={alt}
            fill
            sizes="150px"
            className="object-cover" // Sin bordes redondeados
            onLoad={() => setHasLoaded(true)}
          />
          {/* La capa de brillo solo responde al 'group-hover' de su padre inmediato (el lado frontal) */}
          <div 
            className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] bg-[position:-100%_-100%] bg-no-repeat transition-all duration-[0s] group-hover:bg-[position:200%_200%] group-hover:duration-[1500ms]"
          />
        </div>
      </div>
    </div>
  );
}