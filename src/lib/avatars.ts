// Preset avatars in SVG Data URLs for TataDana

export interface PresetAvatar {
  id: string;
  name: string;
  tag: string;
  url: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'avatar-pria-1',
    name: 'Budi Santoso (Eksekutif)',
    tag: 'Profesional',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="30" fill="url(#bg1)"/>
        <defs>
          <linearGradient id="bg1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="#3B82F6"/>
            <stop offset="1" stop-color="#1E3A8A"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="40" r="18" fill="#FDE047"/>
        <path d="M50 20C40 20 34 26 34 32C37 32 40 30 45 27C49 27 52 26 56 27C60 29 63 32 66 32C66 26 60 20 50 20Z" fill="#1E293B"/>
        <circle cx="44" cy="39" r="2.5" fill="#0F172A"/>
        <circle cx="56" cy="39" r="2.5" fill="#0F172A"/>
        <path d="M47 48C48.5 50 51.5 50 53 48" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 88C22 72 34 64 50 64C66 64 78 72 78 88" fill="#0F172A"/>
        <path d="M44 64L50 78L56 64" fill="#F97316"/>
        <path d="M47 64L50 82L53 64" fill="#FFFFFF"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-wanita-1',
    name: 'Siti Rahma (Fintech Lead)',
    tag: 'Profesional',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="30" fill="url(#bg2)"/>
        <defs>
          <linearGradient id="bg2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="#EC4899"/>
            <stop offset="1" stop-color="#831843"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="41" r="18" fill="#FED7AA"/>
        <path d="M28 42C28 26 38 18 50 18C62 18 72 26 72 42C72 56 68 64 68 64C65 52 64 42 62 38C58 35 52 35 48 35C44 35 38 35 34 38C32 42 31 52 28 64C28 64 28 56 28 42Z" fill="#18181B"/>
        <circle cx="43" cy="42" r="2.5" fill="#18181B"/>
        <circle cx="57" cy="42" r="2.5" fill="#18181B"/>
        <path d="M46 50C48.5 53 51.5 53 54 50" stroke="#EA580C" stroke-width="2" stroke-linecap="round"/>
        <path d="M24 90C24 74 35 66 50 66C65 66 76 74 76 90" fill="#F43F5E"/>
        <circle cx="50" cy="72" r="3" fill="#FDE047"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-pria-2',
    name: 'Reza Pratama (Tech & Crypto)',
    tag: 'Smart Casual',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="30" fill="url(#bg3)"/>
        <defs>
          <linearGradient id="bg3" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="#10B981"/>
            <stop offset="1" stop-color="#064E3B"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="40" r="18" fill="#FDE047"/>
        <path d="M33 33C33 22 41 18 50 18C59 18 67 22 67 33C67 35 65 37 60 35C55 33 52 33 50 33C48 33 45 33 40 35C35 37 33 35 33 33Z" fill="#451A03"/>
        <rect x="38" y="36" width="10" height="7" rx="2" stroke="#0F172A" stroke-width="2" fill="none"/>
        <rect x="52" y="36" width="10" height="7" rx="2" stroke="#0F172A" stroke-width="2" fill="none"/>
        <line x1="48" y1="39" x2="52" y2="39" stroke="#0F172A" stroke-width="2"/>
        <path d="M47 48C48.5 50 51.5 50 53 48" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 88C22 72 34 64 50 64C66 64 78 72 78 88" fill="#334155"/>
        <path d="M43 64L50 74L57 64" fill="#059669"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-wanita-2',
    name: 'Anisa Putri (Kreatif & Freelancer)',
    tag: 'Creative',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="30" fill="url(#bg4)"/>
        <defs>
          <linearGradient id="bg4" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="#8B5CF6"/>
            <stop offset="1" stop-color="#4C1D95"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="41" r="18" fill="#FED7AA"/>
        <path d="M30 40C30 25 40 20 50 20C60 20 70 25 70 40C70 54 66 62 66 62C64 54 62 45 58 40C54 36 46 36 42 40C38 45 36 54 34 62C34 62 30 54 30 40Z" fill="#312E81"/>
        <!-- Hijab modern drape -->
        <path d="M32 40C32 28 40 22 50 22C60 22 68 28 68 40C68 56 64 68 64 68C60 62 56 56 50 56C44 56 40 62 36 68C36 68 32 56 32 40Z" fill="#A855F7"/>
        <circle cx="43" cy="42" r="2.5" fill="#18181B"/>
        <circle cx="57" cy="42" r="2.5" fill="#18181B"/>
        <path d="M46 50C48.5 53 51.5 53 54 50" stroke="#EA580C" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 90C22 74 34 66 50 66C66 66 78 74 78 90" fill="#7C3AED"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-maskot',
    name: 'Maskot Resmi TataDana',
    tag: 'Eksklusif',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="30" fill="url(#bg5)"/>
        <defs>
          <linearGradient id="bg5" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F97316"/>
            <stop offset="1" stop-color="#EA580C"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="30" fill="#FFFFFF"/>
        <!-- Orange Brand Fox/Mascot Face -->
        <path d="M50 30L65 48L60 70L50 64L40 70L35 48L50 30Z" fill="#F97316"/>
        <path d="M50 30L40 48L50 64L60 48L50 30Z" fill="#FB923C"/>
        <circle cx="44" cy="50" r="3" fill="#FFFFFF"/>
        <circle cx="56" cy="50" r="3" fill="#FFFFFF"/>
        <circle cx="44" cy="50" r="1.5" fill="#0F172A"/>
        <circle cx="56" cy="50" r="1.5" fill="#0F172A"/>
        <circle cx="50" cy="58" r="2" fill="#7C2D12"/>
        <path d="M47 61C48.5 63 51.5 63 53 61" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `)}`,
  },
  {
    id: 'avatar-investor',
    name: 'Investor Sukses (Gold)',
    tag: 'Fintech Pro',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
        <rect width="100" height="100" rx="30" fill="url(#bg6)"/>
        <defs>
          <linearGradient id="bg6" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F59E0B"/>
            <stop offset="1" stop-color="#78350F"/>
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="32" fill="#0F172A"/>
        <circle cx="50" cy="50" r="27" stroke="#FDE68A" stroke-width="2" fill="none"/>
        <text x="50" y="58" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FDE68A" text-anchor="middle">Rp</text>
      </svg>
    `)}`,
  },
];
