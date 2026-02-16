import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, FileText, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Publication } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

export const Search: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    area: '',
  });
  const { addToast } = useToast();

  const areas = [
    'Ciências Sociais',
    'Engenharia',
    'Saúde',
    'Educação',
    'Tecnologia',
    'Direito',
    'Economia'
  ];

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      // Usamos a sintaxe mais robusta para join
      let query = supabase
        .from('publicacoes')
        .select(`
          *,
          profiles (
            full_name,
            institution
          )
        `)
        .eq('approved', true) 
        .order('created_at', { ascending: false });

      if (filters.keyword) {
        query = query.ilike('title', `%${filters.keyword}%`);
      }
      
      if (filters.area) {
        query = query.eq('scientific_area', filters.area);
      }

      const { data, error } = await query;

      if (error) {
         console.warn("Erro no Join, tentando carga simples:", error);
         const { data: simpleData, error: simpleError } = await supabase
           .from('publicacoes')
           .select('*')
           .eq('approved', true)
           .order('created_at', { ascending: false });
         
         if (simpleError) throw simpleError;
         setPublications(simpleData as Publication[]);
      } else {
        setPublications(data as Publication[]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar pesquisas:', error);
      addToast({ 
        title: 'Erro de Acervo', 
        description: 'Não foi possível carregar os detalhes dos autores. Tente novamente mais tarde.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublications();
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-3 mb-8 text-gray-900">
              <Filter className="w-6 h-6 text-emerald-500" />
              <h2 className="font-black text-xl uppercase tracking-tighter">Filtros</h2>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Termo de Busca</label>
                <div className="relative">
                  <input
                    type="text"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                    placeholder="Título da obra..."
                    className="w-full p-4 pl-12 rounded-2xl border border-gray-100 text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none font-bold"
                  />
                  <SearchIcon className="w-5 h-5 text-gray-300 absolute left-4 top-4" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-3 block tracking-widest">Área Científica</label>
                <select
                  name="area"
                  value={filters.area}
                  onChange={handleFilterChange}
                  className="w-full p-4 rounded-2xl border border-gray-100 text-sm focus:ring-4 focus:ring-emerald-500/10 outline-none bg-white font-black"
                >
                  <option value="">Todas as áreas</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95 uppercase text-xs tracking-widest"
              >
                APLICAR FILTROS
              </button>
            </form>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Acervo PADC</h1>
            <span className="px-5 py-2 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">
              {loading ? 'BUSCANDO...' : `${publications.length} OBRAS ENCONTRADAS`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-[3rem]" />
              ))}
            </div>
          ) : publications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {publications.map((pub) => (
                <div key={pub.id} className="group bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 flex flex-col h-full overflow-hidden">
                  <div className="p-10 flex-1 flex flex-col">
                    <div className="mb-8">
                      <span className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl mb-4 tracking-widest uppercase">
                        {pub.scientific_area}
                      </span>
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-[1.2] uppercase tracking-tight">
                        {pub.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-500 text-sm line-clamp-3 mb-8 flex-1 font-medium leading-relaxed italic">
                      "{pub.abstract}"
                    </p>

                    <div className="flex items-center gap-4 pt-8 border-t border-gray-50 mt-auto">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {pub.profiles?.full_name?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tighter">
                          {pub.profiles?.full_name || 'Autor Cadastrado'}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">
                          {pub.profiles?.institution || 'Instituição Académica'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-8 border-t border-gray-100 flex justify-between items-center group-hover:bg-emerald-50/50 transition-colors">
                    <Link to={`/publicacao/${pub.id}`} className="text-[10px] font-black text-zinc-900 hover:text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      EXPLORAR PESQUISA <ArrowRight className="w-3 h-3" />
                    </Link>
                    {pub.file_url && (
                        <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm">
                            <FileText className="w-5 h-5" />
                        </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-gray-50">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                <SearchIcon className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Sem resultados</h3>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Tente buscar por termos mais genéricos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import { ArrowRight } from 'lucide-react';