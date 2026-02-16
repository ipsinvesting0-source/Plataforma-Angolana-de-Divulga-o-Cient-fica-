import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { FileText, Calendar, Download, ArrowLeft, Eye, Clock, AlertTriangle, ShieldCheck, School, User } from 'lucide-react';
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
      // Primeiro tentamos o fetch com Join
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
        .maybeSingle();

      if (error) {
        console.warn('Erro no join de detalhes, tentando carga separada:', error);
        
        // Fallback: Busca a publicação primeiro
        const { data: pubOnly, error: pubError } = await supabase
          .from('publicacoes')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (pubError) throw pubError;
        if (!pubOnly) {
          setPublication(null);
          return;
        }

        // Depois busca o perfil do autor
        const { data: profileOnly } = await supabase
          .from('profiles')
          .select('full_name, institution')
          .eq('id', pubOnly.user_id)
          .maybeSingle();

        setPublication({
          ...pubOnly,
          profiles: profileOnly || { full_name: 'Autor Registado', institution: 'Instituição não informada' }
        } as Publication);

      } else {
        setPublication(data as Publication);
      }
    } catch (error: any) {
      console.error('Error fetching publication:', error);
      addToast({ title: 'Erro de Dados', description: 'Não conseguimos carregar todos os detalhes da obra.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="max-w-screen-xl mx-auto p-12"><Skeleton className="h-[600px] w-full rounded-[3rem]" /></div>;
  
  if (!publication) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-20 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Obra Não Encontrada</h2>
      <p className="text-gray-500 mt-4 max-w-md font-medium">A publicação que procura pode ter sido removida ou o link está incorreto.</p>
      <Link to="/pesquisas" className="mt-8 px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 flex items-center gap-2">
        <ArrowLeft className="w-5 h-5" /> VOLTAR AO ACERVO
      </Link>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Alertas de Status */}
      {!publication.approved && !publication.rejection_reason && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 sticky top-16 z-30">
           <div className="max-w-screen-xl mx-auto flex items-center gap-3 text-amber-800">
              <Clock className="w-5 h-5" />
              <p className="font-black text-[10px] uppercase tracking-widest">
                Obra em processo de moderação. Visível apenas para o autor e administradores.
              </p>
           </div>
        </div>
      )}

      {publication.rejection_reason && (
        <div className="bg-red-50 border-b border-red-200 p-4 sticky top-16 z-30">
           <div className="max-w-screen-xl mx-auto flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-black text-[10px] uppercase tracking-widest">
                Esta obra necessita de correções. Verifique o seu painel de autor.
              </p>
           </div>
        </div>
      )}

      <div className="bg-white border-b shadow-sm relative z-20">
        <div className="max-w-screen-xl mx-auto px-4 py-16">
          <Link to="/pesquisas" className="inline-flex items-center text-xs font-black text-emerald-600 uppercase tracking-widest mb-10 group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar à Biblioteca
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-16 justify-between items-start">
            <div className="flex-1">
              <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl mb-8 tracking-widest uppercase border border-emerald-100">
                {publication.scientific_area}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-10 leading-[1.1] tracking-tighter uppercase max-w-4xl">
                {publication.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-[2rem] bg-zinc-900 flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                       {publication.profiles?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Autor Principal</p>
                      <p className="font-black text-gray-900 uppercase tracking-tight text-2xl leading-none">{publication.profiles?.full_name || 'Autor Registado'}</p>
                      <div className="flex items-center gap-2 mt-2 text-gray-500 font-bold uppercase text-[10px]">
                        <School className="w-4 h-4 text-emerald-500" />
                        <span>{publication.profiles?.institution || 'Instituição de Ensino Superior'}</span>
                      </div>
                    </div>
                 </div>

                 <div className="flex gap-8 md:justify-end">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Submetido em</p>
                       <div className="flex items-center gap-2 font-black text-gray-900 bg-gray-50 px-4 py-2 rounded-xl">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span>{new Date(publication.created_at).toLocaleDateString('pt-AO')}</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="w-full lg:w-auto shrink-0">
              <a 
                href={publication.file_url} 
                target="_blank" 
                rel="noreferrer" 
                className="w-full lg:w-auto px-12 py-6 bg-emerald-600 text-white font-black rounded-[2rem] shadow-2xl shadow-emerald-200 hover:bg-emerald-700 text-center flex items-center justify-center gap-4 transition-all active:scale-95 group"
              >
                <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" /> 
                DESCARREGAR PESQUISA (PDF)
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-16">
          <section className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100 relative">
            <div className="absolute -top-6 left-12 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
              Resumo da Obra
            </div>
            <p className="text-gray-600 leading-[1.8] text-xl font-medium whitespace-pre-line italic pt-4">
              "{publication.abstract}"
            </p>
          </section>

          <section className="bg-zinc-900 p-4 rounded-[4rem] shadow-2xl h-[900px] overflow-hidden group">
             <object 
               data={publication.file_url} 
               type="application/pdf" 
               width="100%" 
               height="100%" 
               className="rounded-[3rem]"
             >
                <div className="flex flex-col items-center justify-center h-full p-20 text-center text-white">
                   <AlertTriangle className="w-16 h-16 text-emerald-500 mb-6" />
                   <h3 className="text-2xl font-black uppercase mb-4">Pré-visualização Indisponível</h3>
                   <p className="font-bold text-gray-400 max-w-sm mb-8">
                     O seu navegador não suporta a visualização direta de PDFs. Por favor, utilize o botão de descarga.
                   </p>
                   <a href={publication.file_url} className="px-8 py-4 bg-emerald-600 rounded-2xl font-black uppercase tracking-widest">Descarregar PDF agora</a>
                </div>
             </object>
          </section>
        </div>

        <aside className="space-y-10">
          <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8 border-b border-gray-50 pb-4">Indexação</h3>
            <div className="flex flex-wrap gap-3">
              {publication.keywords?.map((kw, i) => (
                <span key={i} className="px-5 py-2.5 bg-gray-50 text-gray-900 text-xs font-black rounded-xl border border-gray-100 uppercase tracking-tighter">
                  #{kw.trim()}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-emerald-600 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <ShieldCheck className="w-64 h-64" />
            </div>
            <ShieldCheck className="w-12 h-12 text-emerald-200 mb-8" />
            <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter leading-tight">Garantia de Autenticidade</h3>
            <p className="text-sm text-emerald-50 font-medium leading-relaxed mb-8">
              Esta obra foi depositada no PADC e passou por uma triagem institucional para garantir a integridade dos dados e afiliação do autor.
            </p>
            <div className="pt-6 border-t border-white/20">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Licença de Uso</p>
               <p className="text-xs font-bold mt-2">Atribuição-NãoComercial 4.0 Internacional (CC BY-NC 4.0)</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
