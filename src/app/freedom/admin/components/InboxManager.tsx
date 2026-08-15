"use client";

import React, { useState, useEffect } from 'react';

interface Submission {
  _id: string;
  name: string;
  answers: { [key: string]: string };
  createdAt: string;
}

export default function InboxManager({ adminPassword }: { adminPassword: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInboxData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment?admin=true');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.config.questions || []);
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboxData();
  }, []);

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Hapus dokumen pendaftaran ini dari database secara permanen?')) return;
    try {
      const res = await fetch('/api/recruitment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: adminPassword })
      });
      if (res.ok) fetchInboxData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#09090d]/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
      
      {/* Header Management Inbox */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-orange-500 rounded-full" />
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span>Berkas Pendaftaran Masuk</span>
              <span className="text-xs bg-orange-500/15 text-orange-400 font-bold px-2.5 py-0.5 rounded-full border border-orange-500/20">
                {submissions.length} Dokumen
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Daftar formulir rekrutmen yang dikirim oleh calon member</p>
          </div>
        </div>

        {/* Refresh Data Button */}
        <button
          type="button"
          onClick={fetchInboxData}
          disabled={loading}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 self-end sm:self-auto disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Memuat Berkas Pendaftaran...
          </p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 bg-black/40 border border-white/5 rounded-2xl p-6">
          <svg className="w-10 h-10 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Belum Ada Dokumen Lamaran</p>
          <p className="text-[11px] text-slate-600 mt-1">Seluruh formulir yang masuk dari halaman pendaftaran akan tampil di sini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {submissions.map((sub) => {
            const avatarUrl = `https://mc-heads.net/avatar/${sub.name}/40`;

            return (
              <div 
                key={sub._id} 
                className="bg-black/50 border border-white/10 hover:border-white/20 p-5 rounded-2xl flex flex-col gap-4 shadow-xl transition-all group"
              >
                {/* Header Kartu Pendaftar */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3.5 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#141419] border border-white/10 p-1 shrink-0 flex items-center justify-center">
                      <img 
                        src={avatarUrl} 
                        alt={sub.name} 
                        className="w-full h-full object-contain rounded"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors uppercase tracking-wide">
                        {sub.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(sub.createdAt).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Hapus Submission */}
                  <button 
                    type="button" 
                    onClick={() => handleDeleteSubmission(sub._id)} 
                    className="p-2 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-xl border border-white/10 hover:border-rose-500/20 transition-all"
                    title="Hapus Dokumen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                {/* Daftar Jawaban Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {questions.map((q) => {
                    if (q.type === 'paragraph') return null;
                    const answerValue = sub.answers[q.id];

                    return (
                      <div 
                        key={q.id} 
                        className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5 flex flex-col gap-1.5"
                      >
                        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                          {q.label}
                        </span>

                        {q.type === 'file' && answerValue ? (
                          <div className="flex flex-col gap-2.5 mt-1">
                            {answerValue.startsWith('data:image/') && (
                              <div className="p-2 bg-black/60 rounded-lg border border-white/10 max-w-fit">
                                <img 
                                  src={answerValue} 
                                  alt="Attachment" 
                                  className="max-h-40 object-contain rounded"
                                  style={{ imageRendering: 'pixelated' }} 
                                />
                              </div>
                            )}
                            <a 
                              href={answerValue} 
                              download={`file_${sub.name}_clip.png`} 
                              className="inline-flex items-center gap-1.5 text-[10px] text-orange-400 hover:text-orange-300 font-bold uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg w-fit transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                              </svg>
                              <span>Unduh Lampiran Berkas</span>
                            </a>
                          </div>
                        ) : (
                          <p className="text-slate-200 whitespace-pre-wrap font-medium leading-relaxed">
                            {answerValue || <span className="text-slate-600 italic">Kosong</span>}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
