interface CharacterAnalysis {
  AllCharacterNames: string[];
  interactionMapping: Character[];
}

interface Character {
  name: string;
  interactions: string[];
}

export async function analyzeBookContent(content: string): Promise<CharacterAnalysis> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze content');
  }

  return response.json();
}
