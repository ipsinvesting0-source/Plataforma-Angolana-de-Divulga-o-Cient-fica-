import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { FileText, Calendar, Download, ArrowLeft, Eye, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const PublicationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    if (id) fetchPublication();
  }, [id]);

  const fetchPublication = async () => {
    try {
      const { data, error } = await supabase
        .from('publicacoes')
        .select(`
          *,
          profiles (
            full_name,
            institution
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setPublication(data as Publication);
    } catch (error) {
      console.error('Error fetching publication:', error);
      addToast({ title: 'Erro', description: 'Publicação não encontrada ou falha no vínculo de dados.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20"><Skeleton className="h-96 w-full rounded-[3rem]" /></div>;
  if (!publication) return <div className="p-20 text-center font-black uppercase tracking-widest">Pesquisa não encontrada.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Alertas de Status */}
      {!publication.approved && !publication.rejection_reason && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
           <div className="max-w-screen-xl mx-auto flex items-center gap-3 text-amber-800">
              <Clock className="w-5 h-5" />
              <p className="font-black text-[10px] uppercase tracking-widest">
                Obra em processo de moderação. Visível apenas para o autor e administradores.
              </p>
           </div>
        </div>
      )}

      {publication.rejection_reason && (
        <div className="bg-red-50 border-b border-red-200 p-4">
           <div className="max-w-screen-xl mx-auto flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-black text-[10px] uppercase tracking-widest">
                Esta obra necessita de correções e não está publicada.
              </p>
           </div>
        </div>
      )}

      <div className="bg-white border-b">
        <div className="max-w-screen-xl mx-auto px-4 py-16">
          <Link to="/pesquisas" className="inline-flex items-center text-xs font-black text-emerald-600 uppercase tracking-widest mb-8 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Acervo
          </Link>
          
          <div className="flex flex-col md:flex-row gap-12 justify-between items-start">
            <div className="flex-1">
              <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg mb-6 tracking-widest uppercase">
                {publication.scientific_area}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tighter uppercase">
                {publication.title}
              </h1>
              <div className="flex flex-wrap items-center gap-8 text-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-emerald-100">
                       {publication.profiles?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 uppercase tracking-tight text-lg">{publication.profiles?.full_name || 'Autor Externo'}</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{publication.profiles?.institution || 'Investigador Independente'}</p>
                    </div>
                 </div>
                 <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data de Depósito</p>
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                       <Calendar className="w-4 h-4 text-emerald-500" />
                       <span>{new Date(publication.created_at).toLocaleDateString('pt-AO')}</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <a href={publication.file_url} download target="_blank" rel="noreferrer" className="px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-2xl shadow-emerald-100 hover:bg-emerald-700 text-center flex items-center justify-center gap-3 transition-all active:scale-95">
                <Download className="w-6 h-6" /> BAIXAR PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <FileText className="w-8 h-8 text-emerald-500" /> Resumo Científico
            </h2>
            <p className="text-gray-500 leading-[1.8] text-lg font-medium whitespace-pre-line">
              {publication.abstract}
            </p>
          </section>

          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 h-[800px] overflow-hidden">
             <object data={publication.file_url} type="application/pdf" width="100%" height="100%" className="rounded-2xl">
                <div className="flex flex-col items-center justify-center h-full p-20 text-center">
                   <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                   <p className="font-black uppercase tracking-widest text-sm text-gray-400">
                     A visualização direta não é suportada no seu navegador.<br/>
                     <a href={publication.file_url} className="text-emerald-600 mt-4 block underline underline-offset-8">Descarregar ficheiro PDF</a>
                   </p>
                </div>
             </object>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Palavras-chave</h3>
            <div className="flex flex-wrap gap-2">
              {publication.keywords?.map((kw, i) => (
                <span key={i} className="px-4 py-2 bg-gray-50 text-gray-700 text-xs font-black rounded-xl border border-gray-100 uppercase tracking-tighter">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-zinc-900 p-10 rounded-[2.5rem] text-white shadow-2xl">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mb-6" />
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Ciência Aberta</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              O PADC garante que este conhecimento permaneça livre para consulta. Ao utilizar estes dados, cite corretamente o autor e a instituição para fortalecer o ecossistema científico angolano.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};