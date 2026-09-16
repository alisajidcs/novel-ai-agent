'use client';

import {useEffect,useMemo,useState} from 'react';
import {BookMetadata as BookMetadataType,fetchBookData,getContentForPages,getPageCount,PAGE_SIZE_OPTIONS} from '@/lib/gutenberg';
import {analyzeBookContent} from '@/lib/llm';
import CharacterAnalysis from '@/components/CharacterAnalysis';
import Navigation from '@/components/Navigation';
import CharacterNetwork from '@/components/CharacterNetwork';
import BookSearchForm from '@/components/BookSearchForm';
import BookMetadataDisplay from '@/components/BookMetadata';
import BookContentPreview from '@/components/BookContentPreview';
import AnalysisControls from '@/components/AnalysisControls';
import HistoryPanel,{HistoryEntry} from '@/components/HistoryPanel';

export default function TextVersion() {
  const [content,setContent]=useState('');
  const [bookId,setBookId]=useState('');
  const [metadata,setMetadata]=useState<BookMetadataType|null>(null);
  const [characters,setCharacters]=useState<{name:string;interactions:string[]}[]>([]);
  const [history,setHistory]=useState<HistoryEntry[]>([]);
  const [pageSize,setPageSize]=useState(PAGE_SIZE_OPTIONS[1]);
  const [startPage,setStartPage]=useState(1);
  const [endPage,setEndPage]=useState(1);
  const [isLoading,setIsLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{try{const saved=window.localStorage.getItem('novel-ai-analysis-history');if(saved)setHistory(JSON.parse(saved));}catch{window.localStorage.removeItem('novel-ai-analysis-history');}},[]);
  const pageCount=useMemo(()=>getPageCount(content,pageSize),[content,pageSize]);
  const selectedContent=useMemo(()=>getContentForPages(content,startPage,endPage,pageSize),[content,startPage,endPage,pageSize]);
  const persistHistory=(entries:HistoryEntry[])=>{setHistory(entries);window.localStorage.setItem('novel-ai-analysis-history',JSON.stringify(entries));};

  const handleLoadBook=async(selectedBookId:string)=>{setIsLoading(true);setError(null);try{const data=await fetchBookData(selectedBookId);setBookId(selectedBookId);setContent(data.content);setMetadata(data.metadata);setCharacters([]);setStartPage(1);setEndPage(Math.min(5,getPageCount(data.content,pageSize)));}catch(err){setError(err instanceof Error?err.message:'An error occurred while loading the book');setContent('');setMetadata(null);setCharacters([]);}finally{setIsLoading(false);}};
  const handleAnalyze=async()=>{if(!content||!metadata||!selectedContent)return;setIsLoading(true);setError(null);try{const result=await analyzeBookContent(selectedContent);const nextCharacters=result.interactionMapping||[];setCharacters(nextCharacters);const entry:HistoryEntry={id:`${Date.now()}-${bookId}`,bookId,title:metadata.title,author:metadata.author,startPage,endPage,pageSize,characters:nextCharacters,contentPreview:selectedContent.slice(0,12000),createdAt:new Date().toISOString()};persistHistory([entry,...history].slice(0,20));}catch(err){setError(err instanceof Error?err.message:'An error occurred while processing the book');setCharacters([]);}finally{setIsLoading(false);}};
  const handleOpenHistory=(entry:HistoryEntry)=>{setBookId(entry.bookId);setMetadata({title:entry.title,author:entry.author,language:'Saved result',downloadCount:0});setContent(entry.contentPreview);setCharacters(entry.characters);setStartPage(entry.startPage);setEndPage(entry.endPage);setPageSize(entry.pageSize);setError(null);};
  const updatePageSize=(nextPageSize:number)=>{setPageSize(nextPageSize);const nextCount=getPageCount(content,nextPageSize);setStartPage(Math.min(startPage,nextCount));setEndPage(Math.min(Math.max(endPage,startPage),nextCount));};

  return <div className="min-h-screen bg-slate-50"><Navigation /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12"><div className="mb-10 max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">Literary intelligence workspace</p><h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">See how characters connect.</h1><p className="mt-4 text-lg leading-8 text-slate-600">Choose a classic, focus the reading window, and let the AI map the relationships inside it.</p></div><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-8"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="mb-6 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">01</span><div><h2 className="text-xl font-bold text-slate-900">Select a novel</h2><p className="text-sm text-slate-500">Start with a featured title or enter any Gutenberg ID.</p></div></div><BookSearchForm onLoadBook={handleLoadBook} isLoading={isLoading}/>{metadata&&<AnalysisControls startPage={startPage} endPage={endPage} pageSize={pageSize} pageCount={pageCount} isLoading={isLoading} onStartPageChange={(value)=>setStartPage(Math.max(1,Math.min(value||1,endPage)))} onEndPageChange={(value)=>setEndPage(Math.max(startPage,Math.min(value||startPage,pageCount)))} onPageSizeChange={updatePageSize} onAnalyze={handleAnalyze}/>}</section>{error&&<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}{metadata&&<BookMetadataDisplay metadata={metadata}/>}<section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-xl shadow-slate-200"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-8"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Relationship map</p><h2 className="mt-1 text-xl font-bold text-white">Character network</h2></div>{characters.length>0&&<span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">{characters.length} characters</span>}</div><CharacterNetwork characters={characters} isLoading={isLoading}/></section><CharacterAnalysis characters={characters} isLoading={isLoading}/>{content&&<BookContentPreview content={selectedContent}/>}</div><HistoryPanel entries={history} onOpen={handleOpenHistory} onDelete={(id)=>persistHistory(history.filter((entry)=>entry.id!==id))} onClear={()=>persistHistory([])}/></div></main></div>;
}
