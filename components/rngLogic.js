const array = [];

export default function rng() {
  const point = {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20),
  };

  return point;
}
