const target = { x: 5, y: 5 }; // example target point

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export default function nearestNeighbor(root, target) {
  let best = { point: null, dist: Infinity };

  function search(node) {
    if (!node) return;

    const axis = node.axis;
    const dist = distance(target, node.point);

    if (dist < best.dist) {
      best = { point: node.point, dist };
    }

    const diff = axis === 0 ? target.x - node.point.x : target.y - node.point.y;
    const [first, second] =
      diff < 0 ? [node.left, node.right] : [node.right, node.left];

    search(first);

    if (Math.abs(diff) < best.dist) {
      search(second);
    }
  }

  search(root);
  return best;
}
