// Photos are loaded from the web by the browser. Swap any URL for your own file,
// e.g. put a picture in client/public/images and use '/images/hero.jpg'.
const photo = (tags, lock, w = 1000, h = 700) => `https://loremflickr.com/${w}/${h}/${tags}?lock=${lock}`;

export const IMG = {
  heroMain: photo('mountains,travel', 41, 900, 1100),
  heroA: photo('beach,sunset', 42, 600, 420),
  heroB: photo('palace,india', 43, 600, 420),
  partner: photo('hotel,resort', 44, 1000, 700),
  authUser: photo('backpack,journey', 45, 900, 1100),
  authAdmin: photo('hotel,lobby', 46, 900, 1100),
};
