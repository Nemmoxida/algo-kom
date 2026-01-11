"use client";

import React, { useState } from "react";
import { Stage, Layer, Line, Text, Circle } from "react-konva";
import rng from "./rngLogic";

// Example: multiple points
// const points = [];

// for (let i = 0; i < 11; i += 1) {
//   const number = rng();
//   points.push(number);
// }

const WIDTH = 700;
const HEIGHT = 700;

const RANGE = 20; // -10 sampai 10
const GRID_STEP = 1; // jarak grid
const SCALE = WIDTH / RANGE;

const centerX = WIDTH / 2;
const centerY = HEIGHT / 2;

// mapping kartesius → canvas
function toCanvas(x, y) {
  return {
    x: x * SCALE,
    y: HEIGHT - y * SCALE, // (0,0) at bottom-left
  };
}

// Example: vertical meridian at x = 3
const meridianX = 3;
const meridianStart = toCanvas(meridianX, -RANGE);
const meridianEnd = toCanvas(meridianX, RANGE);

export default function XYPlane({ points, kdTree, target, nearest }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const gridLines = [];
  const labels = [];

  // ===== GRID & LABEL =====
  for (let i = 0; i <= RANGE; i += GRID_STEP) {
    // vertical grid
    const v1 = toCanvas(i, 0);
    const v2 = toCanvas(i, RANGE);
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[v1.x, v1.y, v2.x, v2.y]}
        stroke="#333"
        strokeWidth={i === 0 ? 2 : 1}
      />
    );

    // horizontal grid
    const h1 = toCanvas(0, i);
    const h2 = toCanvas(RANGE, i);
    gridLines.push(
      <Line
        key={`h-${i}`}
        points={[h1.x, h1.y, h2.x, h2.y]}
        stroke="#333"
        strokeWidth={i === 0 ? 2 : 1}
      />
    );

    // label X
    if (i !== 0) {
      const lx = toCanvas(i, 0);
      labels.push(
        <Text
          key={`lx-${i}`}
          x={lx.x - 15}
          y={HEIGHT - 20}
          text={i.toString()}
          fontSize={12}
          fill="#000"
        />
      );
    }

    // label Y
    if (i !== 0) {
      const ly = toCanvas(0, i);
      labels.push(
        <Text
          key={`ly-${i}`}
          x={4}
          y={ly.y - 3}
          text={i.toString()}
          fontSize={12}
          fill="#000"
        />
      );
    }
  }

  const pointCoord = { x: 7, y: 4 };
  const point = toCanvas(pointCoord.x, pointCoord.y);

  function getMedianLines(
    node,
    bounds = { xMin: 0, xMax: 20, yMin: 0, yMax: 20 },
    depth = 0,
    lines = []
  ) {
    if (!node) return lines;

    const { point, axis, left, right } = node;

    if (axis === 0) {
      // Vertical line at x = point.x
      lines.push({
        x1: point.x,
        y1: bounds.yMin,
        x2: point.x,
        y2: bounds.yMax,
        color: "blue",
      });
      // Left: x < point.x
      getMedianLines(left, { ...bounds, xMax: point.x }, depth + 1, lines);
      // Right: x > point.x
      getMedianLines(right, { ...bounds, xMin: point.x }, depth + 1, lines);
    } else {
      // Horizontal line at y = point.y
      lines.push({
        x1: bounds.xMin,
        y1: point.y,
        x2: bounds.xMax,
        y2: point.y,
        color: "red",
      });
      // Left: y < point.y
      getMedianLines(left, { ...bounds, yMax: point.y }, depth + 1, lines);
      // Right: y > point.y
      getMedianLines(right, { ...bounds, yMin: point.y }, depth + 1, lines);
    }
    return lines;
  }

  const medianLines = kdTree ? getMedianLines(kdTree) : [];

  return (
    <Stage
      width={WIDTH}
      height={HEIGHT}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePos.x}
      y={stagePos.y}
      style={{ background: "#fff" }}
    >
      <Layer>{gridLines}</Layer>
      <Layer>{labels}</Layer>
      <Layer>
        {medianLines.map((line, idx) => {
          const start = toCanvas(line.x1, line.y1);
          const end = toCanvas(line.x2, line.y2);
          return (
            <Line
              key={idx}
              points={[start.x, start.y, end.x, end.y]}
              stroke={line.color}
              strokeWidth={3}
              dash={[10, 5]}
            />
          );
        })}
      </Layer>
      <Layer>
        {points.map((pt, idx) => {
          const canvasPt = toCanvas(pt.x, pt.y);
          return (
            <Circle
              key={idx}
              x={canvasPt.x}
              y={canvasPt.y}
              radius={7}
              fill="red"
              stroke="black"
              strokeWidth={1}
              onMouseEnter={(e) => {
                const tooltipWidth = 80; // Approximate width of the tooltip
                const tooltipHeight = 30; // Approximate height of the tooltip
                let x = e.target.x() + 10;
                let y = e.target.y() - 10;

                // Clamp x within canvas
                if (x + tooltipWidth > WIDTH) x = WIDTH - tooltipWidth;
                if (x < 0) x = 0;

                // Clamp y within canvas
                if (y < 0) y = 0;
                if (y + tooltipHeight > HEIGHT) y = HEIGHT - tooltipHeight;

                setTooltip({
                  visible: true,
                  x,
                  y,
                  text: `(${pt.x}, ${pt.y})`,
                });
              }}
              onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
            />
          );
        })}

        {tooltip.visible && (
          <Text
            x={tooltip.x}
            y={tooltip.y}
            text={tooltip.text}
            fontSize={25}
            fill="red"
          />
        )}

        {target && (
          <Circle
            x={toCanvas(target.x, target.y).x}
            y={toCanvas(target.x, target.y).y}
            radius={10}
            fill="blue"
            stroke="black"
            strokeWidth={2}
            onMouseEnter={(e) => {
              const tooltipWidth = 80; // Approximate width of the tooltip
              const tooltipHeight = 30; // Approximate height of the tooltip
              let x = e.target.x() + 10;
              let y = e.target.y() - 10;

              // Clamp x within canvas
              if (x + tooltipWidth > WIDTH) x = WIDTH - tooltipWidth;
              if (x < 0) x = 0;

              // Clamp y within canvas
              if (y < 0) y = 0;
              if (y + tooltipHeight > HEIGHT) y = HEIGHT - tooltipHeight;

              setTooltip({
                visible: true,
                x,
                y,
                text: `(${target.x}, ${target.y})`,
              });
            }}
            onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
          />
        )}
        {nearest && (
          <Circle
            x={toCanvas(nearest.x, nearest.y).x}
            y={toCanvas(nearest.x, nearest.y).y}
            radius={10}
            fill="green"
            stroke="black"
            strokeWidth={2}
            onMouseEnter={(e) => {
              const tooltipWidth = 80; // Approximate width of the tooltip
              const tooltipHeight = 30; // Approximate height of the tooltip
              let x = e.target.x() + 10;
              let y = e.target.y() - 10;

              // Clamp x within canvas
              if (x + tooltipWidth > WIDTH) x = WIDTH - tooltipWidth;
              if (x < 0) x = 0;

              // Clamp y within canvas
              if (y < 0) y = 0;
              if (y + tooltipHeight > HEIGHT) y = HEIGHT - tooltipHeight;

              setTooltip({
                visible: true,
                x,
                y,
                text: `(${nearest.x}, ${nearest.y})`,
              });
            }}
            onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
          />
        )}
      </Layer>
    </Stage>
  );
}
