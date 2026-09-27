import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 text-gray-400">
    <Icon size={40} className="mb-3 text-gray-300" />
    <p className="font-semibold text-gray-600">{title}</p>
    {description && <p className="text-sm mt-1 max-w-xs">{description}</p>}
  </div>
);

export default EmptyState;
