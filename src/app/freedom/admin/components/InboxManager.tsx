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
    if (!confirm('Hapus dokumen pendaftaran ini dari database?')) return;
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
    <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-xl">
      <h3 className="text-sm font-black uppercase tracking-wider mb-4 border-b border-white/5 pb-2 text-slate-300">Daftar Berkas Masuk ({submissions.length})</h3>
      
      {loading ? <p className="text-xs text-slate-500 text-center py-6">Memuat data berkas...</p> : submissions.length === 0 ? <p className="text-xs text-slate-600 text-center py-8">Belum ada dokumen lamaran masuk.</p> : (
        <div className="flex flex-col gap-6">
          {submissions.map((sub) => (
            <div key={sub._id} className="bg-black/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4 shadow-md">
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <h4 className="text-sm font-black text-orange-500 uppercase tracking-wide">{sub.name}</h4>
                  <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 block">Masuk: {new Date(sub.createdAt).toLocaleString('id-ID')}</span>
                </div>
                <button type="button" onClick={() => handleDeleteSubmission(sub._id)} className="p-2 text-red-400 hover:text-white bg-red-500/5 hover:bg-red-600 rounded-lg border border-red-500/10 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 text-xs">
                {questions.map((q) => {
                  if (q.type === 'paragraph') return null;
                  const answerValue = sub.answers[q.id];
                  return (
                    <div key={q.id} className="bg-white/[0.01] p-3 rounded-lg border border-white/5 flex flex-col gap-1.5">
                      <span className="font-bold text-slate-400">{q.label}</span>
                      {q.type === 'file' && answerValue ? (
                        <div className="flex flex-col gap-2">
                          {answerValue.startsWith('data:image/') && <img src={answerValue} alt="Attachment" className="max-h-48 object-contain rounded border border-white/10 self-start" />}
                          <a href={answerValue} download={`file_${sub.name}_clip.png`} className="text-[10px] text-orange-400 hover:underline font-bold uppercase tracking-wider">Unduh Lampiran Berkas</a>
                        </div>
                      ) : (
                        <p className="text-slate-200 whitespace-pre-wrap font-medium">{answerValue || <span className="text-slate-600 italic">Kosong</span>}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
