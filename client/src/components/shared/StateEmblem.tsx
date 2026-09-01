import React from 'react';

export const StateEmblem: React.FC<{ className?: string }> = ({ className = 'w-10 h-14' }) => {
  return (
    <svg
      viewBox="0 0 120 160"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="State Emblem of India"
    >
      {/* Central Lion Head & Mane Silhouette */}
      <path d="M60 10 C50 10 40 18 36 28 C32 38 34 50 40 58 C36 62 34 68 34 74 C34 82 40 90 48 94 L48 104 L72 104 L72 94 C80 90 86 82 86 74 C86 68 84 62 80 58 C86 50 88 38 84 28 C80 18 70 10 60 10 Z" />
      {/* Left Lion Profile */}
      <path d="M30 35 C24 35 18 42 16 50 C14 58 18 68 24 74 C26 76 30 78 34 78 C32 70 32 60 36 50 C36 44 33 38 30 35 Z" />
      {/* Right Lion Profile */}
      <path d="M90 35 C96 35 102 42 104 50 C106 58 102 68 96 74 C94 76 90 78 86 78 C88 70 88 60 84 50 C84 44 87 38 90 35 Z" />
      {/* Capital Abacus Base & Ashoka Chakra Center */}
      <rect x="20" y="106" width="80" height="8" rx="1" />
      <circle cx="60" cy="122" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="122" r="2" />
      {/* Horse on Left, Bull on Right */}
      <path d="M30 118 Q36 116 42 122 Q38 126 32 126 Z" />
      <path d="M88 118 Q82 116 76 122 Q80 126 86 126 Z" />
      <rect x="15" y="132" width="90" height="6" rx="1" />
      {/* सत्यमेव जयते Inscription base */}
      <text
        x="60"
        y="152"
        textAnchor="middle"
        fontSize="12"
        fontFamily="Noto Sans Devanagari, Arial, sans-serif"
        fontWeight="bold"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
};
