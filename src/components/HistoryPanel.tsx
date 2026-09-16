'use client';

export interface HistoryEntry { id:string; bookId:string; title:string; author:string; startPage:number; endPage:number; pageSize:number; characters:{name:string;interactions:string[]}[]; contentPreview:string; createdAt:string; }
interface HistoryPanelProps { entries:HistoryEntry[]; onOpen:(entry:HistoryEntry)=>void; onDelete:(id:string)=>void; onClear:()=>void; }

export default function HistoryPanel({entries,onOpen,onDelete,onClear}: HistoryPanelProps) {
  return <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:h-fit">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Dashboard</p><h2 className="mt-1 text-xl font-bold text-slate-900">Analysis history</h2></div>{entries.length>0&&<button type="button" onClick={onClear} className="text-xs font-semibold text-slate-400 transition hover:text-red-500">Clear all</button>}</div>
    {entries.length===0 ? <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">Completed analyses will appear here and remain available on this device.</div> : <div className="mt-5 space-y-3">{entries.map((entry)=><div key={entry.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><button type="button" onClick={()=>onOpen(entry)} className="block w-full text-left"><p className="truncate font-semibold text-slate-800">{entry.title}</p><p className="mt-1 text-xs text-slate-500">Pages {entry.startPage}–{entry.endPage} · {entry.characters.length} characters</p><p className="mt-2 text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</p></button><button type="button" onClick={()=>onDelete(entry.id)} className="mt-3 text-xs font-semibold text-slate-400 transition hover:text-red-500">Remove</button></div>)}</div>}
  </aside>;
}
