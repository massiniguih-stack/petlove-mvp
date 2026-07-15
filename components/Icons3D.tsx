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
        <radialGradient id="pawPad2" cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#fffbeb"/>
          <stop offset="50%" stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#c2650c"/>
        </radialGradient>
        <radialGradient id="pawShadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.32"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0"/>
        </radialGradient>
        <filter id="pawShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodOpacity="0.5"/>
        </filter>
      </defs>
      <ellipse cx="32" cy="59" rx="21" ry="5" fill="url(#pawShadowGrad)"/>
      <ellipse cx="32" cy="43" rx="18.5" ry="14.5" fill="url(#pawPad2)" stroke="#92400e" strokeWidth="0.6" strokeOpacity="0.35" filter="url(#pawShadow)"/>
      <ellipse cx="13.5" cy="26" rx="8.7" ry="10.4" fill="url(#pawPad2)" stroke="#92400e" strokeWidth="0.6" strokeOpacity="0.35" filter="url(#pawShadow)"/>
      <ellipse cx="32" cy="17" rx="8.7" ry="10.4" fill="url(#pawPad2)" stroke="#92400e" strokeWidth="0.6" strokeOpacity="0.35" filter="url(#pawShadow)"/>
      <ellipse cx="50.5" cy="26" rx="8.7" ry="10.4" fill="url(#pawPad2)" stroke="#92400e" strokeWidth="0.6" strokeOpacity="0.35" filter="url(#pawShadow)"/>
      <ellipse cx="26.5" cy="38" rx="7" ry="4.6" fill="white" opacity="0.6"/>
      <ellipse cx="10.5" cy="22.5" rx="3.3" ry="4.5" fill="white" opacity="0.6"/>
      <ellipse cx="29" cy="13.5" rx="3.3" ry="4.5" fill="white" opacity="0.6"/>
      <ellipse cx="47.5" cy="22.5" rx="3" ry="4" fill="white" opacity="0.4"/>
    </svg>
  );
}

// 🐕 Dog — Raça / pet genérico
export function DogIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="dogBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c2410c"/>
          <stop offset="100%" stopColor="#7c2d12"/>
        </linearGradient>
        <linearGradient id="dogEar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9a3412"/>
          <stop offset="100%" stopColor="#5c1a09"/>
        </linearGradient>
        <radialGradient id="dogShadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0"/>
        </radialGradient>
        <filter id="dogShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodOpacity="0.42"/>
        </filter>
      </defs>
      <ellipse cx="32" cy="59" rx="21" ry="5" fill="url(#dogShadowGrad)"/>
      <ellipse cx="13" cy="17" rx="10" ry="14" fill="url(#dogEar)" transform="rotate(-24 13 17)" filter="url(#dogShadow)"/>
      <ellipse cx="51" cy="17" rx="10" ry="14" fill="url(#dogEar)" transform="rotate(24 51 17)" filter="url(#dogShadow)"/>
      <circle cx="32" cy="30" r="22" fill="url(#dogBody)" filter="url(#dogShadow)"/>
      <ellipse cx="32" cy="36" rx="14.5" ry="11.5" fill="#fff7ed"/>
      <ellipse cx="24" cy="26.5" rx="3.9" ry="4.1" fill="#1c1917"/>
      <circle cx="22.5" cy="24.8" r="1.4" fill="white"/>
      <circle cx="25.3" cy="27.6" r="0.6" fill="white" opacity="0.7"/>
      <ellipse cx="40" cy="26.5" rx="3.9" ry="4.1" fill="#1c1917"/>
      <circle cx="38.5" cy="24.8" r="1.4" fill="white"/>
      <circle cx="41.3" cy="27.6" r="0.6" fill="white" opacity="0.7"/>
      <ellipse cx="32" cy="36" rx="5.2" ry="3.7" fill="#1c1917"/>
      <ellipse cx="30" cy="34.3" rx="1.2" ry="0.8" fill="white" opacity="0.6"/>
      <path d="M32 40 Q25.5 45.5 19 41" fill="none" stroke="#7c2d12" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M32 40 Q38.5 45.5 45 41" fill="none" stroke="#7c2d12" strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="16.5" cy="33.5" r="4.2" fill="#fb7185" opacity="0.55"/>
      <circle cx="47.5" cy="33.5" r="4.2" fill="#fb7185" opacity="0.55"/>
      <ellipse cx="23" cy="18" rx="7" ry="9" fill="white" opacity="0.24"/>
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
        <linearGradient id="bowlRim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffedd5"/>
          <stop offset="100%" stopColor="#c2410c"/>
        </linearGradient>
        <linearGradient id="bowlIn" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9a3412"/>
          <stop offset="100%" stopColor="#431407"/>
        </linearGradient>
        <radialGradient id="bowlKibble" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fffbeb"/>
          <stop offset="60%" stopColor="#fde68a"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </radialGradient>
        <radialGradient id="bowlShadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0"/>
        </radialGradient>
        <filter id="bowlShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodOpacity="0.45"/>
        </filter>
      </defs>
      <ellipse cx="32" cy="57" rx="21" ry="5" fill="url(#bowlShadowGrad)"/>
      <path d="M10 30 C10 30 13 47 17.5 50 C22.5 53.5 41.5 53.5 46.5 50 C51 47 54 30 54 30 Z" fill="url(#bowlRim)" filter="url(#bowlShadow)"/>
      <ellipse cx="32" cy="30" rx="22" ry="8.5" fill="url(#bowlRim)"/>
      <ellipse cx="32" cy="30.5" rx="16.5" ry="5.6" fill="url(#bowlIn)"/>
      <circle cx="24.5" cy="29" r="3.6" fill="url(#bowlKibble)"/>
      <circle cx="32" cy="27.3" r="3.6" fill="url(#bowlKibble)"/>
      <circle cx="39.5" cy="29" r="3.6" fill="url(#bowlKibble)"/>
      <circle cx="28" cy="32" r="3" fill="#fbbf24"/>
      <circle cx="36" cy="32" r="3" fill="#fbbf24"/>
      <circle cx="32" cy="33.6" r="2.6" fill="#f59e0b"/>
      <circle cx="23.3" cy="27.8" r="1" fill="white" opacity="0.8"/>
      <circle cx="30.7" cy="26" r="1" fill="white" opacity="0.8"/>
      <ellipse cx="22" cy="26.5" rx="8" ry="2.4" fill="white" opacity="0.35"/>
      <ellipse cx="20" cy="21.5" rx="4.5" ry="1.4" fill="white" opacity="0.4"/>
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

// 🦴 Bone — Marco 4 meses (Linha do tempo)
export function BoneIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/bone.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// ⭐ Star — Marco 1a6m (Linha do tempo)
export function StarIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/star.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 🏆 Trophy — Marco 2 anos (Linha do tempo)
export function TrophyIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/trophy.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 🛡️ Shield — Vitamina E (Suplementação)
export function ShieldIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/shield.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 🔥 Fire — Calorias (Porções diárias)
export function FireIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/fire.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 🎖️ Medal — Marcos 4a/7a (Linha do tempo)
export function MedalIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/medal.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}

// 👑 Crown — Marco 10a (Linha do tempo)
export function CrownIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <Image src="/icons/crown.png" alt="" width={size} height={size} className={className} unoptimized />
  );
}
