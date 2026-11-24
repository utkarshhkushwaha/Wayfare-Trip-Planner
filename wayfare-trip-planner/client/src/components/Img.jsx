import { useState } from 'react';

const HUES = [172, 18, 200, 38, 150, 8];

// Illustrated stand-in used when a photo is missing or cannot load.
export const scene = (seed = 0) => {
  const h = HUES[seed % HUES.length];
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='hsl(${h},45%,74%)'/>` +
    `<stop offset='1' stop-color='hsl(${h},40%,38%)'/></linearGradient></defs>` +
    `<rect width='800' height='600' fill='url(#g)'/><circle cx='620' cy='160' r='64' fill='hsla(45,90%,90%,.9)'/>` +
    `<path d='M0 430 L170 270 L300 390 L470 220 L650 400 L800 310 V600 H0Z' fill='hsla(${h},40%,24%,.55)'/>` +
    `<path d='M0 500 L220 380 L400 480 L600 360 L800 470 V600 H0Z' fill='hsla(${h},40%,16%,.75)'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function Img({ src, alt = '', seed = 0, className = '', ...rest }) {
  const [bad, setBad] = useState(!src);
  return <img className={className} src={bad ? scene(seed) : src} alt={alt} loading="lazy" onError={() => setBad(true)} {...rest} />;
}
