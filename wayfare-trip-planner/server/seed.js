// Fills the database with demo destinations, partners and listings.
// Run with: npm run seed   (this clears existing data)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Destination = require('./models/Destination');
const TravelOption = require('./models/TravelOption');
const Accommodation = require('./models/Accommodation');
const Itinerary = require('./models/Itinerary');

// km = approximate road distance from each origin city
const destinations = [
  { name: 'Goa', photo: 'goa,beach', region: 'Goa', bestSeason: 'Nov to Feb', airport: true, tags: ['beaches', 'nightlife', 'food'],
    description: 'Long beaches, Portuguese-era lanes in Panaji and Old Goa, and a food scene built on seafood.',
    km: { Indore: 1100, Mumbai: 590, Delhi: 1900, Bengaluru: 560, Pune: 450 } },
  { name: 'Jaipur', photo: 'jaipur,palace', region: 'Rajasthan', bestSeason: 'Oct to Mar', airport: true, tags: ['forts', 'markets', 'heritage'],
    description: 'The Pink City: Amer Fort, the City Palace and bazaars selling block prints and jewellery.',
    km: { Indore: 650, Mumbai: 1150, Delhi: 280, Bengaluru: 2050, Pune: 1150 } },
  { name: 'Manali', photo: 'manali,mountains', region: 'Himachal Pradesh', bestSeason: 'Mar to Jun, Dec to Feb', airport: false, tags: ['mountains', 'snow', 'trekking'],
    description: 'Beas valley town with pine forests, Solang snow slopes and the road up to Rohtang.',
    km: { Indore: 1500, Mumbai: 2000, Delhi: 540, Bengaluru: 2900, Pune: 1950 } },
  { name: 'Kochi and Munnar', photo: 'kerala,backwaters', region: 'Kerala', bestSeason: 'Sep to Mar', airport: true, tags: ['backwaters', 'tea hills', 'spice trails'],
    description: 'Fort Kochi harbour walks, then the tea estates and viewpoints of Munnar.',
    km: { Indore: 1900, Mumbai: 1400, Delhi: 2700, Bengaluru: 550, Pune: 1200 } },
  { name: 'Udaipur', photo: 'udaipur,lake', region: 'Rajasthan', bestSeason: 'Oct to Mar', airport: true, tags: ['lakes', 'palaces', 'old city'],
    description: 'Lake Pichola, the City Palace complex and narrow lanes of the old town.',
    km: { Indore: 480, Mumbai: 760, Delhi: 660, Bengaluru: 1800, Pune: 900 } },
  { name: 'Rishikesh', photo: 'rishikesh,river', region: 'Uttarakhand', bestSeason: 'Sep to Nov, Feb to May', airport: false, tags: ['river rafting', 'yoga', 'ghats'],
    description: 'Ganga ghats, rafting stretches above the town and a long tradition of yoga retreats.',
    km: { Indore: 1000, Mumbai: 1550, Delhi: 240, Bengaluru: 2400, Pune: 1500 } },
];

const ops = [
  { mode: 'bus', operator: 'Kesari Travels (Non-AC Sleeper)', rate: 1.1, base: 100, speed: 45, times: ['18:30', '20:00'] },
  { mode: 'bus', operator: 'Neeta Tours (AC Sleeper)', rate: 1.7, base: 150, speed: 45, times: ['19:00', '21:30'] },
  { mode: 'train', operator: 'IRCTC Sleeper Class', rate: 0.45, base: 90, speed: 52, times: ['06:15', '22:40'], minKm: 300 },
  { mode: 'train', operator: 'IRCTC 3AC', rate: 1.15, base: 180, speed: 52, times: ['07:05', '23:10'], minKm: 300 },
  { mode: 'flight', operator: 'IndiGo', rate: 1.9, base: 2200, speed: 650, lead: 1.2, times: ['06:40', '17:25'], minKm: 500, needsAirport: true },
  { mode: 'flight', operator: 'Air India', rate: 2.2, base: 2800, speed: 650, lead: 1.2, times: ['09:10'], minKm: 500, needsAirport: true },
];

