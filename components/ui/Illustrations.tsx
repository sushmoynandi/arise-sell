export function RocketIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="200" cy="200" r="180" fill="#EEF2FF" />
      <circle cx="200" cy="200" r="140" fill="#E0E7FF" opacity="0.5" />

      {/* Stars */}
      <circle cx="80" cy="100" r="4" fill="#F97316" opacity="0.6" />
      <circle cx="320" cy="80" r="3" fill="#4F46E5" opacity="0.5" />
      <circle cx="300" cy="300" r="5" fill="#F97316" opacity="0.4" />
      <circle cx="100" cy="280" r="3" fill="#4F46E5" opacity="0.6" />
      <circle cx="150" cy="60" r="2" fill="#F97316" opacity="0.8" />
      <circle cx="340" cy="180" r="3" fill="#4F46E5" opacity="0.4" />

      {/* Rocket body */}
      <g transform="translate(140, 80) rotate(15, 60, 120)">
        <path d="M60 0 C60 0 20 80 20 160 C20 200 60 220 60 220 C60 220 100 200 100 160 C100 80 60 0 60 0Z" fill="#4F46E5" />
        <path d="M60 0 C60 0 60 80 60 160 C60 200 60 220 60 220 C60 220 100 200 100 160 C100 80 60 0 60 0Z" fill="#4338CA" />

        {/* Window */}
        <circle cx="60" cy="100" r="20" fill="#E0E7FF" />
        <circle cx="60" cy="100" r="14" fill="#FFFFFF" />
        <circle cx="55" cy="95" r="4" fill="#C7D2FE" opacity="0.6" />

        {/* Fins */}
        <path d="M20 160 L0 200 L20 190Z" fill="#F97316" />
        <path d="M100 160 L120 200 L100 190Z" fill="#F97316" />

        {/* Flame */}
        <path d="M40 220 C40 220 50 260 60 270 C70 260 80 220 80 220" fill="#F97316" />
        <path d="M48 220 C48 220 55 250 60 255 C65 250 72 220 72 220" fill="#FBBF24" />
        <path d="M54 220 C54 220 58 240 60 242 C62 240 66 220 66 220" fill="#FEF3C7" />
      </g>

      {/* Clouds */}
      <ellipse cx="100" cy="320" rx="50" ry="15" fill="#E2E8F0" opacity="0.6" />
      <ellipse cx="280" cy="340" rx="60" ry="12" fill="#E2E8F0" opacity="0.4" />
      <ellipse cx="200" cy="350" rx="40" ry="10" fill="#E2E8F0" opacity="0.5" />

      {/* Speed lines */}
      <line x1="90" y1="200" x2="60" y2="240" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
      <line x1="110" y1="230" x2="80" y2="270" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
      <line x1="280" y1="180" x2="310" y2="220" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function WaitlistIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background shape */}
      <rect x="40" y="30" width="320" height="290" rx="20" fill="#F8FAFC" />

      {/* Phone mockup */}
      <rect x="120" y="50" width="160" height="260" rx="20" fill="#0F172A" />
      <rect x="128" y="62" width="144" height="236" rx="14" fill="#FFFFFF" />

      {/* Notch */}
      <rect x="170" y="55" width="60" height="6" rx="3" fill="#1E293B" />

      {/* Screen content */}
      <rect x="140" y="82" width="120" height="10" rx="5" fill="#E2E8F0" />

      {/* Position number */}
      <text x="200" y="135" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#4F46E5" fontFamily="system-ui">#47</text>
      <rect x="155" y="148" width="90" height="6" rx="3" fill="#E2E8F0" />

      {/* Progress bar */}
      <rect x="145" y="170" width="110" height="8" rx="4" fill="#EEF2FF" />
      <rect x="145" y="170" width="68" height="8" rx="4" fill="#4F46E5" />

      {/* Referral link box */}
      <rect x="145" y="195" width="110" height="24" rx="6" fill="#F8FAFC" stroke="#E2E8F0" />
      <rect x="220" y="199" width="30" height="16" rx="4" fill="#4F46E5" />

      {/* Share buttons */}
      <circle cx="165" cy="240" r="12" fill="#EEF2FF" />
      <circle cx="200" cy="240" r="12" fill="#FFF7ED" />
      <circle cx="235" cy="240" r="12" fill="#ECFDF5" />

      {/* People avatars floating */}
      <circle cx="70" cy="100" r="22" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
      <circle cx="70" cy="95" r="7" fill="#4F46E5" opacity="0.4" />
      <path d="M55 112 C55 105 85 105 85 112" fill="#4F46E5" opacity="0.3" />

      <circle cx="330" cy="130" r="22" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="2" />
      <circle cx="330" cy="125" r="7" fill="#F97316" opacity="0.4" />
      <path d="M315 142 C315 135 345 135 345 142" fill="#F97316" opacity="0.3" />

      <circle cx="60" cy="220" r="18" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
      <circle cx="60" cy="216" r="6" fill="#10B981" opacity="0.4" />
      <path d="M48 230 C48 224 72 224 72 230" fill="#10B981" opacity="0.3" />

      <circle cx="340" cy="250" r="18" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
      <circle cx="340" cy="246" r="6" fill="#4F46E5" opacity="0.4" />
      <path d="M328 260 C328 254 352 254 352 260" fill="#4F46E5" opacity="0.3" />

      {/* Connection lines */}
      <line x1="88" y1="100" x2="120" y2="120" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="312" y1="130" x2="280" y2="140" stroke="#FED7AA" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="76" y1="220" x2="120" y2="200" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="4 4" />
      <line x1="324" y1="250" x2="280" y2="230" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Arrows showing viral */}
      <path d="M92 100 L105 110" stroke="#4F46E5" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function CountdownIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect x="20" y="20" width="360" height="260" rx="20" fill="#F8FAFC" />

      {/* Clock face */}
      <circle cx="200" cy="140" r="100" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="3" />
      <circle cx="200" cy="140" r="90" fill="#FFFFFF" stroke="#EEF2FF" strokeWidth="2" />

      {/* Hour markers */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <line
          key={i}
          x1={200 + 78 * Math.cos((angle * Math.PI) / 180)}
          y1={140 + 78 * Math.sin((angle * Math.PI) / 180)}
          x2={200 + 85 * Math.cos((angle * Math.PI) / 180)}
          y2={140 + 85 * Math.sin((angle * Math.PI) / 180)}
          stroke="#CBD5E1"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}

      {/* Clock hands */}
      <line x1="200" y1="140" x2="200" y2="75" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <line x1="200" y1="140" x2="250" y2="140" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />

      {/* Center dot */}
      <circle cx="200" cy="140" r="5" fill="#4F46E5" />

      {/* Decorative elements */}
      <rect x="50" y="40" width="40" height="40" rx="8" fill="#EEF2FF" />
      <text x="70" y="66" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#4F46E5" fontFamily="system-ui">07</text>

      <rect x="310" y="40" width="40" height="40" rx="8" fill="#FFF7ED" />
      <text x="330" y="66" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#F97316" fontFamily="system-ui">12</text>

      <rect x="50" y="220" width="40" height="40" rx="8" fill="#FFF7ED" />
      <text x="70" y="246" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#F97316" fontFamily="system-ui">23</text>

      <rect x="310" y="220" width="40" height="40" rx="8" fill="#EEF2FF" />
      <text x="330" y="246" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#4F46E5" fontFamily="system-ui">59</text>

      {/* Sparks */}
      <circle cx="120" cy="55" r="3" fill="#F97316" opacity="0.5" />
      <circle cx="290" cy="255" r="4" fill="#4F46E5" opacity="0.4" />
      <circle cx="330" cy="150" r="3" fill="#F97316" opacity="0.3" />
    </svg>
  );
}

