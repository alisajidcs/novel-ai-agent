import {NextResponse} from 'next/server';
import * as cheerio from 'cheerio';

async function fetchWithRetry(url:string,options:RequestInit={},retries=3,timeout=10000):Promise<Response>{
  const controller=new AbortController();const timeoutId=setTimeout(()=>controller.abort(),timeout);
  try{const response=await fetch(url,{...options,signal:controller.signal});clearTimeout(timeoutId);return response;}catch(error){clearTimeout(timeoutId);if(retries>0&&error instanceof Error&&error.name==='AbortError'){await new Promise((resolve)=>setTimeout(resolve,1000));return fetchWithRetry(url,options,retries-1,timeout);}throw error;}
}

export async function GET(request:Request){
  const bookId=new URL(request.url).searchParams.get('bookId');
  if(!bookId||!/^[0-9]+$/.test(bookId))return NextResponse.json({error:'A valid Gutenberg book ID is required'},{status:400});
  try{
    const headers={'User-Agent':'Mozilla/5.0 (compatible; NovelAI/1.0)'};
    const contentResponse=await fetchWithRetry(`https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`,{headers});
    if(!contentResponse.ok)throw new Error(`Failed to fetch book content: ${contentResponse.statusText}`);
    const content=await contentResponse.text();
    const metadataResponse=await fetchWithRetry(`https://www.gutenberg.org/ebooks/${bookId}`,{headers});
    if(!metadataResponse.ok)throw new Error(`Failed to fetch book metadata: ${metadataResponse.statusText}`);
    const $=cheerio.load(await metadataResponse.text());
    const downloadCountText=$('table.bibrec tr:contains("Downloads") td').text().trim();
    return NextResponse.json({content,metadata:{title:$('h1').first().text().trim()||'Unknown Title',author:$('table.bibrec tr:contains("Author") td').text().trim()||'Unknown Author',language:$('table.bibrec tr:contains("Language") td').text().trim()||'Unknown Language',downloadCount:parseInt(downloadCountText.replace(/,/g,''),10)||0}});
  }catch(error){const message=error instanceof Error?error.message:'Failed to fetch book data';return NextResponse.json({error:message},{status:message.toLowerCase().includes('timeout')?504:500});}
}
