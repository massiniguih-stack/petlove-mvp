'use client';

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
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="calBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="calAccent" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c084fc"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
        <filter id="calShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* 3D side */}
      <path d="M14 22 L14 52 L16 54 L50 54 L52 52 L52 22 Z" fill="#0f172a" filter="url(#calShadow)"/>
      {/* Front face */}
      <rect x="14" y="18" width="36" height="34" rx="4" fill="url(#calBody)"/>
      {/* Top bar */}
      <rect x="14" y="18" width="36" height="10" rx="4" fill="url(#calAccent)"/>
      {/* Rings */}
      <rect x="22" y="14" width="3" height="10" rx="1.5" fill="url(#calAccent)"/>
      <rect x="32" y="14" width="3" height="10" rx="1.5" fill="url(#calAccent)"/>
      {/* Grid dots */}
      <circle cx="22" cy="36" r="2" fill="#64748b"/>
      <circle cx="32" cy="36" r="2" fill="#64748b"/>
      <circle cx="42" cy="36" r="2" fill="#64748b"/>
      <circle cx="22" cy="44" r="2" fill="#64748b"/>
      <circle cx="32" cy="44" r="2" fill="#c084fc"/>
      <circle cx="42" cy="44" r="2" fill="#64748b"/>
      {/* Highlight */}
      <rect x="18" y="20" width="12" height="6" rx="2" fill="white" opacity="0.15"/>
    </svg>
  );
}

// 🏃 Activity — Atividades
export function ActivityIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="actBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="actPulse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
        <filter id="actShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* 3D base plate */}
      <rect x="10" y="38" width="44" height="18" rx="4" fill="url(#actBody)" filter="url(#actShadow)"/>
      {/* Top face highlight */}
      <rect x="12" y="36" width="40" height="4" rx="2" fill="white" opacity="0.08"/>
      {/* Pulse line */}
      <polyline points="14,44 22,44 26,38 30,50 34,42 38,46 42,44 50,44" fill="none" stroke="url(#actPulse)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Pulse glow */}
      <polyline points="14,44 22,44 26,38 30,50 34,42 38,46 42,44 50,44" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
      {/* Heart beat dot */}
      <circle cx="30" cy="44" r="2.5" fill="#38bdf8"/>
    </svg>
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
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="pinBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b"/>
          <stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="pinAccent" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb7185"/>
          <stop offset="100%" stopColor="#f43f5e"/>
        </linearGradient>
        <filter id="pinShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* Shadow on ground */}
      <ellipse cx="32" cy="54" rx="8" ry="3" fill="black" opacity="0.2"/>
      {/* Pin body */}
      <path d="M32 8 C20 8 14 18 14 26 C14 40 32 52 32 52 C32 52 50 40 50 26 C50 18 44 8 32 8 Z" fill="url(#pinBody)" filter="url(#pinShadow)"/>
      {/* Accent circle */}
      <circle cx="32" cy="26" r="10" fill="url(#pinAccent)"/>
      {/* Paw inside */}
      <ellipse cx="32" cy="28" rx="4" ry="3" fill="white" opacity="0.9"/>
      <circle cx="27" cy="23" r="2" fill="white" opacity="0.9"/>
      <circle cx="32" cy="21" r="2" fill="white" opacity="0.9"/>
      <circle cx="37" cy="23" r="2" fill="white" opacity="0.9"/>
      {/* Highlight */}
      <ellipse cx="28" cy="22" rx="4" ry="6" fill="white" opacity="0.1"/>
    </svg>
  );
}