export function FounderIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 380" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect x="10" y="10" width="280" height="360" rx="20" fill="#F8FAFC" />

      {/* Person */}
      <circle cx="150" cy="130" r="50" fill="#EEF2FF" />
      <circle cx="150" cy="120" r="28" fill="#C7D2FE" />
      <path d="M105 175 C105 150 195 150 195 175 L195 200 L105 200Z" fill="#4F46E5" />

      {/* Laptop */}
      <rect x="85" y="200" width="130" height="80" rx="8" fill="#0F172A" />
      <rect x="92" y="207" width="116" height="66" rx="4" fill="#1E293B" />

      {/* Screen content */}
      <rect x="100" y="215" width="50" height="4" rx="2" fill="#4F46E5" opacity="0.6" />
      <rect x="100" y="224" width="80" height="3" rx="1.5" fill="#475569" opacity="0.3" />
      <rect x="100" y="232" width="65" height="3" rx="1.5" fill="#475569" opacity="0.3" />
      <rect x="100" y="245" width="40" height="14" rx="4" fill="#4F46E5" />
      <rect x="150" y="245" width="40" height="14" rx="4" fill="#F97316" opacity="0.3" />

      {/* Laptop base */}
      <rect x="70" y="280" width="160" height="8" rx="4" fill="#1E293B" />

      {/* Floating elements */}
      <rect x="20" y="90" width="40" height="40" rx="10" fill="#FFF7ED" />
      <text x="40" y="117" textAnchor="middle" fontSize="20" fill="#F97316">💡</text>

      <rect x="240" y="80" width="40" height="40" rx="10" fill="#EEF2FF" />
      <text x="260" y="107" textAnchor="middle" fontSize="20" fill="#4F46E5">🚀</text>

      <rect x="30" y="240" width="36" height="36" rx="10" fill="#ECFDF5" />
      <text x="48" y="265" textAnchor="middle" fontSize="18" fill="#10B981">✓</text>

      <rect x="240" y="220" width="36" height="36" rx="10" fill="#FEF2F2" />
      <text x="258" y="245" textAnchor="middle" fontSize="18" fill="#EF4444">♥</text>

      {/* Connection dots */}
      <circle cx="55" cy="170" r="3" fill="#4F46E5" opacity="0.3" />
      <circle cx="250" cy="160" r="3" fill="#F97316" opacity="0.3" />

      {/* Desk */}
      <rect x="50" y="296" width="200" height="4" rx="2" fill="#E2E8F0" />

      {/* Coffee cup */}
      <rect x="220" y="282" width="16" height="14" rx="3" fill="#D4A574" opacity="0.6" />
      <path d="M236 286 C240 286 242 290 236 294" stroke="#D4A574" strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}

