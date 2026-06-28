import React from 'react';

export default function IDBILogo({ className = "h-8", size }) {
  // Render the official bank logo downloaded directly from Wikipedia's vectors
  return (
    <img 
      src="/idbi_logo.svg" 
      alt="IDBI Bank Logo" 
      className={`select-none pointer-events-none ${className}`}
      style={{ 
        height: size ? `${size}px` : '32px',
        objectFit: 'contain'
      }}
    />
  );
}
