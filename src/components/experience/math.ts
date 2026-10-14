export function bearing(east: number, north: number): number | null {
  if (east === 0 && north === 0) return null;
  return (Math.atan2(east, north) * 180 / Math.PI + 360) % 360;
}
export const degrees = (angle: number) => angle * Math.PI / 180;
export const format = (value: number, digits = 2) => Number(value.toFixed(digits)).toLocaleString("en-US");
export const angularDistance = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
export function roomPlan(length: number, width: number, extraPercent: number, packArea: number, price: number) {
  const area = length * width;
  const required = area * (1 + extraPercent / 100);
  const packs = Math.ceil(Number((required / packArea).toFixed(10)));
  return {area,required,packs,cost:packs * price};
}
export function shuffled<T>(items: readonly T[], random = Math.random): T[] {
  const copy = [...items];
  for (let i=copy.length-1; i>0; i--) {const j=Math.floor(random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}
