"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Convert kd-tree to D3 hierarchy
function kdToHierarchy(node) {
  if (!node) return null;
  const children = [];
  if (node.left) children.push(kdToHierarchy(node.left));
  if (node.right) children.push(kdToHierarchy(node.right));
  return {
    name: `(${node.point.x},${node.point.y})`,
    children: children.length ? children : undefined,
  };
}

export default function KdTreeViz({ treeData, nearest }) {
  //   {
  //     "point": {
  //         "x": 6,
  //         "y": 4
  //     },
  //     "axis": 0,
  //     "left": {
  //         "point": {
  //             "x": 3,
  //             "y": 7
  //         },
  //         "axis": 1,
  //         "left": {
  //             "point": {
  //                 "x": 5,
  //                 "y": 1
  //             },
  //             "axis": 0,
  //             "left": {
  //                 "point": {
  //                     "x": 1,
  //                     "y": 2
  //                 },
  //                 "axis": 1,
  //                 "left": null,
  //                 "right": null
  //             },
  //             "right": null
  //         },
  //         "right": {
  //             "point": {
  //                 "x": 2,
  //                 "y": 9
  //             },
  //             "axis": 0,
  //             "left": null,
  //             "right": null
  //         }
  //     },
  //     "right": {
  //         "point": {
  //             "x": 14,
  //             "y": 18
  //         },
  //         "axis": 1,
  //         "left": {
  //             "point": {
  //                 "x": 16,
  //                 "y": 12
  //             },
  //             "axis": 0,
  //             "left": {
  //                 "point": {
  //                     "x": 12,
  //                     "y": 15
  //                 },
  //                 "axis": 1,
  //                 "left": null,
  //                 "right": null
  //             },
  //             "right": null
  //         },
  //         "right": {
  //             "point": {
  //                 "x": 13,
  //                 "y": 19
  //             },
  //             "axis": 0,
  //             "left": null,
  //             "right": null
  //         }
  //     }
  // }

  const ref = useRef();

  useEffect(() => {
    if (!treeData) return;
    const data = d3.hierarchy(kdToHierarchy(treeData));
    const width = 600;
    const height = 400;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height);

    const treeLayout = d3.tree().size([width - 100, height - 100]);
    treeLayout(data);

    svg
      .selectAll(".link")
      .data(data.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3
          .linkVertical()
          .x((d) => d.x + 50)
          .y((d) => d.y + 50)
      )
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 2);

    const node = svg
      .selectAll(".node")
      .data(data.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x + 50},${d.y + 50})`);

    node
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) =>
        nearest && d.data.name === `(${nearest.x},${nearest.y})`
          ? "#96ffc0"
          : "#ff9d96"
      )
      .attr("stroke", "#333");

    node
      .append("text")
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .attr("font-size", 12)
      .attr("fill", "#222");
  }, [treeData, nearest]);

  return (
    <div>
      <svg ref={ref}></svg>
    </div>
  );
}
