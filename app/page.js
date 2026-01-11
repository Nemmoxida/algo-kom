"use client";

import React, { useState, useMemo } from "react";
import XYPlane from "@/components/grid";
import KdTreeViz from "@/components/tree";
import buildKdTree from "@/components/kdTree";
import rng from "@/components/rngLogic"; // Import your rng function
import nearestNeighbor from "@/components/kkn";

function generatePoints() {
  const amouth = Math.floor(Math.random() * 17) + 3;

  const points = [];
  for (let i = 0; i < amouth; i += 1) {
    points.push(rng());
  }
  return points;
}

export default function Home() {
  const [target, setTarget] = useState({ x: 11, y: 11 });
  const [points, setPoints] = useState([
    // Group 1: 0-10
    { x: 1, y: 2 },
    { x: 3, y: 7 },
    { x: 5, y: 1 },
    { x: 2, y: 9 },
    { x: 6, y: 4 },

    // Group 2: 10-20
    { x: 12, y: 15 },
    { x: 14, y: 18 },
    { x: 16, y: 12 },
    { x: 13, y: 19 },
  ]);
  const [resetKey, setResetKey] = useState(0);

  const kdTree = useMemo(() => buildKdTree(points), [points]);
  const kkn = nearestNeighbor(kdTree, target);

  const handleReset = () => {
    setPoints(generatePoints());
    setResetKey((k) => k + 1); // force re-mount for KdTreeViz if needed
  };

  return (
    <div className="bg-white h-screen flex justify-center items-center flex-col w-full">
      <button
        className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleReset}
      >
        Reset
      </button>
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex gap-2 items-center bg-white p-2 rounded shadow">
        <span className="text-black">Target Point:</span>
        <input
          type="number"
          value={target.x}
          min={0}
          max={20}
          onChange={(e) =>
            setTarget((t) => ({ ...t, x: Number(e.target.value) }))
          }
          className="border px-2 w-16"
        />
        <input
          type="number"
          value={target.y}
          min={0}
          max={20}
          onChange={(e) =>
            setTarget((t) => ({ ...t, y: Number(e.target.value) }))
          }
          className="border px-2 w-16"
        />
      </div>
      <div className="h-fit flex flex-col outline-1 outline-black w-fit absolute left-30">
        <h1 className="text-black self-center">
          XY Plane – KD Tree Visualization
        </h1>
        <XYPlane
          points={points}
          kdTree={kdTree}
          target={target}
          nearest={kkn.point}
        />
      </div>
      <div className="h-fit flex outline-1 outline-black flex-col w-fit absolute right-30">
        <h1 className="self-center">KD Tree Visualization</h1>
        <KdTreeViz treeData={kdTree} nearest={kkn.point} key={resetKey} />
      </div>
    </div>
  );
}
