import React from 'react';
import { SiteSettings } from '../types';

interface LogoProps {
  className?: string;
  settings?: SiteSettings;
  mode?: 'graphic' | 'text' | 'both';
}

export default function Logo({ className = "h-9", settings, mode }: LogoProps) {
  // Use mode from props if provided, fallback to settings.logo_display_mode, fallback to 'graphic'
  const displayMode = mode || settings?.logo_display_mode || 'graphic';
  
  // 1. Graphic Logo: settings.logo_url if available, fallback to the SVG
  const hasUploadedLogo = !!settings?.logo_url;
  
  const graphicElement = hasUploadedLogo ? (
    <img
      src={settings.logo_url}
      alt={settings?.site_name || "Logo"}
      className={`${className} object-contain transition-transform`}
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className={`inline-flex items-center ${className}`}>
      <svg 
        viewBox="0 0 540 260" 
        className="h-full w-auto"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main letters group: Charcoal/slate body that adjusts based on light/dark mode */}
        <g className="fill-[#374151] dark:fill-gray-100 transition-colors duration-300">
          {/* Lowercase 'b' - thick rounded geometric shape */}
          <path 
            d="M50,10 L95,10 L95,115 C110,95 135,85 160,85 C215,85 255,125 255,180 C255,235 215,275 160,275 C135,275 110,265 95,245 L95,270 L50,270 L50,10 Z M152,130 C125,130 105,150 105,180 C105,210 125,230 152,230 C179,230 199,210 199,180 C199,150 179,130 152,130 Z" 
            transform="translate(-30, -5)"
            fillRule="evenodd" 
            clipRule="evenodd" 
          />

          {/* Styled '2' - thick stem, lower part, base */}
          <path 
            d="M245,215 L245,260 L385,260 L385,215 L320,215 C345,185 385,145 385,108 C385,85 375,70 355,60 C365,70 370,85 370,105 C370,135 330,175 300,215 L245,215 Z" 
            transform="translate(-35, -5)"
          />
          <path 
            d="M300,215 L245,260 L285,260 L335,215 Z" 
            transform="translate(-35, -5)"
          />

          {/* Letter 'o' / 'e' circular body */}
          <path 
            d="M440,260 C495,260 540,220 540,170 C540,120 495,80 440,80 C385,80 340,120 340,170 C340,220 385,260 440,260 Z M440,122 C465,122 485,142 485,170 C485,198 465,218 440,218 C415,218 395,198 395,170 C395,142 415,122 440,122 Z" 
            transform="translate(-55, -5)"
            fillRule="evenodd" 
            clipRule="evenodd" 
          />
        </g>

        {/* Vibrant Red Accents (#a31d1d) */}
        <g fill="#a31d1d">
          {/* Dynamic Red arch/curve floating over the '2' */}
          <path 
            d="M260,82 C225,95 205,122 185,150 C200,132 225,112 260,98 C280,90 300,90 315,96 C305,86 285,76 260,82 Z" 
            transform="translate(-35, -5)"
          />

          {/* Swooping arrow starting from bottom-left of 'o', curving up and right */}
          <path 
            d="M 330, 195 
               C 365, 170 415, 120 440, 85 
               C 475, 45 490, 25 505, 5" 
            stroke="#a31d1d" 
            strokeWidth="19" 
            strokeLinecap="round" 
            transform="translate(-55, -5)"
          />
          {/* Sharp arrowhead pointing top-right */}
          <path 
            d="M440,10 L495,1 L480,55 Z" 
            transform="translate(-50, -10)"
          />
        </g>

        {/* Elegantly styled serif italic text "fiy" at the bottom right */}
        <text 
          x="415" 
          y="235" 
          fontFamily="Georgia, 'Times New Roman', Playfair Display, serif" 
          fontSize="72" 
          fontWeight="bold" 
          fontStyle="italic" 
          fill="#a31d1d"
          className="select-none"
        >
          fiy
        </text>
      </svg>
    </div>
  );

  // 2. Text Logo: site name styled beautifully with gradient/crimson color
  const textElement = (
    <span className="text-xl sm:text-2xl font-display font-black tracking-tight bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent select-none font-bold">
      {settings?.site_name || 'B2Ofiy'}<span className="text-[#a31d1d]">.</span>
    </span>
  );

  if (displayMode === 'text') {
    return (
      <div className="flex items-center">
        {textElement}
      </div>
    );
  }

  if (displayMode === 'both') {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {graphicElement}
        <div className="h-6 w-[1px] bg-white/10" />
        {textElement}
      </div>
    );
  }

  // Default: 'graphic'
  return graphicElement;
}
