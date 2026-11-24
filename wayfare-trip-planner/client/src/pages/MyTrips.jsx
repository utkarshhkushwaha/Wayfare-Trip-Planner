import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { money, cap, hours, fmtDate } from '../utils';
import Img from '../components/Img.jsx';
import Icon from '../components/Icons.jsx';

export default function MyTrips() {
  const [trips, setTrips] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/itineraries/mine').then((r) => setTrips(r.data)).catch((e) => setErr(errMsg(e)));
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this itinerary?')) return;
    try {
      await api.delete(`/itineraries/${id}`);
      setTrips((t) => t.filter((x) => x._id !== id));
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <div>
      <div className="row between">
        <h2>My itineraries</h2>
        <Link className="btn" to="/plan">Plan another trip</Link>
      </div>
      {err && <p className="error">{err}</p>}
      {trips && trips.length === 0 && <p className="notice">You have not selected an itinerary yet.</p>}
      <div className="plans">
        {trips?.map((t, i) => (
          <article className="plan" key={t._id}>
            <div className="plan-img">
              <Img src={t.destinationImage || t.stay.image} alt={t.destinationName} seed={i} />
              <div className="img-title"><strong>{t.destinationName}</strong><span>{fmtDate(t.startDate)}</span></div>
            </div>
            <div className="plan-main">
              <header>
                <div>
                  <h3>{t.stay.name}</h3>
                  <p className="muted small">From {t.fromCity} · {t.nights} nights · {t.travellers} traveller{t.travellers > 1 ? 's' : ''} · {t.rooms} room{t.rooms > 1 ? 's' : ''}</p>
                </div>
                <div className="total"><strong>{money(t.costs.total)}</strong><span className="muted small">total</span></div>
              </header>
              <div className="legs">
                <div className="leg">
                  <span className="ico sm"><Icon name={t.travel.mode} /></span>
                  <div>
                    <strong>{cap(t.travel.mode)} · {t.travel.operator}</strong>
                    <span className="muted small">Departs {t.travel.departureTime} · {hours(t.travel.durationHours)} · {t.roundTrip ? 'return included' : 'one way'} · {money(t.costs.travel)}</span>
                  </div>
                </div>
                <div className="leg">
                  <span className="ico sm"><Icon name="bed" /></span>
                  <div>
                    <strong>{cap(t.stay.category)} · rated {t.stay.rating}</strong>
                    <span className="muted small">{money(t.stay.pricePerNight)} per room per night · {money(t.costs.stay)}</span>
                  </div>
                </div>
              </div>
              <footer>
                <span className="small muted">Saved {fmtDate(t.createdAt)}</span>
                <button className="btn danger" onClick={() => remove(t._id)}>Delete</button>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
