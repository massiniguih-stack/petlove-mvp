'use client';

import Image from 'next/image';

export interface Icon3DProps {
  size?: number;
  className?: string;
  /**
   * Multiplica o tamanho final (raro). Default 1 = `size` em pixels reais.
   * Em círculos/slots apertados, mantenha 1.
   */
  scale?: number;
}

/**
 * Ícone Soft 3D do set Patinha.
 *
 * Contrato: o desenho cabe inteiro em `size * scale` pixels.
 * Não “vaza” nem “corta” sozinho — o slot visual = o desenho.
 * Se o pai tiver overflow-hidden e for menor que size, aí sim corta (ajuste o pai ou o size).
 */
function IconImage({
  src,
  size = 56,
  className = '',
  alt = '',
  scale = 1,
}: {
  src: string;
  size?: number;
  className?: string;
  alt?: string;
  scale?: number;
}) {
  const box = Math.max(1, Math.round(size * scale));
  return (
    <span
      className={`icon-3d inline-flex shrink-0 items-center justify-center ${className}`.trim()}
      style={{ width: box, height: box }}
    >
      <Image
        src={src}
        alt={alt}
        width={box}
        height={box}
        className="h-full w-full object-contain"
        style={{ width: box, height: box, maxWidth: '100%', maxHeight: '100%', background: 'transparent' }}
        unoptimized
      />
    </span>
  );
}

// ─── Set principal ───────────────────────────────────────────────────────────

export function PawIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/patinha.png" alt="Dashboard" size={size} className={className} scale={scale} />;
}

export function CalendarIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/calendario.png" alt="Linha do tempo" size={size} className={className} scale={scale} />;
}

export function ActivityIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/atividades.png" alt="Atividades" size={size} className={className} scale={scale} />;
}

export function BowlIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/racao.png" alt="Ração" size={size} className={className} scale={scale} />;
}

export function PinIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/servicos.png" alt="Serviços" size={size} className={className} scale={scale} />;
}

export function GearIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/perfil.png" alt="Editar perfil" size={size} className={className} scale={scale} />;
}

export function HealthIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/saude.png" alt="Saúde" size={size} className={className} scale={scale} />;
}

export function PremiumIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/premium.png" alt="Premium" size={size} className={className} scale={scale} />;
}

// ─── Pack auxiliar ───────────────────────────────────────────────────────────

export function DogIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/dog.png" alt="Mascote Patinha" size={size} className={className} scale={scale} />;
}

export function MascotTileIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/mascote-tile.png" alt="Patinha" size={size} className={className} scale={scale} />;
}

export function ChartIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/chart.png" alt="Progresso" size={size} className={className} scale={scale} />;
}

export function StarIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/premium.png" alt="Destaque" size={size} className={className} scale={scale} />;
}

export function ScaleIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/peso.png" alt="Peso" size={size} className={className} scale={scale} />;
}

export function TargetIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/target.png" alt="Objetivo" size={size} className={className} scale={scale} />;
}

export function SearchIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/search.png" alt="Busca" size={size} className={className} scale={scale} />;
}

export function CheckIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/check.png" alt="Sucesso" size={size} className={className} scale={scale} />;
}

export function FileTextIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/file-text.png" alt="Documento" size={size} className={className} scale={scale} />;
}

export function BoneIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/bone.png" alt="Osso" size={size} className={className} scale={scale} />;
}

export function TrophyIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/trophy.png" alt="Troféu" size={size} className={className} scale={scale} />;
}

export function ShieldIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/shield.png" alt="Proteção" size={size} className={className} scale={scale} />;
}

export function FireIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/fire.png" alt="Energia" size={size} className={className} scale={scale} />;
}

export function MedalIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/medal.png" alt="Medalha" size={size} className={className} scale={scale} />;
}

export function CrownIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/crown.png" alt="Coroa" size={size} className={className} scale={scale} />;
}

export function BriefcaseIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/maleta.png" alt="Parceiro / negócio" size={size} className={className} scale={scale} />;
}

export function CakeIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/bolo.png" alt="Aniversário" size={size} className={className} scale={scale} />;
}

export function PartyIcon3D({ size = 56, className = '', scale }: Icon3DProps) {
  return <IconImage src="/icons/3d/festa.png" alt="Celebração" size={size} className={className} scale={scale} />;
}
