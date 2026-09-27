import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Wheat, Scale, CalendarDays, Clock, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import centreService from '../../services/centreService';
import slotService from '../../services/slotService';
import bookingService from '../../services/bookingService';
import { getErrorMessage } from '../../services/api';
import { CROPS, to12Hour, formatDate } from '../../utils/constants';

const steps = ['Centre', 'Crop', 'Quantity', 'Date', 'Slot', 'Confirm'];

const todayISO = () => new Date().toISOString().slice(0, 10);

const BookSlot = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [centres, setCentres] = useState([]);
  const [loadingCentres, setLoadingCentres] = useState(true);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    centre: null,
    crop: '',
    quantity: '',
    date: todayISO(),
    slot: null,
  });

  useEffect(() => {
    centreService.getAll().then((res) => setCentres(res.data)).finally(() => setLoadingCentres(false));
  }, []);

  useEffect(() => {
    if (step === 4 && form.centre && form.date) {
      setLoadingSlots(true);
      slotService
        .getSlots(form.centre._id, form.date)
        .then((res) => setSlots(res.data))
        .catch((e) => toast.error(getErrorMessage(e)))
        .finally(() => setLoadingSlots(false));
    }
  }, [step, form.centre, form.date]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed = () => {
    if (step === 0) return !!form.centre;
    if (step === 1) return !!form.crop;
    if (step === 2) return Number(form.quantity) > 0;
    if (step === 3) return !!form.date;
    if (step === 4) return !!form.slot;
    return true;
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await bookingService.create({
        centreId: form.centre._id,
        slotId: form.slot._id,
        crop: form.crop,
        estimatedQuantityKg: Number(form.quantity),
        date: form.date,
      });
      toast.success('Slot booked successfully!');
      navigate(`/booking-confirmation/${res.data.booking._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-1">Book a Procurement Slot</h1>
        <p className="text-gray-500 mb-6">Follow the steps below to reserve your slot and get a digital token.</p>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className="w-6 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="card min-h-[320px]">
          {step === 0 && (
            <div>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><MapPin size={18} className="text-primary-600" /> Select Procurement Centre</h2>
              {loadingCentres ? (
                <LoadingSpinner />
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {centres.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => setForm({ ...form, centre: c, crop: '', slot: null })}
                      className={`text-left p-4 rounded-xl border-2 transition-colors ${
                        form.centre?._id === c._id ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <p className="font-semibold text-sm">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{c.address}, {c.district}</p>
                      <p className="text-xs text-gray-400 mt-1">{c.openingTime} - {c.closingTime}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Wheat size={18} className="text-primary-600" /> Select Crop</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {(form.centre?.supportedCrops || CROPS).map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setForm({ ...form, crop })}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                      form.crop === crop ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Scale size={18} className="text-primary-600" /> Enter Quantity (kg)</h2>
              <input
                type="number"
                min="1"
                className="input max-w-xs"
                placeholder="e.g. 450"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-2">This is your estimated quantity; the final weight will be confirmed at the centre.</p>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><CalendarDays size={18} className="text-primary-600" /> Select Date</h2>
              <input
                type="date"
                min={todayISO()}
                className="input max-w-xs"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value, slot: null })}
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Clock size={18} className="text-primary-600" /> Select Time Slot</h2>
              {loadingSlots ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {slots.map((s) => {
                    const full = s.availableCount <= 0;
                    return (
                      <button
                        key={s._id}
                        disabled={full}
                        onClick={() => setForm({ ...form, slot: s })}
                        className={`p-3 rounded-xl border-2 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                          form.slot?._id === s._id ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <p className="font-semibold text-sm">{to12Hour(s.startTime)}</p>
                        <p className="text-xs text-gray-500">{full ? 'Full' : `${s.availableCount} slots available`}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-semibold mb-4">Confirm Booking</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Centre</span><span className="font-medium">{form.centre?.name}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Crop</span><span className="font-medium">{form.crop}</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Quantity</span><span className="font-medium">{form.quantity} kg</span></div>
                <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Date</span><span className="font-medium">{formatDate(form.date)}</span></div>
                <div className="flex justify-between pb-2"><span className="text-gray-500">Time</span><span className="font-medium">{form.slot && to12Hour(form.slot.startTime)}</span></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={back} disabled={step === 0} className="btn-outline disabled:opacity-30">
            <ChevronLeft size={18} /> Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={next} disabled={!canProceed()} className="btn-primary">
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={submitting} className="btn-primary">
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <>Confirm Booking <CheckCircle2 size={18} /></>}
            </button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BookSlot;
