/**
 * Calculates the Qibla bearing from a given geolocation to the Kaaba in Mecca.
 * Kaaba Coordinates: 21.4225° N, 39.8262° E
 */

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

export function calculateQibla(userLat: number, userLon: number): number {
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LON - userLon) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  qibla = (qibla + 360) % 360;

  return qibla;
}

export function getDistanceToKaaba(userLat: number, userLon: number): number {
  const R = 6371; // Earth's radius in km
  const φ1 = (userLat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δφ = ((KAABA_LAT - userLat) * Math.PI) / 180;
  const Δλ = ((KAABA_LON - userLon) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
