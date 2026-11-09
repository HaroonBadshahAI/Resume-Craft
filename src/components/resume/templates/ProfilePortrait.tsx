import React from 'react';
import { PersonalInfo, PhotoSettings } from '../../../lib/resume/types';

interface ProfilePortraitProps {
  personal: PersonalInfo;
  photoSettings: PhotoSettings;
  sizePx?: number;
  borderColor?: string;
  forceShape?: 'circle' | 'rounded' | 'square';
  className?: string;
}

export const ProfilePortrait: React.FC<ProfilePortraitProps> = ({
  personal,
  photoSettings,
  sizePx = 96,
  borderColor = 'rgba(255,255,255,0.28)',
  forceShape,
  className = '',
}) => {
  if (!personal.photo || !photoSettings.visible) {
    return null;
  }

  const activeShape = forceShape || photoSettings.shape || 'circle';
  const borderRadius =
    activeShape === 'circle'
      ? '9999px'
      : activeShape === 'rounded'
        ? '12px'
        : '4px';

  const zoom = photoSettings.zoom || 1;
  const offsetX = photoSettings.offsetX || 0;
  const offsetY = photoSettings.offsetY || 0;

  return (
    <div
      className={`relative overflow-hidden shrink-0 select-none ${className}`}
      style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        borderRadius,
        border: `2.5px solid ${borderColor}`,
        backgroundColor: '#E2E8F0',
      }}
      data-testid="resume-profile-portrait"
    >
      <img
        src={personal.photo}
        alt={personal.fullName || 'Candidate portrait'}
        referrerPolicy="no-referrer"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom}) translate(${offsetX}%, ${offsetY}%)`,
          transformOrigin: 'center center',
          display: 'block',
        }}
      />
    </div>
  );
};
