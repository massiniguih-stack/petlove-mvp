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
    <Image src="/icons/weight.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 🎯 Target — Objetivo (Dashboard)
export function TargetIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/target.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 📊 Chart — Progresso (Dashboard)
export function ChartIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/chart.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 🔍 Search — Estados vazios de busca
export function SearchIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/search.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// ✅ Check — Estados de sucesso
export function CheckIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/check.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 📋 File — Estados vazios de assinatura/documentos
export function FileTextIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/file-text.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}
