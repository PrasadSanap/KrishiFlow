/**
 * KrishiFlow demo seed script.
 *
 * Run with: npm run seed  (from the backend/ folder)
 *
 * Creates:
 *  - 1 admin, 1 centre operator (linked to Pune APMC), 1 demo farmer login
 *  - 5 procurement centres
 *  - Time slots + a realistic in-progress queue at Pune APMC for TODAY
 *  - Sample bookings across a range of statuses (booked -> payment completed)
 *  - Sample notifications
 *
 * IMPORTANT: These are DEMO accounts for hackathon evaluation only.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const ProcurementCentre = require('../models/ProcurementCentre');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Procurement = require('../models/Procurement');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

const { generateBookingId, generateTransactionId } = require('../utils/generateIds');

const todayStr = () => new Date().toISOString().slice(0, 10);

const FARMER_NAMES = [
  'Ramesh Patil', 'Suresh Jadhav', 'Amit Shinde', 'Rahul More', 'Prasad Deshmukh',
  'Vijay Kale', 'Sunil Pawar', 'Ganesh Bhosale', 'Santosh Gaikwad', 'Manoj Thorat',
  'Dattatray Shelke', 'Anil Chavan', 'Sachin Kadam', 'Vinod Salunkhe', 'Nitin Jagtap',
];

const CROPS = ProcurementCentre.CROPS || ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Bajra', 'Jowar', 'Tur', 'Gram'];

const pad = (n) => String(n).padStart(2, '0');

const generateSlotsForCentre = (centre, date) => {
  const [openH, openM] = centre.openingTime.split(':').map(Number);
  const [closeH, closeM] = centre.closingTime.split(':').map(Number);
  let cursor = openH * 60 + openM;
  const end = closeH * 60 + closeM;
  const slots = [];
  while (cursor + 30 <= end) {
    const startH = Math.floor(cursor / 60);
    const startM = cursor % 60;
    const endMinutes = cursor + 30;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    slots.push({
      centre: centre._id,
      date,
      startTime: `${pad(startH)}:${pad(startM)}`,
      endTime: `${pad(endH)}:${pad(endM)}`,
      capacity: 10,
      bookedCount: 0,
    });
    cursor += 30;
  }
  return slots;
};

const randomMobile = () => `9${Math.floor(100000000 + Math.random() * 899999999)}`;

const run = async () => {
  await connectDB();

  console.log('Clearing existing demo data...');
  await Promise.all([
    User.deleteMany({}),
    ProcurementCentre.deleteMany({}),
    Slot.deleteMany({}),
    Booking.deleteMany({}),
    Procurement.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating procurement centres...');
  const centresData = [
    {
      name: 'Pune APMC Procurement Centre',
      address: 'Market Yard, Gultekdi',
      district: 'Pune',
      state: 'Maharashtra',
      contactNumber: '9812345601',
      openingTime: '09:00',
      closingTime: '17:00',
      dailyCapacity: 200,
      supportedCrops: CROPS,
      latitude: 18.4933,
      longitude: 73.8567,
      averageProcessingTimeMinutes: 5,
    },
    {
      name: 'Baramati Procurement Centre',
      address: 'Near Krishi Utpanna Bazar Samiti',
      district: 'Pune',
      state: 'Maharashtra',
      contactNumber: '9812345602',
      openingTime: '09:00',
      closingTime: '17:00',
      dailyCapacity: 150,
      supportedCrops: ['Wheat', 'Jowar', 'Bajra', 'Gram', 'Tur'],
      latitude: 18.1514,
      longitude: 74.5815,
      averageProcessingTimeMinutes: 6,
    },
    {
      name: 'Satara Procurement Centre',
      address: 'APMC Yard, Satara',
      district: 'Satara',
      state: 'Maharashtra',
      contactNumber: '9812345603',
      openingTime: '08:30',
      closingTime: '16:30',
      dailyCapacity: 120,
      supportedCrops: ['Rice', 'Wheat', 'Soybean', 'Gram'],
      latitude: 17.6805,
      longitude: 74.0183,
      averageProcessingTimeMinutes: 5,
    },
    {
      name: 'Nashik Procurement Centre',
      address: 'Lasalgaon APMC Complex',
      district: 'Nashik',
      state: 'Maharashtra',
      contactNumber: '9812345604',
      openingTime: '09:00',
      closingTime: '18:00',
      dailyCapacity: 180,
      supportedCrops: ['Maize', 'Soybean', 'Cotton', 'Wheat'],
      latitude: 20.0113,
      longitude: 73.7903,
      averageProcessingTimeMinutes: 4,
    },
    {
      name: 'Kolhapur Procurement Centre',
      address: 'Shahu Market Yard',
      district: 'Kolhapur',
      state: 'Maharashtra',
      contactNumber: '9812345605',
      openingTime: '09:00',
      closingTime: '17:00',
      dailyCapacity: 140,
      supportedCrops: ['Rice', 'Cotton', 'Soybean', 'Tur'],
      latitude: 16.7050,
      longitude: 74.2433,
      averageProcessingTimeMinutes: 5,
    },
  ];

  const centres = await ProcurementCentre.insertMany(centresData);
  const puneCentre = centres[0];

  console.log('Creating demo accounts (admin, centre operator, farmer)...');
  const admin = await User.create({
    fullName: 'System Administrator',
    mobileNumber: '9800000001',
    email: 'admin@KrishiFlow.com',
    password: 'Admin@123',
    role: 'admin',
    village: 'N/A',
    district: 'Pune',
    state: 'Maharashtra',
    preferredLanguage: 'en',
  });

  const centreOperator = await User.create({
    fullName: 'Pune APMC Operator',
    mobileNumber: '9800000002',
    email: 'centre@KrishiFlow.com',
    password: 'Centre@123',
    role: 'centre',
    village: 'N/A',
    district: 'Pune',
    state: 'Maharashtra',
    preferredLanguage: 'en',
    centre: puneCentre._id,
  });

  const demoFarmer = await User.create({
    fullName: 'Ramesh Kisan Patil',
    mobileNumber: '9800000003',
    email: 'farmer@KrishiFlow.com',
    password: 'Farmer@123',
    role: 'farmer',
    village: 'Hadapsar',
    district: 'Pune',
    state: 'Maharashtra',
    preferredLanguage: 'en',
  });

  console.log('Creating additional demo farmers...');
  const extraFarmers = [];
  for (const name of FARMER_NAMES) {
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const farmer = await User.create({
      fullName: name,
      mobileNumber: randomMobile(),
      email,
      password: 'Farmer@123',
      role: 'farmer',
      village: 'Various',
      district: 'Pune',
      state: 'Maharashtra',
      preferredLanguage: 'en',
    });
    extraFarmers.push(farmer);
  }

  console.log('Creating slots for today at all centres...');
  const date = todayStr();
  for (const centre of centres) {
    const slots = generateSlotsForCentre(centre, date);
    await Slot.insertMany(slots);
  }

  const puneSlots = await Slot.find({ centre: puneCentre._id, date }).sort({ startTime: 1 });

  console.log('Creating a realistic sample queue at Pune APMC...');

  // Build 27 bookings at Pune APMC: tokens 1-19 completed through the full flow,
  // tokens 20-26 in various mid-flow states, and token 27 is the demo farmer, still BOOKED.
  const allFarmersForQueue = [...extraFarmers];
  let slotCursor = 0;

  const createBookingAtStatus = async (farmer, token, targetStatus, crop) => {
    const slot = puneSlots[slotCursor % puneSlots.length];
    slotCursor += 1;

    const booking = await Booking.create({
      bookingId: generateBookingId(),
      farmer: farmer._id,
      centre: puneCentre._id,
      slot: slot._id,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      crop,
      estimatedQuantityKg: 400 + Math.floor(Math.random() * 200),
      token,
      status: targetStatus,
    });

    await Slot.findByIdAndUpdate(slot._id, { $inc: { bookedCount: 1 } });

    const statusesRequiringProcurement = [
      'QUALITY_CHECK', 'WEIGHING', 'PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED',
    ];

    if (statusesRequiringProcurement.includes(targetStatus)) {
      const weightKg = booking.estimatedQuantityKg - Math.floor(Math.random() * 10);
      const ratePerKg = 22 + Math.floor(Math.random() * 6);
      const totalAmount = Number((weightKg * ratePerKg).toFixed(2));

      const procurement = await Procurement.create({
        booking: booking._id,
        farmer: farmer._id,
        centre: puneCentre._id,
        crop,
        qualityCheckPassed: true,
        qualityCheckNotes: 'Meets FAQ standard',
        weightKg: targetStatus === 'QUALITY_CHECK' ? undefined : weightKg,
        ratePerKg: targetStatus === 'QUALITY_CHECK' ? undefined : ratePerKg,
        totalAmount: targetStatus === 'QUALITY_CHECK' ? undefined : totalAmount,
        qualityCheckStartedAt: new Date(),
        qualityCheckCompletedAt: new Date(),
        weighingCompletedAt: targetStatus === 'QUALITY_CHECK' ? undefined : new Date(),
        completedAt: ['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'].includes(targetStatus)
          ? new Date()
          : undefined,
      });

      if (['PROCUREMENT_COMPLETED', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETED'].includes(targetStatus)) {
        const payment = await Payment.create({
          booking: booking._id,
          farmer: farmer._id,
          procurement: procurement._id,
          amount: totalAmount,
          status: targetStatus === 'PAYMENT_COMPLETED' ? 'COMPLETED' : targetStatus === 'PAYMENT_PROCESSING' ? 'PROCESSING' : 'PENDING',
          transactionId: targetStatus === 'PAYMENT_COMPLETED' ? generateTransactionId() : undefined,
          paymentDate: targetStatus === 'PAYMENT_COMPLETED' ? new Date() : undefined,
        });
        return { booking, procurement, payment };
      }
      return { booking, procurement };
    }
    return { booking };
  };

  // Tokens 1-19: fully completed (procurement + payment completed)
  for (let token = 1; token <= 19; token++) {
    const farmer = allFarmersForQueue[(token - 1) % allFarmersForQueue.length];
    const crop = CROPS[token % CROPS.length];
    await createBookingAtStatus(farmer, token, 'PAYMENT_COMPLETED', crop);
  }

  // Token 20-21: in weighing / quality check (currently being served)
  await createBookingAtStatus(allFarmersForQueue[19 % allFarmersForQueue.length], 20, 'WEIGHING', 'Wheat');
  await createBookingAtStatus(allFarmersForQueue[20 % allFarmersForQueue.length], 21, 'ARRIVED', 'Rice');

  // Tokens 22-26: waiting (BOOKED)
  for (let token = 22; token <= 26; token++) {
    const farmer = allFarmersForQueue[token % allFarmersForQueue.length];
    const crop = CROPS[token % CROPS.length];
    await createBookingAtStatus(farmer, token, 'BOOKED', crop);
  }

  // Token 27: the demo farmer login - BOOKED, waiting, so the demo workflow can be run live
  const demoSlot = puneSlots[puneSlots.length > 20 ? 20 : puneSlots.length - 1];
  const demoBooking = await Booking.create({
    bookingId: generateBookingId(),
    farmer: demoFarmer._id,
    centre: puneCentre._id,
    slot: demoSlot._id,
    date,
    startTime: demoSlot.startTime,
    endTime: demoSlot.endTime,
    crop: 'Wheat',
    estimatedQuantityKg: 450,
    token: 27,
    status: 'BOOKED',
  });
  await Slot.findByIdAndUpdate(demoSlot._id, { $inc: { bookedCount: 1 } });

  console.log('Creating sample notifications for the demo farmer...');
  await Notification.insertMany([
    {
      user: demoFarmer._id,
      title: 'Slot Booked Successfully',
      message: `Your slot at ${puneCentre.name} on ${date} at ${demoSlot.startTime} is confirmed. Your token is #27.`,
      type: 'BOOKING',
      relatedBooking: demoBooking._id,
      isRead: false,
    },
    {
      user: demoFarmer._id,
      title: 'Welcome to KrishiFlow',
      message: 'Thank you for registering. Book your first slot to get started.',
      type: 'GENERAL',
      isRead: true,
    },
  ]);

  console.log('\n================ SEED COMPLETE ================');
  console.log('DEMO ACCOUNTS (for hackathon evaluation only):');
  console.log('  Admin    -> admin@KrishiFlow.com   / Admin@123');
  console.log('  Centre   -> centre@KrishiFlow.com  / Centre@123  (Pune APMC)');
  console.log('  Farmer   -> farmer@KrishiFlow.com  / Farmer@123  (Token #27 at Pune APMC today)');
  console.log('=================================================\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
