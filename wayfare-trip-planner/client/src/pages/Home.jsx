import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Img from '../components/Img.jsx';
import Icon from '../components/Icons.jsx';
import { IMG } from '../images.js';

export default function Home() {
  const { user, isPartner } = useAuth();
  const [dests, setDests] = useState([]);
  const cta = user ? (isPartner ? '/admin' : '/plan') : '/register';

  useEffect(() => {
    api.get('/destinations').then((r) => setDests(r.data)).catch(() => {});
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Trip planner for India</p>
          <h1>Know the real cost of the whole trip before you book anything.</h1>
          <p className="lead">
            Choose a destination, tell us how you want to travel and stay, and Wayfare ranks every
            route and stay combination by total cost, speed and value.
          </p>
          <div className="row">
            <Link className="btn lg" to={cta}>{user ? 'Open your workspace' : 'Start planning'}</Link>
            {!user && <Link className="btn ghost lg" to="/login">I already have an account</Link>}
          </div>
          <dl className="facts">
            <div><dt>6</dt><dd>destinations</dd></div>
            <div><dt>4</dt><dd>ways to travel</dd></div>
            <div><dt>5</dt><dd>stay types</dd></div>
          </dl>
        </div>
        <div className="hero-media">
          <Img className="m-main" src={IMG.heroMain} alt="Mountain landscape" seed={2} loading="eager" />
          <Img className="m-a" src={IMG.heroA} alt="Beach at sunset" seed={1} loading="eager" />
          <Img className="m-b" src={IMG.heroB} alt="Palace in Rajasthan" seed={3} loading="eager" />
        </div>
      </section>

      {dests.length > 0 && (
        <section className="block">
          <div className="block-head">
            <h2>Where do you want to go?</h2>
            <Link className="textlink" to={user && !isPartner ? '/plan' : '/register'}>Plan a trip</Link>
          </div>
          <div className="showcase">
            {dests.map((d, i) => (
              <Link to={user && !isPartner ? '/plan' : '/register'} key={d._id} className="show-card">
                <Img src={d.image} alt={d.name} seed={i} />
                <div className="show-text">
                  <strong>{d.name}</strong>
                  <span>{d.region} · best {d.bestSeason}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="block">
        <h2>How it works</h2>
        <div className="how">
          <article><span className="ico"><Icon name="pin" size={22} /></span><h3>1. Choose</h3><p>Pick a destination and say where you are starting from, when, and how many of you are going.</p></article>
          <article><span className="ico"><Icon name="bed" size={22} /></span><h3>2. Set preferences</h3><p>Pick a travel mode and stay type, a minimum rating and an optional budget ceiling.</p></article>
          <article><span className="ico"><Icon name="compare" size={22} /></span><h3>3. Compare and select</h3><p>See every combination with its full cost and pick the cheapest, the fastest or the best value.</p></article>
        </div>
      </section>

      <section className="partner-band">
        <div className="pb-text">
          <p className="eyebrow light">For partners</p>
          <h2>Run a transport or stay business? Get in front of travellers who are comparing.</h2>
          <p>Travel partners list flights, trains, buses and cabs. Accommodation partners list hostels, homestays, hotels and resorts. Both see when a traveller selects their listing.</p>
          <div className="row">
            <Link className="btn light" to="/admin/register">Register as a partner</Link>
            <Link className="btn outline-light" to="/admin/login">Partner sign in</Link>
          </div>
        </div>
        <Img className="pb-img" src={IMG.partner} alt="Resort pool" seed={4} />
      </section>
    </div>
  );
}
