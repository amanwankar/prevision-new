import React from 'react';

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelayMs?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        return (
          <div
            style={{ animationDelay: `${idx * 80}ms` }}
            className="animate-stagger-fade"
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  index = 0,
  className = ''
}) => {
  return (
    <div
      style={{ animationDelay: `${index * 80}ms` }}
      className={`animate-stagger-fade ${className}`}
    >
      {children}
    </div>
  );
};
