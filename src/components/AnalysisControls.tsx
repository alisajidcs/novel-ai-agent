'use client';

import type {FormEvent} from 'react';
import {PAGE_SIZE_OPTIONS} from '@/lib/gutenberg';

interface AnalysisControlsProps {
  startPage:number; endPage:number; pageSize:number; pageCount:number; isLoading:boolean;
  onStartPageChange:(value:number)=>void; onEndPageChange:(value:number)=>void; onPageSizeChange:(value:number)=>void; onAnalyze:()=>void;
}

export default function AnalysisControls({startPage,endPage,pageSize,pageCount,isLoading,onStartPageChange,onEndPageChange,onPageSizeChange,onAnalyze}: AnalysisControlsProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onAnalyze(); };
  return <form onSubmit={handleSubmit} className="mt-8 border-t border-slate-100 pt-7">
    <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Analysis window</p><h2 className="mt-1 text-xl font-bold text-slate-900">Choose which pages the AI should read</h2><p className="mt-1 text-sm text-slate-500">Only this selected slice is sent for character extraction.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="text-sm font-semibold text-slate-700">From page<input type="number" min={1} max={pageCount} value={startPage} onChange={(event)=>onStartPageChange(Number(event.target.value))} disabled={isLoading} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60" /></label>
      <label className="text-sm font-semibold text-slate-700">To page<input type="number" min={startPage} max={pageCount} value={endPage} onChange={(event)=>onEndPageChange(Number(event.target.value))} disabled={isLoading} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60" /></label>
      <label className="text-sm font-semibold text-slate-700">Page length<select value={pageSize} onChange={(event)=>onPageSizeChange(Number(event.target.value))} disabled={isLoading} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60">{PAGE_SIZE_OPTIONS.map((size)=><option key={size} value={size}>{size.toLocaleString()} characters / page</option>)}</select></label>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-slate-500">This novel contains approximately {pageCount} pages at this length.</span><button type="submit" disabled={isLoading} className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{isLoading ? 'Finding characters…' : 'Analyze selected pages'}</button></div>
  </form>;
}
