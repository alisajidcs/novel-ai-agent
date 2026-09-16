import {NextResponse} from 'next/server';

export async function POST(request:Request) {
  try {
    const {content}=await request.json();
    if(!content)return NextResponse.json({error:'Content is required'},{status:400});
    const prompt=`Analyze the following text and identify all named characters and the other characters they interact with. Return only valid JSON in this exact shape: {"AllCharacterNames":["John"],"interactionMapping":[{"name":"John","interactions":["Michel","Sarah"]}]}. Do not include markdown or commentary. Text to analyze:\n${content}`;
    const response=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.GROQ_API_KEY}`},body:JSON.stringify({model:'meta-llama/llama-4-scout-17b-16e-instruct',messages:[{role:'user',content:prompt}],temperature:0.4,max_tokens:2000})});
    if(!response.ok)throw new Error(`Failed to analyze content: ${response.statusText}`);
    const data=await response.json();
    const result=data.choices?.[0]?.message?.content||'{}';
    try{return NextResponse.json(JSON.parse(result.replaceAll('```json','').replaceAll('```','').trim()));}catch{return NextResponse.json({AllCharacterNames:[],interactionMapping:[]});}
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Failed to analyze content'},{status:500});}
}
