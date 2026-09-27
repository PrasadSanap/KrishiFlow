import React from 'react';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { STATUS_FLOW, STATUS_LABELS } from '../utils/constants';

// Visual progress tracker for a booking's journey from booked -> payment completed
const ProcurementTimeline = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-red-600 font-medium">
        <XCircle size={20} /> This booking was cancelled
      </div>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(status);

  return (
    <div className="flex flex-col gap-0">
      {STATUS_FLOW.map((step, idx) => {
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isLast = idx === STATUS_FLOW.length - 1;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isDone ? (
                <CheckCircle2 className="text-primary-600" size={22} />
              ) : isCurrent ? (
                <div className="w-[22px] h-[22px] rounded-full bg-primary-500 animate-pulse ring-4 ring-primary-100" />
              ) : (
                <Circle className="text-gray-300" size={22} />
              )}
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] ${isDone ? 'bg-primary-500' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className={`pb-7 ${isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
              <p className={`font-semibold ${isCurrent ? 'text-primary-700' : ''}`}>{STATUS_LABELS[step]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcurementTimeline;
