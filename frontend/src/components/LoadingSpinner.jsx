import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, label = 'Loading...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 text-primary-600">
      <Loader2 className="animate-spin" size={32} />
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">{content}</div>;
  }
  return <div className="py-10">{content}</div>;
};

export default LoadingSpinner;
