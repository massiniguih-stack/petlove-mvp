'use client';

import Image from 'next/image';

interface Icon3DProps {
  size?: number;
  className?: string;
}

// 🐾 Paw — Dashboard
export function PawIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="pawBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="pawPad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <filter id="pawShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* Base pad */}
      <ellipse cx="32" cy="44" rx="14" ry="11" fill="url(#pawPad)" filter="url(#pawShadow)"/>
      {/* Toe pads */}
      <ellipse cx="20" cy="30" rx="6" ry="7" fill="url(#pawPad)" filter="url(#pawShadow)"/>
      <ellipse cx="32" cy="26" rx="6" ry="7" fill="url(#pawPad)" filter="url(#pawShadow)"/>
      <ellipse cx="44" cy="30" rx="6" ry="7" fill="url(#pawPad)" filter="url(#pawShadow)"/>
      {/* 3D top face */}
      <ellipse cx="32" cy="42" rx="12" ry="8" fill="url(#pawBase)" opacity="0.15"/>
      {/* Highlight */}
      <ellipse cx="28" cy="41" rx="6" ry="4" fill="white" opacity="0.2"/>
    </svg>
  );
}

// 📅 Calendar — Linha do tempo
export function CalendarIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/calendar.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 🏃 Activity — Atividades
export function ActivityIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/heart.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 🦴 Bowl — Ração
export function BowlIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="bowlBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="bowlInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="100%" stopColor="#10b981"/>
        </linearGradient>
        <linearGradient id="bowlFood" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <filter id="bowlShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* 3D side */}
      <path d="M12 34 L16 50 L48 50 L52 34 Z" fill="#0f172a" filter="url(#bowlShadow)"/>
      {/* Bowl body */}
      <ellipse cx="32" cy="34" rx="20" ry="6" fill="url(#bowlBody)"/>
      {/* Bowl inner */}
      <ellipse cx="32" cy="34" rx="16" ry="4" fill="url(#bowlInner)"/>
      {/* Food kibble */}
      <circle cx="26" cy="33" r="2.5" fill="url(#bowlFood)"/>
      <circle cx="32" cy="32" r="2.5" fill="url(#bowlFood)"/>
      <circle cx="38" cy="33" r="2.5" fill="url(#bowlFood)"/>
      <circle cx="29" cy="30" r="2" fill="#fcd34d"/>
      <circle cx="35" cy="30" r="2" fill="#fcd34d"/>
      {/* Highlight */}
      <ellipse cx="28" cy="33" rx="6" ry="2" fill="white" opacity="0.15"/>
    </svg>
  );
}

// 📍 Pin — Serviços
export function PinIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/map-pin.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// ⚙️ Gear — Editar perfil
export function GearIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/setting.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// ⚖️ Scale — Peso (Dashboard)
export function ScaleIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="scaleBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <linearGradient id="scaleMetal" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#64748b"/>
        </linearGradient>
        <filter id="scaleShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* 3D base */}
      <path d="M20 52 L16 56 L48 56 L44 52 Z" fill="#92400e" filter="url(#scaleShadow)"/>
      {/* Pillar */}
      <rect x="30" y="20" width="4" height="32" rx="2" fill="url(#scaleMetal)"/>
      {/* Beam */}
      <rect x="12" y="18" width="40" height="4" rx="2" fill="url(#scaleBody)"/>
      {/* Left pan */}
      <ellipse cx="18" cy="28" rx="8" ry="3" fill="url(#scaleMetal)"/>
      <path d="M10 28 L10 32 L26 32 L26 28" fill="url(#scaleMetal)" opacity="0.8"/>
      {/* Right pan */}
      <ellipse cx="46" cy="28" rx="8" ry="3" fill="url(#scaleMetal)"/>
      <path d="M38 28 L38 32 L54 32 L54 28" fill="url(#scaleMetal)" opacity="0.8"/>
      {/* Top knob */}
      <circle cx="32" cy="16" r="4" fill="url(#scaleBody)"/>
      {/* Highlight */}
      <ellipse cx="28" cy="16" rx="2" ry="2" fill="white" opacity="0.3"/>
    </svg>
  );
}

// 🎯 Target — Objetivo (Dashboard)
export function TargetIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/target.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 📍 Building — Serviços (Dashboard)
export function BuildingIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="buildBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7"/>
          <stop offset="100%" stopColor="#9333ea"/>
        </linearGradient>
        <linearGradient id="buildSide" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#6d28d9"/>
        </linearGradient>
        <linearGradient id="buildWindow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef3c7"/>
          <stop offset="100%" stopColor="#fde68a"/>
        </linearGradient>
        <filter id="buildShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* 3D side */}
      <path d="M16 22 L12 26 L12 52 L16 56 L16 22 Z" fill="url(#buildSide)" filter="url(#buildShadow)"/>
      {/* Main building */}
      <rect x="16" y="18" width="28" height="38" rx="2" fill="url(#buildBody)"/>
      {/* Roof */}
      <rect x="14" y="14" width="32" height="6" rx="2" fill="url(#buildSide)"/>
      {/* Windows */}
      <rect x="20" y="24" width="6" height="6" rx="1" fill="url(#buildWindow)"/>
      <rect x="30" y="24" width="6" height="6" rx="1" fill="url(#buildWindow)"/>
      <rect x="20" y="34" width="6" height="6" rx="1" fill="url(#buildWindow)"/>
      <rect x="30" y="34" width="6" height="6" rx="1" fill="url(#buildWindow)"/>
      {/* Door */}
      <rect x="26" y="44" width="8" height="10" rx="1" fill="#fef3c7"/>
      {/* Paw on door */}
      <ellipse cx="30" cy="48" rx="2" ry="1.5" fill="#9333ea"/>
      <circle cx="28" cy="46" r="1" fill="#9333ea"/>
      <circle cx="30" cy="45" r="1" fill="#9333ea"/>
      <circle cx="32" cy="46" r="1" fill="#9333ea"/>
      {/* Highlight */}
      <rect x="18" y="20" width="8" height="12" rx="1" fill="white" opacity="0.1"/>
    </svg>
  );
}

// 📊 Chart — Progresso (Dashboard)
export function ChartIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/chart.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}
