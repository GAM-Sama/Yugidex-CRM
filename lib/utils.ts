import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Card } from '@/types/card';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- INICIO DE LA MODIFICACIÓN: Lógica de Colores de Doble Tono ---

/**
 * Devuelve un objeto de estilo con variables CSS para el brillo de la carta.
 * Define un color principal y un "hotspot" más brillante.
 * @param card El objeto de la carta.
 * @returns Un objeto de estilo para usar en el atributo `style`.
 */
export function getCardGlowStyle(card: Card): React.CSSProperties {
  // Definimos el color principal en formato R, G, B y su opacidad
  let mainColor = '255, 255, 255'; // Blanco por defecto
  let opacity = '0.2';
  let isDarkGlow = false;

  if (card.card_type === "Monster") {
    const subtype = card.subtype?.toLowerCase();
    if (subtype?.includes('fusion')) { mainColor = '192, 132, 252'; opacity = '0.6'; }   // violet-400
    else if (subtype?.includes('synchro')) { mainColor = '241, 245, 249'; opacity = '0.8'; } // slate-100
    else if (subtype?.includes('xyz')) { mainColor = '31, 41, 55'; opacity = '0.9'; isDarkGlow = true; } // gray-800
    else if (subtype?.includes('link')) { mainColor = '96, 165, 250'; opacity = '0.7'; }      // blue-400
    else if (subtype?.includes('pendulum')) { mainColor = '34, 197, 94'; opacity = '0.6'; } // green-500
    else { mainColor = '251, 191, 36'; opacity = '0.6'; }      // amber-400
  } else if (card.card_type === "Spell") {
    mainColor = '16, 185, 129'; opacity = '0.7';    // emerald-500
  } else if (card.card_type === "Trap") {
    mainColor = '217, 70, 239'; opacity = '0.6';    // fuchsia-500
  }

  // El hotspot es blanco, excepto para brillos oscuros como el de los Xyz
  const hotspotColor = isDarkGlow ? '150, 150, 170' : '255, 255, 255';
  
  return {
    '--glow-color': `rgba(${mainColor}, ${opacity})`,
    '--glow-hotspot-color': `rgba(${hotspotColor}, ${parseFloat(opacity) + 0.2})`,
  } as React.CSSProperties;
}