'use client';

import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary', className }) => {
  const baseStyles = 'px-4 py-2 rounded transition duration-300 ease-in-out';
  const variantStyles = variant === 'primary' 
    ? 'bg-orange-500 text-white hover:bg-orange-600' 
    : 'bg-gray-200 text-black hover:bg-gray-300';

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;