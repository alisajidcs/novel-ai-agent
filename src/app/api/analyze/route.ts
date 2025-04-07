import { NextResponse } from 'next/server';

interface Character {
  name: string;
  interactions: string[];
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const prompt = `Analyze the following text and identify all characters. For each character, provide:
1. Their name
3. Other characters name, that they interact with


Format the response as a JSON object with the following structure:

{
  AllCharacterNames: ["John"],
  interactionMapping: [
    {
      "name": "John",
      "interactions": ["Michel", "Sarah"]
    }
  ]
}
  
Just Provide me the JSON. No other text not even backticks
  
Text to analyze: "${content}"
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-specdec',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze content: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    
    try {
      const characters = JSON.parse(result.replaceAll('```json', '').replaceAll('```', ''));
      return NextResponse.json(characters);
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze content' },
      { status: 500 }
    );
  }
} 