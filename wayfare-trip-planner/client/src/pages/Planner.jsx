import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { money, cap, hours } from '../utils';
import Img from '../components/Img.jsx';
import Icon from '../components/Icons.jsx';

const STEPS = ['Destination', 'Travel details', 'Stay details', 'Itineraries'];
const MODES = ['any', 'flight', 'train', 'bus', 'cab'];
const CATS = ['any', 'hostel', 'budget hotel', 'homestay', 'hotel', 'resort'];
const SORTS = { total: 'Lowest cost', value: 'Best value', rating: 'Stay rating', speed: 'Shortest travel' };
const today = new Date().toISOString().slice(0, 10);

export default function Planner() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [dests, setDests] = useState([]);
  const [origins, setOrigins] = useState([]);
  const [f, setF] = useState({
    destination: null, fromCity: '', mode: 'any', travellers: 2, startDate: '', roundTrip: true,
    nights: 3, category: 'any', minRating: 0, maxBudget: '',
  });
  const [res, setRes] = useState(null);
  const [sort, setSort] = useState('total');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    api.get('/destinations').then((r) => setDests(r.data)).catch((e) => setErr(errMsg(e)));
  }, []);

  const pickDestination = async (d) => {
    setF((p) => ({ ...p, destination: d, fromCity: '' }));
    setErr('');
    try {
      const r = await api.get('/travel/origins', { params: { destination: d._id } });
      setOrigins(r.data);
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const canNext = [
    !!f.destination,
    !!f.fromCity && f.travellers >= 1 && !!f.startDate,
    f.nights >= 1,
  ][step];

  const findPlans = async () => {
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.post('/itineraries/plan', {
        destinationId: f.destination._id, fromCity: f.fromCity, mode: f.mode, travellers: +f.travellers,
        nights: +f.nights, roundTrip: f.roundTrip, category: f.category, minRating: +f.minRating,
        maxBudget: +f.maxBudget || 0,
      });
      setRes(data);
      setStep(3);
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const choose = async (p) => {
    setErr('');
    try {
      await api.post('/itineraries', {
        destinationId: f.destination._id, travelId: p.travel._id, stayId: p.stay._id, fromCity: f.fromCity,
        startDate: f.startDate, nights: +f.nights, travellers: +f.travellers, roundTrip: f.roundTrip,
      });
      nav('/trips');
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const sorted = useMemo(() => {
    if (!res) return [];
    const by = {
      total: (a, b) => a.costs.total - b.costs.total,
      value: (a, b) => b.score - a.score,
      rating: (a, b) => b.stay.rating - a.stay.rating || a.costs.total - b.costs.total,
      speed: (a, b) => a.travel.durationHours - b.travel.durationHours || a.costs.total - b.costs.total,
    }[sort];
    return [...res.plans].sort(by);
  }, [res, sort]);

  const cheapest = res?.plans.length ? Math.min(...res.plans.map((p) => p.costs.total)) : 0;

  return (
    <div>
      <h2>Plan a trip</h2>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
            <span>{i + 1}</span>{s}
          </li>
        ))}
      </ol>

      {err && <p className="error">{err}</p>}

      {step === 0 && (
        <section>
          <p className="muted">Where do you want to go?</p>
          <div className="dest-grid">
            {dests.map((d, i) => (
              <button type="button" key={d._id} className={`dest ${f.destination?._id === d._id ? 'sel' : ''}`} onClick={() => pickDestination(d)}>
                <div className="media">
                  <Img src={d.image} alt={d.name} seed={i} />
                  <span className="media-tag">{d.region}</span>
                  {f.destination?._id === d._id && <span className="media-check"><Icon name="check" size={16} /></span>}
                </div>
                <div className="dest-body">
                  <strong>{d.name}</strong>
                  <span className="muted small">Best time: {d.bestSeason}</span>
                  <span className="small">{d.description}</span>
                  <span className="chips">{d.tags.map((t) => <em key={t}>{t}</em>)}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="form-grid panel">
          <label>Travelling from
            <select value={f.fromCity} onChange={(e) => set('fromCity', e.target.value)}>
              <option value="">Select a city</option>
              {origins.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Start date<input type="date" min={today} value={f.startDate} onChange={(e) => set('startDate', e.target.value)} /></label>
          <label>Travellers<input type="number" min="1" max="20" value={f.travellers} onChange={(e) => set('travellers', e.target.value)} /></label>
          <label>Preferred mode
            <select value={f.mode} onChange={(e) => set('mode', e.target.value)}>
              {MODES.map((m) => <option key={m} value={m}>{m === 'any' ? 'Any mode' : cap(m)}</option>)}
            </select>
          </label>
          <label className="check"><input type="checkbox" checked={f.roundTrip} onChange={(e) => set('roundTrip', e.target.checked)} /> Return journey included (fare counted twice)</label>
          {origins.length === 0 && <p className="muted small">No routes are listed to {f.destination?.name} yet.</p>}
        </section>
      )}

      {step === 2 && (
        <section className="form-grid panel">
          <label>Nights<input type="number" min="1" max="60" value={f.nights} onChange={(e) => set('nights', e.target.value)} /></label>
          <label>Stay type
            <select value={f.category} onChange={(e) => set('category', e.target.value)}>
              {CATS.map((c) => <option key={c} value={c}>{c === 'any' ? 'Any type' : cap(c)}</option>)}
            </select>
          </label>
          <label>Minimum rating
            <select value={f.minRating} onChange={(e) => set('minRating', e.target.value)}>
              <option value="0">Any</option><option value="3.5">3.5 and above</option>
              <option value="4">4.0 and above</option><option value="4.5">4.5 and above</option>
            </select>
          </label>
          <label>Total budget limit (optional)
            <input type="number" min="0" placeholder="e.g. 40000" value={f.maxBudget} onChange={(e) => set('maxBudget', e.target.value)} />
          </label>
          <p className="muted small">Rooms are allotted automatically from your group size and each property's room capacity.</p>
        </section>
      )}

      {step === 3 && res && (
        <section>
          <p className="muted">
            {f.destination.name} from {f.fromCity}, {f.travellers} traveller{f.travellers > 1 ? 's' : ''}, {f.nights} night{f.nights > 1 ? 's' : ''}.
            {' '}{res.plans.length} itinerar{res.plans.length === 1 ? 'y' : 'ies'} found from {res.travelCount} routes and {res.stayCount} stays.
          </p>
          {res.plans.length > 0 && (
            <div className="tabs">
              {Object.entries(SORTS).map(([k, label]) => (
                <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}>{label}</button>
              ))}
            </div>
          )}
          {res.plans.length === 0 && (
            <p className="notice">Nothing matches these filters. Try another travel mode, a lower rating, a higher budget or a different stay type.</p>
          )}
          <div className="plans">
            {sorted.map((p, i) => (
              <article className="plan" key={`${p.travel._id}-${p.stay._id}`}>
                <div className="plan-img">
                  <Img src={p.stay.image} alt={p.stay.name} seed={i} />
                  <div className="tagrow">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                </div>
                <div className="plan-main">
                  <header>
                    <div>
                      <h3>{p.stay.name}</h3>
                      <p className="muted small">{cap(p.stay.category)} · <Icon name="star" size={13} className="inline" /> {p.stay.rating} · {p.rooms} room{p.rooms > 1 ? 's' : ''}</p>
                    </div>
                    <div className="total">
                      <strong>{money(p.costs.total)}</strong>
                      <span className="muted small">{p.costs.total === cheapest ? 'lowest total' : `${money(p.costs.total - cheapest)} above lowest`}</span>
                    </div>
                  </header>
                  <div className="legs">
                    <div className="leg">
                      <span className="ico sm"><Icon name={p.travel.mode} /></span>
                      <div>
                        <strong>{cap(p.travel.mode)} · {p.travel.operator}</strong>
                        <span className="muted small">Departs {p.travel.departureTime} · {hours(p.travel.durationHours)} · {money(p.travel.pricePerPerson)} per person</span>
                      </div>
                    </div>
                    <div className="leg">
                      <span className="ico sm"><Icon name="bed" /></span>
                      <div>
                        <strong>{money(p.stay.pricePerNight)} per room per night</strong>
                        <span className="muted small">{p.stay.amenities?.length ? p.stay.amenities.join(', ') : 'Standard amenities'}</span>
                      </div>
                    </div>
                  </div>
                  <footer>
                    <span className="small muted">Travel {money(p.costs.travel)} + Stay {money(p.costs.stay)}</span>
                    <button className="btn" onClick={() => choose(p)}>Select this itinerary</button>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="row between nav-row">
        {step > 0 ? <button className="btn ghost" onClick={() => setStep(step - 1)}>Back</button> : <span />}
        {step < 2 && <button className="btn" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</button>}
        {step === 2 && <button className="btn" disabled={!canNext || busy} onClick={findPlans}>{busy ? 'Comparing' : 'Compare itineraries'}</button>}
      </div>
    </div>
  );
}
