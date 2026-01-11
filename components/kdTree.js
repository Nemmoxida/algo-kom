// components/kdTree.js
export default function buildKdTree(points, depth = 0) {
  if (!points || points.length === 0) return null;

  const axis = depth % 2; // 0: x, 1: y
  const sorted = [...points].sort((a, b) =>
    axis === 0 ? a.x - b.x : a.y - b.y
  );
  const medianIdx = Math.floor(sorted.length / 2);
  const median = sorted[medianIdx];

  return {
    point: median,
    axis,
    left: buildKdTree(sorted.slice(0, medianIdx), depth + 1),
    right: buildKdTree(sorted.slice(medianIdx + 1), depth + 1),
  };
}
