import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Calendar, Filter, FileText, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Publication, Profile } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

export const Search: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    area: '',
    author: ''
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
  }, []); // Initial load

  const fetchPublications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('publicacoes')
        .select(`
          *,
          profiles:user_id (full_name, institution)
        `)
        .eq('approved', true) // Only approved publications
        .order('data_publicacao', { ascending: false });

      if (filters.keyword) {
        query = query.ilike('titulo', `%${filters.keyword}%`);
      }
      
      if (filters.area) {
        query = query.eq('area_cientifica', filters.area);
      }

      // Note: Filtering by joined table column (author name) is complex in simple Supabase query.
      // We will filter by keyword/title and area mainly for this demo, client-side filtering for author if needed.

      const { data, error } = await query;

      if (error) throw error;
      setPublications(data as unknown as Publication[]);
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error);
      addToast({ title: 'Erro ao carregar dados', type: 'error' });
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
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-900">
              <Filter className="w-5 h-5 text-emerald-500" />
              <h2 className="font-semibold text-lg">Filtros</h2>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Palavra-chave</label>
                <div className="relative">
                  <input
                    type="text"
                    name="keyword"
                    value={filters.keyword}
                    onChange={handleFilterChange}
                    placeholder="Título ou termo..."
                    className="w-full p-2 pl-9 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                  <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Área Científica</label>
                <select
                  name="area"
                  value={filters.area}
                  onChange={handleFilterChange}
                  className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="">Todas as áreas</option>
                  {areas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Data (Ano)</label>
                 <input
                    type="number"
                    placeholder="Ex: 2024"
                    className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 text-white py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors mt-2"
              >
                Aplicar Filtros
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Pesquisas Recentes</h1>
            <span className="text-sm text-gray-500">
              {loading ? 'Carregando...' : `${publications.length} resultados encontrados`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64 flex flex-col justify-between">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : publications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publications.map((pub) => (
                <div key={pub.id} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col h-full overflow-hidden">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md mb-2">
                        {pub.scientific_area}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {pub.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                      {pub.abstract}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {pub.keywords?.slice(0, 3).map((kw, idx) => (
                        <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          #{kw}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {/* @ts-ignore - Supabase join typing is tricky without generated types */}
                          {pub.profiles?.full_name || 'Autor Desconhecido'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {new Date(pub.publish_date).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                    <Link to={`/publicacao/${pub.id}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      Ver Detalhes
                    </Link>
                    {pub.file_url && (
                        <a href={pub.file_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-600" title="Download PDF">
                            <FileText className="w-4 h-4" />
                        </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <SearchIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma pesquisa encontrada</h3>
              <p className="text-gray-500 text-center max-w-md">
                Tente ajustar seus filtros ou cadastre uma nova pesquisa para contribuir com a plataforma.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};