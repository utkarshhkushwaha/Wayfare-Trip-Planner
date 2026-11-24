// Pricing and ranking logic for itineraries.

const costOf = ({ travel, stay, travellers, nights, roundTrip }) => {
  const rooms = Math.ceil(travellers / (stay.roomCapacity || 2));
  const travelCost = Math.round(travel.pricePerPerson * travellers * (roundTrip ? 2 : 1));
  const stayCost = Math.round(stay.pricePerNight * nights * rooms);
  return { rooms, travel: travelCost, stay: stayCost, total: travelCost + stayCost };
};

const norm = (value, min, max) => (max === min ? 0 : (value - min) / (max - min));

const buildPlans = ({ travels, stays, travellers, nights, roundTrip, maxBudget }) => {
  let plans = [];
  for (const travel of travels) {
    for (const stay of stays) {
      const { rooms, ...costs } = costOf({ travel, stay, travellers, nights, roundTrip });
      plans.push({ travel, stay, rooms, costs });
    }
  }
  if (maxBudget > 0) plans = plans.filter((p) => p.costs.total <= maxBudget);
  if (!plans.length) return [];

  const totals = plans.map((p) => p.costs.total);
  const hours = plans.map((p) => p.travel.durationHours);
  const [minT, maxT] = [Math.min(...totals), Math.max(...totals)];
  const [minH, maxH] = [Math.min(...hours), Math.max(...hours)];

  // Value score: 50% price, 30% stay rating, 20% travel time (all 0..1, higher is better).
  plans.forEach((p) => {
    const price = 1 - norm(p.costs.total, minT, maxT);
    const rating = p.stay.rating / 5;
    const speed = 1 - norm(p.travel.durationHours, minH, maxH);
    p.score = Number((0.5 * price + 0.3 * rating + 0.2 * speed).toFixed(4));
    p.tags = [];
  });

  const best = (cmp) => plans.reduce((a, b) => (cmp(b, a) < 0 ? b : a));
  best((a, b) => a.costs.total - b.costs.total).tags.push('Cheapest');
  best((a, b) => b.score - a.score).tags.push('Best value');
  best((a, b) => b.stay.rating - a.stay.rating || a.costs.total - b.costs.total).tags.push('Top rated stay');
  best((a, b) => a.travel.durationHours - b.travel.durationHours || a.costs.total - b.costs.total).tags.push('Fastest');

  return plans.sort((a, b) => a.costs.total - b.costs.total);
};

module.exports = { costOf, buildPlans };