const stayTypes = [
  { category: 'hostel', tags: 'hostel,dorm', title: "Backpackers' Rest", price: 650, rating: 3.9, cap: 4, amenities: ['Wi-Fi', 'Shared kitchen'] },
  { category: 'budget hotel', tags: 'hotel,bedroom', title: 'Transit Inn', price: 1500, rating: 3.8, cap: 2, amenities: ['Wi-Fi', 'AC', 'Breakfast'] },
  { category: 'homestay', tags: 'cottage,garden', title: 'Family Homestay', price: 1900, rating: 4.4, cap: 3, amenities: ['Home-cooked meals', 'Wi-Fi'] },
  { category: 'hotel', tags: 'hotel,lobby', title: 'Grand Meridian', price: 3600, rating: 4.2, cap: 2, amenities: ['Pool', 'Restaurant', 'Wi-Fi', 'AC'] },
  { category: 'hotel', tags: 'hotel,suite', title: 'Courtyard Suites', price: 4800, rating: 4.5, cap: 3, amenities: ['Breakfast', 'Gym', 'Airport pickup'] },
  { category: 'resort', tags: 'resort,pool', title: 'Heritage Resort & Spa', price: 7600, rating: 4.7, cap: 3, amenities: ['Spa', 'Pool', 'All meals', 'Guided tours'] },
];

const photo = (tags, lock, w = 900, h = 600) => `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;
const round10 = (n) => Math.round(n / 10) * 10;

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([Itinerary, TravelOption, Accommodation, Destination].map((M) => M.deleteMany({})));
  await User.deleteMany({ email: /@wayfare\.dev$/ });

  const [traveller, travelPartner, stayPartner] = await Promise.all([
    User.create({ name: 'Demo Traveller', email: 'traveller@wayfare.dev', password: 'Traveller@123', role: 'user' }),
    User.create({ name: 'Ravi Menon', email: 'routes@wayfare.dev', password: 'Partner@123', role: 'travel_partner', companyName: 'Open Road Transit' }),
    User.create({ name: 'Anita Shah', email: 'stays@wayfare.dev', password: 'Partner@123', role: 'accommodation_partner', companyName: 'Hearth & Home Stays' }),
  ]);

  const created = await Destination.insertMany(destinations.map(({ km, airport, photo: tags, ...d }, i) => ({ ...d, image: photo(tags, 10 + i, 1000, 700) })));
  const travelDocs = [];
  const stayDocs = [];

  created.forEach((dest, i) => {
    const src = destinations[i];
    Object.entries(src.km).forEach(([city, km]) => {
      ops.forEach((o) => {
        if (o.minKm && km < o.minKm) return;
        if (o.needsAirport && !src.airport) return;
        const hours = (o.lead || 0) + km / o.speed;
        o.times.forEach((t, k) => {
          travelDocs.push({
            partner: travelPartner._id, destination: dest._id, fromCity: city, mode: o.mode, operator: o.operator,
            departureTime: t, durationHours: Number(hours.toFixed(1)),
            pricePerPerson: round10((o.base + km * o.rate) * (1 + k * 0.08)),
            seatsAvailable: 12 + ((km + k * 7) % 28),
          });
        });
      });
    });
    stayTypes.forEach((s, k) => {
      stayDocs.push({
        partner: stayPartner._id, destination: dest._id, name: `${s.title}, ${dest.name}`, category: s.category,
        address: `${dest.name}, ${dest.region}`, image: photo(s.tags, 100 + i * 10 + k, 700, 500), pricePerNight: round10(s.price * (0.95 + ((i + k) % 4) * 0.05)),
        roomCapacity: s.cap, rating: s.rating, amenities: s.amenities,
      });
    });
  });

  await TravelOption.insertMany(travelDocs);
  await Accommodation.insertMany(stayDocs);

  console.log(`Seeded ${created.length} destinations, ${travelDocs.length} routes, ${stayDocs.length} stays.`);
  console.log('Traveller  : traveller@wayfare.dev / Traveller@123');
  console.log('Travel partner : routes@wayfare.dev / Partner@123');
  console.log('Stay partner   : stays@wayfare.dev / Partner@123');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