// ⚙️ Gear — Editar perfil
export function GearIcon3D({ size = 48, className = '' }: Icon3DProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="gearBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569"/>
          <stop offset="100%" stopColor="#334155"/>
        </linearGradient>
        <linearGradient id="gearAccent" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8"/>
          <stop offset="100%" stopColor="#64748b"/>
        </linearGradient>
        <filter id="gearShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* 3D side */}
      <path d="M26 50 L22 54 L42 54 L38 50 Z" fill="#1e293b" filter="url(#gearShadow)"/>
      {/* Gear body */}
      <path d="M32 8 L36 14 L44 12 L42 20 L50 22 L46 28 L52 34 L44 36 L46 44 L38 42 L36 50 L28 48 L26 54 L20 48 L18 40 L12 42 L14 34 L8 28 L16 22 L14 14 L22 16 Z" fill="url(#gearBody)" filter="url(#gearShadow)"/>
      {/* Inner circle */}
      <circle cx="32" cy="32" r="10" fill="url(#gearAccent)"/>
      {/* Paw inside */}
      <ellipse cx="32" cy="34" rx="3" ry="2.5" fill="#334155"/>
      <circle cx="28" cy="30" r="1.5" fill="#334155"/>
      <circle cx="32" cy="28" r="1.5" fill="#334155"/>
      <circle cx="36" cy="30" r="1.5" fill="#334155"/>
      {/* Highlight */}
      <ellipse cx="28" cy="28" rx="4" ry="6" fill="white" opacity="0.1"/>
    </svg>
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
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="targetOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <linearGradient id="targetMid" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#f1f5f9"/>
        </linearGradient>
        <linearGradient id="targetCenter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <filter id="targetShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* 3D base */}
      <ellipse cx="32" cy="52" rx="16" ry="4" fill="#065f46" filter="url(#targetShadow)"/>
      {/* Outer ring */}
      <circle cx="32" cy="32" r="22" fill="url(#targetOuter)" filter="url(#targetShadow)"/>
      {/* White ring */}
      <circle cx="32" cy="32" r="17" fill="url(#targetMid)"/>
      {/* Mid ring */}
      <circle cx="32" cy="32" r="12" fill="url(#targetOuter)"/>
      {/* Inner white */}
      <circle cx="32" cy="32" r="7" fill="url(#targetMid)"/>
      {/* Center */}
      <circle cx="32" cy="32" r="3" fill="url(#targetCenter)"/>
      {/* Arrow */}
      <path d="M48 16 L52 12 L50 18 Z" fill="#fbbf24"/>
      <line x1="46" y1="18" x2="34" y2="30" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
      {/* Highlight */}
      <ellipse cx="26" cy="26" rx="6" ry="8" fill="white" opacity="0.15"/>
    </svg>
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
    <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
      <defs>
        <linearGradient id="chartBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient>
        <linearGradient id="chartBar1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
        <linearGradient id="chartBar2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <linearGradient id="chartBar3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
        <filter id="chartShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodOpacity="0.3"/>
        </filter>
      </defs>
      {/* 3D base plate */}
      <path d="M10 48 L6 52 L50 52 L46 48 Z" fill="#312e81" filter="url(#chartShadow)"/>
      {/* Grid */}
      <rect x="12" y="14" width="36" height="34" rx="2" fill="url(#chartBase)" filter="url(#chartShadow)"/>
      <line x1="12" y1="22" x2="48" y2="22" stroke="white" strokeWidth="0.5" opacity="0.2"/>
      <line x1="12" y1="30" x2="48" y2="30" stroke="white" strokeWidth="0.5" opacity="0.2"/>
      <line x1="12" y1="38" x2="48" y2="38" stroke="white" strokeWidth="0.5" opacity="0.2"/>
      {/* Bars */}
      <rect x="16" y="26" width="6" height="20" rx="1" fill="url(#chartBar1)"/>
      <rect x="26" y="20" width="6" height="26" rx="1" fill="url(#chartBar2)"/>
      <rect x="36" y="16" width="6" height="30" rx="1" fill="url(#chartBar3)"/>
      {/* Trend line */}
      <polyline points="19,28 29,22 39,18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      {/* Dots on line */}
      <circle cx="19" cy="28" r="2" fill="white"/>
      <circle cx="29" cy="22" r="2" fill="white"/>
      <circle cx="39" cy="18" r="2" fill="white"/>
      {/* Highlight */}
      <rect x="14" y="16" width="10" height="8" rx="1" fill="white" opacity="0.1"/>
    </svg>
  );
}
