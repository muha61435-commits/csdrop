import React from 'react';
import { TeamTheme } from '../data/teamThemes';

interface TeamBackgroundLayerProps {
  theme: TeamTheme;
  backdropIntensity: 'balanced' | 'vivid' | 'stealth';
}

export const TeamBackgroundLayer: React.FC<TeamBackgroundLayerProps> = ({
  theme,
  backdropIntensity
}) => {
  // Scrim opacity mapping
  const overlayClass = {
    vivid: 'bg-gradient-to-b from-[#07090e]/65 via-[#07090e]/75 to-[#07090e]/92',
    balanced: 'bg-gradient-to-b from-[#07090e]/82 via-[#07090e]/88 to-[#07090e]/96',
    stealth: 'bg-gradient-to-b from-[#07090e]/92 via-[#07090e]/95 to-[#07090e]'
  }[backdropIntensity];

  const imageOpacity = {
    vivid: 'opacity-45',
    balanced: 'opacity-30',
    stealth: 'opacity-15'
  }[backdropIntensity];

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-700">
      {/* Team Wallpaper Background */}
      <img
        src={theme.backgroundUrl}
        alt={theme.name}
        className={`w-full h-full object-cover object-top scale-102 transform transition-opacity duration-1000 ${imageOpacity} filter brightness-90 contrast-110`}
        referrerPolicy="no-referrer"
      />

      {/* Measured Scrim Gradient for WCAG AA readability */}
      <div className={`absolute inset-0 ${overlayClass} transition-colors duration-700`} />

      {/* Radial atmospheric team glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] opacity-20 transition-all duration-1000"
        style={{ backgroundColor: theme.primaryColorHex }}
      />

      {/* Team Logo Subtle Watermark (especially iconic FURIA panther!) */}
      {theme.id === 'furia' && (
        <div className="absolute top-24 right-12 opacity-8 hidden lg:block transform rotate-6 scale-125">
          <img
            src="/assets/aistudio/37107df72e0efc5d9bf6b2ed049d6fdd_d05d051c.jpg"
            alt="FURIA Panther"
            className="w-96 h-96 object-contain filter invert"
          />
        </div>
      )}
    </div>
  );
};
