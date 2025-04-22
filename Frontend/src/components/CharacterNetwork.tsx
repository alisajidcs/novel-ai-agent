'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface Character {
  name: string;
  interactions: string[];
}

type GraphNode = NodeObject & {
  name: string;
  val: number;
  color: string;
  x: number;
  y: number;
};

interface CharacterNetworkProps {
  characters: Character[];
  isLoading: boolean;
}

export default function CharacterNetwork({ characters, isLoading }: CharacterNetworkProps) {
  const graphRef = useRef<ForceGraphMethods<NodeObject, LinkObject>>(null);

  // removing characters with no interactions
  const filteredCharacters = characters.filter((char) => char.interactions.length > 0);

  // Transform character data into nodes and links
  const graphData = {
    nodes: filteredCharacters.map((char) => ({
      id: char.name,
      name: char.name,
      val: char.interactions.length, // Node size based on number of interactions
    })),
    links: filteredCharacters.flatMap((char) =>
      char.interactions.map((interaction) => ({
        source: char.name,
        target: interaction,
      }))
    ),
  };

  useEffect(() => {
    if (graphRef.current) {
      // Reset the graph state
      graphRef.current.centerAt(0, 0, 0);
      graphRef.current.zoomToFit(0);
      // Recenter after a short delay to ensure nodes are positioned
      setTimeout(() => {
        if (graphRef.current) {
          graphRef.current.centerAt(0, 0, 1000);
          graphRef.current.zoomToFit(100);
        }
      }, 100);
    }
  }, [characters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading network visualization...</div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">No character data available</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden">
      <ForceGraph2D
        key={characters.length}
        ref={graphRef as React.RefObject<ForceGraphMethods<NodeObject, LinkObject>>}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="name"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        nodeCanvasObject={(node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const graphNode = node as GraphNode;
          const label = graphNode.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = graphNode.color || 'black';
          ctx.beginPath();
          ctx.arc(graphNode.x, graphNode.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = 'black';
          ctx.fillText(label, graphNode.x, graphNode.y + 10);
        }}
      />
    </div>
  );
} 