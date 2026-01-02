import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { FileText, Calendar, User, Download, Share2, ArrowLeft, Eye } from 'lucide-react';
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
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPublication(data as Publication);
      
      // NOTA: A contagem de views requer uma função RPC no banco de dados.
      // Comentado para evitar erros no console até que a função 'increment_views' seja criada no SQL.
      /*
      if (data) {
          supabase.rpc('increment_views', { row_id: id }).catch(() => {});
      }
      */
    } catch (error) {
      console.error('Error fetching publication:', error);
      addToast({ title: 'Erro', description: 'Publicação não encontrada.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast({ title: 'Link copiado!', description: 'URL copiada para a área de transferência.', type: 'success' });
  };

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-8" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Publicação não encontrada</h2>
        <Link to="/pesquisas" className="text-emerald-600 hover:underline">Voltar para pesquisas</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header Info */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 py-8 md:py-12">
          <Link to="/pesquisas" className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Pesquisas
          </Link>
          
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide rounded-full mb-4">
                {publication.scientific_area}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {publication.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                 <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(publication.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Pesquisador PADC</span>
                 </div>
                 {publication.views !== undefined && (
                    <div className="flex items-center gap-1 text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{publication.views} visualizações</span>
                    </div>
                 )}
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <a 
                href={publication.file_url} 
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" /> Baixar PDF
              </a>
              <button 
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Compartilhar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Abstract & PDF Preview */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" /> Resumo
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
              {publication.abstract}
            </p>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold text-gray-900 mb-4">Leitura Online</h2>
             <div className="w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
               {/* Use standard object tag for PDF embedding */}
                <object
                    data={publication.file_url}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                >
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <p className="text-gray-500 mb-4">Seu navegador não suporta a visualização de PDF.</p>
                        <a 
                            href={publication.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-600 font-semibold hover:underline"
                        >
                            Clique aqui para baixar o arquivo.
                        </a>
                    </div>
                </object>
             </div>
          </section>
        </div>

        {/* Sidebar: Details */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Palavras-chave</h3>
            <div className="flex flex-wrap gap-2">
              {publication.keywords && publication.keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-2">Sobre o Acesso Aberto</h3>
            <p className="text-sm text-emerald-800/80 leading-relaxed">
                Esta obra está disponível gratuitamente para promover a democratização do conhecimento em Angola. Cite a fonte ao utilizar os dados.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};