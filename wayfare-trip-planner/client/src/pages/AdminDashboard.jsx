import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { money, cap, hours, fmtDate } from '../utils';

const CONFIG = {
  travel_partner: {
    endpoint: '/travel',
    heading: 'Your routes',
    fields: [
      { key: 'destination', label: 'Destination', type: 'destination' },
      { key: 'fromCity', label: 'From city', type: 'text' },
      { key: 'mode', label: 'Mode', type: 'select', options: ['flight', 'train', 'bus', 'cab'] },
      { key: 'operator', label: 'Operator / service', type: 'text' },
      { key: 'departureTime', label: 'Departure time', type: 'time' },
      { key: 'durationHours', label: 'Duration (hours)', type: 'number', step: '0.1' },
      { key: 'pricePerPerson', label: 'Fare per person (INR)', type: 'number' },
      { key: 'seatsAvailable', label: 'Seats available', type: 'number' },
    ],
    defaults: { mode: 'bus', departureTime: '08:00', seatsAvailable: 30 },
    columns: (r) => [r.destination?.name, r.fromCity, cap(r.mode), r.operator, `${r.departureTime} · ${hours(r.durationHours)}`, money(r.pricePerPerson), r.seatsAvailable],
    heads: ['Destination', 'From', 'Mode', 'Operator', 'Departs', 'Fare', 'Seats'],
  },
  accommodation_partner: {
    endpoint: '/stays',
    heading: 'Your properties',
    fields: [
      { key: 'destination', label: 'Destination', type: 'destination' },
      { key: 'name', label: 'Property name', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['hostel', 'budget hotel', 'homestay', 'hotel', 'resort'] },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'image', label: 'Photo URL (optional)', type: 'text' },
      { key: 'pricePerNight', label: 'Rate per room per night (INR)', type: 'number' },
      { key: 'roomCapacity', label: 'Guests per room', type: 'number' },
      { key: 'rating', label: 'Rating (0 to 5)', type: 'number', step: '0.1' },
      { key: 'amenities', label: 'Amenities (comma separated)', type: 'text' },
    ],
    defaults: { category: 'hotel', roomCapacity: 2, rating: 4 },
    columns: (r) => [r.destination?.name, r.name, cap(r.category), money(r.pricePerNight), r.roomCapacity, r.rating],
    heads: ['Destination', 'Property', 'Category', 'Rate / night', 'Per room', 'Rating'],
  },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const cfg = CONFIG[user.role];
  const isTravel = user.role === 'travel_partner';

  const [rows, setRows] = useState([]);
  const [dests, setDests] = useState([]);
  const [selections, setSelections] = useState([]);
  const [form, setForm] = useState(cfg.defaults);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [a, b, c] = await Promise.all([
        api.get(`${cfg.endpoint}/mine`),
        api.get('/destinations'),
        api.get('/itineraries/partner/selections'),
      ]);
      setRows(a.data);
      setDests(b.data);
      setSelections(c.data);
    } catch (e) {
      setErr(errMsg(e));
    }
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const reset = () => { setForm(cfg.defaults); setEditId(null); };

  const edit = (r) => {
    const v = { ...r, destination: r.destination?._id };
    if (Array.isArray(r.amenities)) v.amenities = r.amenities.join(', ');
    setForm(v);
    setEditId(r._id);
    window.scrollTo({ top: 0 });
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const body = {};
    cfg.fields.forEach(({ key, type }) => {
      let v = form[key];
      if (type === 'number') v = v === '' || v === undefined ? undefined : Number(v);
      if (key === 'amenities') v = (v || '').split(',').map((s) => s.trim()).filter(Boolean);
      body[key] = v;
    });
    try {
      if (editId) await api.put(`${cfg.endpoint}/${editId}`, body);
      else await api.post(cfg.endpoint, body);
      reset();
      await load();
    } catch (ex) {
      setErr(errMsg(ex));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    try {
      await api.delete(`${cfg.endpoint}/${id}`);
      setRows((r) => r.filter((x) => x._id !== id));
    } catch (ex) {
      setErr(errMsg(ex));
    }
  };

  return (
    <div className="dash">
      <p className="eyebrow">{isTravel ? 'Travel partner' : 'Accommodation partner'}{user.companyName ? ` · ${user.companyName}` : ''}</p>
      <h2>Partner dashboard</h2>

      <div className="stats">
        <div><strong>{rows.length}</strong><span className="muted small">{isTravel ? 'routes listed' : 'properties listed'}</span></div>
        <div><strong>{selections.length}</strong><span className="muted small">traveller selections</span></div>
        <div><strong>{money(selections.reduce((s, x) => s + (isTravel ? x.costs.travel : x.costs.stay), 0))}</strong><span className="muted small">value selected</span></div>
      </div>

      <h3>{editId ? 'Edit listing' : isTravel ? 'Add a route' : 'Add a property'}</h3>
      <form className="form-grid panel" onSubmit={submit}>
        {cfg.fields.map((fl) => (
          <label key={fl.key}>{fl.label}
            {fl.type === 'destination' ? (
              <select required value={form.destination || ''} onChange={(e) => set('destination', e.target.value)}>
                <option value="">Select destination</option>
                {dests.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            ) : fl.type === 'select' ? (
              <select value={form[fl.key] || ''} onChange={(e) => set(fl.key, e.target.value)}>
                {fl.options.map((o) => <option key={o} value={o}>{cap(o)}</option>)}
              </select>
            ) : (
              <input type={fl.type} step={fl.step} min={fl.type === 'number' ? 0 : undefined} required={!['address', 'amenities', 'image'].includes(fl.key)}
                value={form[fl.key] ?? ''} onChange={(e) => set(fl.key, e.target.value)} />
            )}
          </label>
        ))}
        <div className="row full">
          <button className="btn" disabled={busy}>{editId ? 'Save changes' : 'Add listing'}</button>
          {editId && <button type="button" className="btn ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>
      {err && <p className="error">{err}</p>}

      <h3>{cfg.heading}</h3>
      {rows.length === 0 ? <p className="notice">Nothing listed yet.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr>{cfg.heads.map((h) => <th key={h}>{h}</th>)}<th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  {cfg.columns(r).map((c, i) => <td key={i}>{c}</td>)}
                  <td className="actions">
                    <button className="linkbtn" onClick={() => edit(r)}>Edit</button>
                    <button className="linkbtn red" onClick={() => remove(r._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Recent traveller selections</h3>
      {selections.length === 0 ? <p className="notice">No traveller has selected your listings yet.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Destination</th><th>Your listing</th><th>Group</th><th>Nights</th><th>Your share</th></tr></thead>
            <tbody>
              {selections.map((s) => (
                <tr key={s._id}>
                  <td>{fmtDate(s.createdAt)}</td>
                  <td>{s.destinationName}</td>
                  <td>{isTravel ? `${cap(s.travel.mode)}, ${s.travel.operator}` : s.stay.name}</td>
                  <td>{s.travellers}</td>
                  <td>{s.nights}</td>
                  <td>{money(isTravel ? s.costs.travel : s.costs.stay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
