import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, FileText, ArrowRight, User, School } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

export const Search: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: '', area: '' });
  const { addToast } = useToast();

  const areas = ['Ciências Sociais', 'Engenharia', 'Saúde', 'Educação', 'Tecnologia', 'Direito', 'Economia'];

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      // 1. Tenta buscar tudo com Join (Aproximação Ideal)
      const { data: joinedData, error: joinErr } = await supabase
        .from('publicacoes')
        .select(`
          *,
          profiles!user_id (
            full_name,
            institution
          )
        `)
        .eq('approved', true) 
        .order('created_at', { ascending: false });

      if (joinErr) {
        console.warn("Join falhou, tentando fallback resiliente...", joinErr);
        
        // 2. Fallback: Se o join falhar, busca publicações sozinhas
        const { data: pubData, error: pubErr } = await supabase
          .from('publicacoes')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false });

        if (pubErr) throw pubErr;

        if (pubData && pubData.length > 0) {
           // 3. Busca perfis de forma paralela para os IDs encontrados
           const userIds = [...new Set(pubData.map(p => p.user_id))];
           const { data: profData } = await supabase
             .from('profiles')
             .select('id, full_name, institution')
             .in('id', userIds);

           const merged = pubData.map(p => ({
             ...p,
             profiles: profData?.find(pr => pr.id === p.user_id) || { full_name: 'Pesquisador PADC', institution: 'Instituição não informada' }
           }));

           setPublications(merged as Publication[]);
        } else {
          setPublications([]);
        }
      } else {
        // Aplica os filtros localmente se necessário, ou reconstrói a query (mais seguro reconstruir)
        let finalData = joinedData;
        if (filters.keyword) {
           finalData = finalData.filter(p => p.title.toLowerCase().includes(filters.keyword.toLowerCase()));
        }
        if (filters.area) {
           finalData = finalData.filter(p => p.scientific_area === filters.area);
        }
        setPublications(finalData as Publication[]);
      }
    } catch (error: any) {
      console.error('Busca Error:', error);
      addToast({ title: 'Aviso de Acervo', description: 'O carregamento de autores pode estar instável, mas as obras serão exibidas.', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublications();
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24">
            <h2 className="font-black text-xl uppercase tracking-tighter mb-8 flex items-center gap-2 text-gray-900">
               <Filter className="w-5 h-5 text-emerald-500" /> Refinar
            </h2>
            <form onSubmit={handleApplyFilters} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Termo de Busca</label>
                <input 
                  type="text" 
                  placeholder="Título..." 
                  value={filters.keyword} 
                  onChange={e => setFilters({...filters, keyword: e.target.value})} 
                  className="w-full p-4 rounded-xl border border-gray-100 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-bold bg-gray-50/50 text-gray-900" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Domínio Científico</label>
                <select 
                  value={filters.area} 
                  onChange={e => setFilters({...filters, area: e.target.value})} 
                  className="w-full p-4 rounded-xl border border-gray-100 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-black bg-white text-gray-900"
                >
                  <option value="">Todos</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 shadow-lg active:scale-95 transition-all">
                Atualizar Acervo
              </button>
            </form>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none">Biblioteca Pública</h1>
              <p className="text-gray-500 font-medium mt-3">Produção angolana validada e acessível.</p>
            </div>
            <div className="hidden md:block px-5 py-2 bg-gray-100 rounded-full text-[10px] font-black text-gray-500 uppercase">
              {publications.length} Obras Disponíveis
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 w-full rounded-[3rem]" />)}
            </div>
          ) : publications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {publications.map((pub) => (
                <div key={pub.id} className="group bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 flex flex-col h-full overflow-hidden">
                  <div className="p-10 flex-1 flex flex-col">
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg mb-6 tracking-widest uppercase">
                      {pub.scientific_area}
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-tight uppercase tracking-tight mb-6">
                      {pub.title}
                    </h3>
                    
                    <p className="text-gray-500 text-sm line-clamp-3 mb-10 flex-1 font-medium italic">"{pub.abstract}"</p>

                    <div className="space-y-4 pt-8 border-t border-gray-50 mt-auto">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black text-lg">
                          {pub.profiles?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-gray-900 uppercase truncate">
                            {pub.profiles?.full_name || 'Investigador Registado'}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black uppercase">
                            <School className="w-3.5 h-3.5" />
                            <span className="truncate">{pub.profiles?.institution || 'Afiliação Institucional'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-8 border-t border-gray-100 flex justify-between items-center group-hover:bg-emerald-50/50 transition-colors">
                    <Link to={`/publicacao/${pub.id}`} className="text-[10px] font-black text-zinc-900 hover:text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      Ver Pesquisa Completa <ArrowRight className="w-3 h-3" />
                    </Link>
                    <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm"><FileText className="w-5 h-5" /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-40 text-center bg-white rounded-[4rem] border-4 border-dashed border-gray-50">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <SearchIcon className="w-8 h-8 text-gray-200" />
               </div>
               <h3 className="text-2xl font-black text-gray-400 uppercase tracking-widest">Sem resultados</h3>
               <p className="text-gray-500 font-medium mt-2">Aguarde por novas publicações aprovadas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};