export function PressKitIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect x="20" y="20" width="360" height="260" rx="20" fill="#F8FAFC" />

      {/* Folder */}
      <path d="M80 80 L80 240 L320 240 L320 100 L200 100 L180 80Z" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="2" />
      <path d="M80 100 L320 100 L320 240 L80 240Z" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="2" />

      {/* Document 1 - image */}
      <rect x="100" y="120" width="80" height="100" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="108" y="128" width="64" height="45" rx="4" fill="#EEF2FF" />
      <circle cx="125" cy="145" r="8" fill="#4F46E5" opacity="0.3" />
      <path d="M108 160 L130 148 L150 158 L172 140 L172 173 L108 173Z" fill="#4F46E5" opacity="0.2" />
      <rect x="108" y="184" width="50" height="4" rx="2" fill="#E2E8F0" />
      <rect x="108" y="194" width="35" height="4" rx="2" fill="#E2E8F0" />

      {/* Document 2 - text */}
      <rect x="200" y="110" width="80" height="100" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="210" y="120" width="30" height="6" rx="3" fill="#4F46E5" opacity="0.4" />
      <rect x="210" y="134" width="60" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="210" y="142" width="55" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="210" y="150" width="48" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="210" y="164" width="60" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="210" y="172" width="40" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="210" y="186" width="35" height="10" rx="4" fill="#F97316" opacity="0.3" />

      {/* Download arrow */}
      <circle cx="300" cy="70" r="24" fill="#4F46E5" />
      <path d="M300 58 L300 78 M292 72 L300 80 L308 72" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Decorative */}
      <circle cx="60" cy="60" r="8" fill="#FFF7ED" />
      <circle cx="60" cy="60" r="4" fill="#F97316" opacity="0.4" />
      <circle cx="350" cy="260" r="6" fill="#EEF2FF" />
    </svg>
  );
}

