
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
// Added ShieldCheck to the imports below
import { FileText, Calendar, User, Download, Share2, ArrowLeft, Eye, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
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
          profiles:user_id (
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
      addToast({ title: 'Erro', description: 'Publicação não encontrada.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20"><Skeleton className="h-96 w-full" /></div>;
  if (!publication) return <div className="p-20 text-center">Pesquisa não encontrada.</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Alerta de Status (Apenas visível para o autor ou admin se não estiver aprovado) */}
      {!publication.approved && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
           <div className="max-w-screen-xl mx-auto flex items-center gap-3 text-amber-800">
              <Clock className="w-5 h-5" />
              <p className="font-medium text-sm">
                Esta publicação está <span className="font-bold">Aguardando Aprovação</span> por um administrador e ainda não está visível para o público geral.
              </p>
           </div>
        </div>
      )}

      {publication.rejection_reason && (
        <div className="bg-red-50 border-b border-red-200 p-4">
           <div className="max-w-screen-xl mx-auto flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium text-sm">
                Esta publicação foi <span className="font-bold">devolvida para correções</span>. Verifique seu dashboard para mais detalhes.
              </p>
           </div>
        </div>
      )}

      <div className="bg-white border-b">
        <div className="max-w-screen-xl mx-auto px-4 py-12">
          <Link to="/pesquisas" className="flex items-center text-sm text-gray-500 hover:text-emerald-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Pesquisas
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 justify-between">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-4">
                {publication.scientific_area}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {publication.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                 <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                       {publication.profiles?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{publication.profiles?.full_name}</p>
                      <p className="text-xs">{publication.profiles?.institution}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Postado em {new Date(publication.created_at).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a href={publication.file_url} download target="_blank" rel="noreferrer" className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg text-center flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> Baixar PDF
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-500" /> Resumo da Pesquisa
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
              {publication.abstract}
            </p>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[800px]">
             <object data={publication.file_url} type="application/pdf" width="100%" height="100%" className="rounded-xl">
                <p>O seu navegador não suporta visualização direta. <a href={publication.file_url} className="text-emerald-600 font-bold">Clique aqui para baixar.</a></p>
             </object>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Metadados e Tags</h3>
            <div className="flex flex-wrap gap-2">
              {publication.keywords?.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Ciência Aberta
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Esta obra é distribuída sob licença de acesso aberto para acelerar a investigação científica em Angola. Sinta-se à vontade para utilizar o conhecimento, citando devidamente os autores.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
