export const CROPS = ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Bajra', 'Jowar', 'Tur', 'Gram'];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
];

export const STATUS_FLOW = [
  'BOOKED',
  'ARRIVED',
  'QUALITY_CHECK',
  'WEIGHING',
  'PROCUREMENT_COMPLETED',
  'PAYMENT_PROCESSING',
  'PAYMENT_COMPLETED',
];

export const STATUS_LABELS = {
  BOOKED: 'Slot Booked',
  ARRIVED: 'Farmer Arrived',
  QUALITY_CHECK: 'Quality Check',
  WEIGHING: 'Weighing',
  PROCUREMENT_COMPLETED: 'Procurement Completed',
  PAYMENT_PROCESSING: 'Payment Processing',
  PAYMENT_COMPLETED: 'Payment Completed',
  CANCELLED: 'Cancelled',
};

export const STATUS_COLORS = {
  BOOKED: 'bg-blue-100 text-blue-700',
  ARRIVED: 'bg-indigo-100 text-indigo-700',
  QUALITY_CHECK: 'bg-amber-100 text-amber-700',
  WEIGHING: 'bg-orange-100 text-orange-700',
  PROCUREMENT_COMPLETED: 'bg-teal-100 text-teal-700',
  PAYMENT_PROCESSING: 'bg-purple-100 text-purple-700',
  PAYMENT_COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const to12Hour = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};