export function DemoIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Browser window */}
      <rect x="30" y="20" width="440" height="260" rx="12" fill="#0F172A" />
      <rect x="30" y="20" width="440" height="36" rx="12" fill="#1E293B" />
      <rect x="30" y="44" width="440" height="12" fill="#1E293B" />

      {/* Browser dots */}
      <circle cx="54" cy="38" r="5" fill="#EF4444" opacity="0.8" />
      <circle cx="72" cy="38" r="5" fill="#FBBF24" opacity="0.8" />
      <circle cx="90" cy="38" r="5" fill="#10B981" opacity="0.8" />

      {/* URL bar */}
      <rect x="115" y="30" width="240" height="16" rx="4" fill="#0F172A" />
      <rect x="123" y="35" width="80" height="6" rx="3" fill="#475569" opacity="0.5" />

      {/* Screen content */}
      <rect x="38" y="56" width="424" height="216" fill="#FFFFFF" />

      {/* Hero section mockup */}
      <rect x="60" y="75" width="150" height="10" rx="5" fill="#0F172A" opacity="0.8" />
      <rect x="60" y="92" width="200" height="6" rx="3" fill="#94A3B8" opacity="0.5" />
      <rect x="60" y="104" width="170" height="6" rx="3" fill="#94A3B8" opacity="0.5" />

      {/* CTA button */}
      <rect x="60" y="122" width="80" height="24" rx="6" fill="#4F46E5" />
      <rect x="150" y="122" width="60" height="24" rx="6" fill="#E2E8F0" />

      {/* Countdown mockup */}
      <rect x="300" y="75" width="40" height="50" rx="8" fill="#EEF2FF" />
      <rect x="348" y="75" width="40" height="50" rx="8" fill="#EEF2FF" />
      <rect x="396" y="75" width="40" height="50" rx="8" fill="#EEF2FF" />

      <text x="320" y="107" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#4F46E5" fontFamily="system-ui">07</text>
      <text x="368" y="107" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#4F46E5" fontFamily="system-ui">12</text>
      <text x="416" y="107" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#4F46E5" fontFamily="system-ui">59</text>

      {/* Feature cards */}
      <rect x="60" y="165" width="120" height="80" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
      <circle cx="82" cy="185" r="8" fill="#EEF2FF" />
      <rect x="70" y="200" width="80" height="4" rx="2" fill="#E2E8F0" />
      <rect x="70" y="210" width="60" height="4" rx="2" fill="#E2E8F0" />

      <rect x="190" y="165" width="120" height="80" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
      <circle cx="212" cy="185" r="8" fill="#FFF7ED" />
      <rect x="200" y="200" width="80" height="4" rx="2" fill="#E2E8F0" />
      <rect x="200" y="210" width="60" height="4" rx="2" fill="#E2E8F0" />

      <rect x="320" y="165" width="120" height="80" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
      <circle cx="342" cy="185" r="8" fill="#ECFDF5" />
      <rect x="330" y="200" width="80" height="4" rx="2" fill="#E2E8F0" />
      <rect x="330" y="210" width="60" height="4" rx="2" fill="#E2E8F0" />

      {/* Play button overlay */}
      <circle cx="250" cy="165" r="35" fill="#4F46E5" opacity="0.9" />
      <polygon points="240,148 268,165 240,182" fill="white" />
    </svg>
  );
}

