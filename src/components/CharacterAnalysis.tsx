'use client';

interface Character {
  name: string;
  interactions: string[];
}

interface CharacterAnalysisProps {
  characters: Character[];
  isLoading: boolean;
}

export default function CharacterAnalysis({ characters, isLoading }: CharacterAnalysisProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No characters found in the text
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {characters.map((character, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-4">{character.name}</h3>
          <div>
            <h4 className="font-medium mb-2">Interactions:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              {character.interactions.map((interaction, i) => (
                <li key={i}>{interaction}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
} 