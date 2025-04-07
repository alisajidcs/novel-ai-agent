'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
});

interface Character {
  name: string;
  interactions: string[];
}

interface CharacterNetworkProps {
  characters: Character[];
  isLoading: boolean;
}

export default function CharacterNetwork({ characters, isLoading }: CharacterNetworkProps) {
  const graphRef = useRef<any>(null);

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
      // Center the graph
      graphRef.current.centerAt(0, 0, 1000);
      // Zoom to fit
      graphRef.current.zoomToFit(400);
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
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="name"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = 'black';
          ctx.fillText(label, node.x, node.y + 10);
        }}
      />
    </div>
  );
} 