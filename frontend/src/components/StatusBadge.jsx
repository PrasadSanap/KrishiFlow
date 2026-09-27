import React from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants';

const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

export default StatusBadge;
