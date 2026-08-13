'use client';

import Image from 'next/image';
import { getBreedDogSrc, getPorteDogSrc } from '@/lib/breedDogIcon';

type Props = {
  size?: number;
  className?: string;
  /** Nome da raça do pet (card Raça / avatar). */
  raca?: string | null;
  /** Peso em kg — usado no fallback e no card Porte. */
  peso?: number | null;
  /** Se true, ignora raça e usa só o cão do porte. */
  mode?: 'breed' | 'porte';
  alt?: string;
};

/**
 * Cão Soft 3D por raça (top BR) ou por porte (P/M/G).
 */
export function BreedDogIcon({
  size = 80,
  className = '',
  raca,
  peso,
  mode = 'breed',
  alt = 'Cão',
}: Props) {
  const src =
    mode === 'porte' && peso != null && Number.isFinite(peso)
      ? getPorteDogSrc(peso)
      : getBreedDogSrc(raca, peso);

  return (
    <span
      className={`icon-3d inline-flex shrink-0 items-center justify-center ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="h-full w-full object-contain"
        style={{ width: size, height: size, maxWidth: '100%', maxHeight: '100%', background: 'transparent' }}
        unoptimized
      />
    </span>
  );
}
