import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
};

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hover = false
}) => {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-200';
  const hoverStyles = hover ? 'hover:shadow-lg transform hover:-translate-y-1' : '';
  const clickStyles = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${clickStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;