export function StepIllustration({ step }: { step: number }) {
  const illustrations: Record<number, React.ReactNode> = {
    1: (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
        <rect x="20" y="20" width="160" height="160" rx="16" fill="#EEF2FF" />
        <rect x="45" y="55" width="110" height="90" rx="12" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="2" />
        {/* Calendar */}
        <rect x="55" y="50" width="90" height="14" rx="4" fill="#4F46E5" />
        <circle cx="70" cy="47" r="4" fill="#4F46E5" />
        <circle cx="130" cy="47" r="4" fill="#4F46E5" />
        {/* Grid */}
        {[0,1,2,3,4].map(row => [0,1,2,3,4].map(col => (
          <rect key={`${row}-${col}`} x={60 + col * 18} y={75 + row * 14} width="12" height="10" rx="2"
            fill={row === 3 && col === 2 ? "#4F46E5" : "#F1F5F9"} />
        )))}
        {/* Arrow pointing to date */}
        <circle cx="156" cy="117" r="10" fill="#F97316" opacity="0.8" />
        <text x="156" y="121" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">!</text>
      </svg>
    ),
    2: (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
        <rect x="20" y="20" width="160" height="160" rx="16" fill="#FFF7ED" />
        {/* Browser */}
        <rect x="35" y="45" width="130" height="110" rx="8" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="2" />
        <rect x="35" y="45" width="130" height="20" rx="8" fill="#FFF7ED" />
        <circle cx="50" cy="55" r="3" fill="#F97316" opacity="0.5" />
        <circle cx="60" cy="55" r="3" fill="#FBBF24" opacity="0.5" />
        <circle cx="70" cy="55" r="3" fill="#10B981" opacity="0.5" />
        {/* Content blocks */}
        <rect x="45" y="75" width="60" height="6" rx="3" fill="#0F172A" opacity="0.6" />
        <rect x="45" y="87" width="80" height="4" rx="2" fill="#E2E8F0" />
        <rect x="45" y="97" width="70" height="4" rx="2" fill="#E2E8F0" />
        <rect x="45" y="112" width="40" height="14" rx="4" fill="#4F46E5" />
        <rect x="90" y="112" width="40" height="14" rx="4" fill="#F97316" opacity="0.3" />
        {/* Color picker */}
        <circle cx="150" cy="140" r="10" fill="#4F46E5" />
        <circle cx="138" cy="140" r="10" fill="#F97316" />
        <circle cx="144" cy="130" r="10" fill="#10B981" />
      </svg>
    ),
    3: (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
        <rect x="20" y="20" width="160" height="160" rx="16" fill="#ECFDF5" />
        {/* People network */}
        <circle cx="100" cy="90" r="18" fill="#10B981" opacity="0.2" stroke="#10B981" strokeWidth="2" />
        <circle cx="100" cy="85" r="6" fill="#10B981" opacity="0.5" />
        <path d="M88 100 C88 94 112 94 112 100" fill="#10B981" opacity="0.4" />
        {/* Connected people */}
        <circle cx="55" cy="130" r="12" fill="#4F46E5" opacity="0.1" stroke="#4F46E5" strokeWidth="1.5" />
        <circle cx="145" cy="130" r="12" fill="#F97316" opacity="0.1" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="12" fill="#F97316" opacity="0.1" stroke="#F97316" strokeWidth="1.5" />
        <circle cx="140" cy="60" r="12" fill="#4F46E5" opacity="0.1" stroke="#4F46E5" strokeWidth="1.5" />
        {/* Lines */}
        <line x1="85" y1="100" x2="65" y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="115" y1="100" x2="135" y2="120" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="88" y1="78" x2="72" y2="68" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="112" y1="78" x2="128" y2="68" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* Graph going up */}
        <polyline points="50,160 80,145 110,150 140,130 160,110" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="160" cy="110" r="4" fill="#10B981" />
      </svg>
    ),
    4: (
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
        <rect x="20" y="20" width="160" height="160" rx="16" fill="#EEF2FF" />
        {/* Trophy */}
        <path d="M75 70 L75 110 C75 130 125 130 125 110 L125 70Z" fill="#FBBF24" />
        <path d="M100 70 L100 110 C100 130 125 130 125 110 L125 70Z" fill="#F59E0B" />
        <rect x="85" y="130" width="30" height="8" rx="2" fill="#D97706" />
        <rect x="78" y="138" width="44" height="6" rx="3" fill="#FBBF24" />
        {/* Cup handles */}
        <path d="M75 78 C60 78 55 95 70 100" stroke="#FBBF24" strokeWidth="4" fill="none" />
        <path d="M125 78 C140 78 145 95 130 100" stroke="#F59E0B" strokeWidth="4" fill="none" />
        {/* Star */}
        <polygon points="100,55 104,65 115,65 106,72 110,82 100,75 90,82 94,72 85,65 96,65" fill="#FFFFFF" />
        {/* Confetti */}
        <rect x="50" y="50" width="8" height="3" rx="1.5" fill="#4F46E5" transform="rotate(-20 54 51)" />
        <rect x="145" y="55" width="8" height="3" rx="1.5" fill="#F97316" transform="rotate(15 149 56)" />
        <rect x="60" y="155" width="8" height="3" rx="1.5" fill="#10B981" transform="rotate(-10 64 156)" />
        <rect x="140" y="150" width="8" height="3" rx="1.5" fill="#4F46E5" transform="rotate(25 144 151)" />
        <circle cx="45" cy="90" r="3" fill="#F97316" opacity="0.6" />
        <circle cx="155" cy="85" r="3" fill="#4F46E5" opacity="0.6" />
        {/* #1 badge */}
        <circle cx="155" cy="55" r="14" fill="#4F46E5" />
        <text x="155" y="60" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white" fontFamily="system-ui">#1</text>
      </svg>
    ),
  };

  return <>{illustrations[step] || null}</>;
}
