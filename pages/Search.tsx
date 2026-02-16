import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Calendar, Filter, FileText, User } from 'lucide-react';
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
  }, []);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      // JOIN com a tabela de perfis através da coluna user_id
      // Nota: Supabase usa o nome da FK ou a estrutura de relacionamento definida no banco
      let query = supabase
        .from('publicacoes')
        .select(`
          *,
          profiles:user_id (
            full_name
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

      if (error) throw error;
      setPublications(data as Publication[]);
    } catch (error) {
      console.error('Erro ao buscar pesquisas:', error);
      addToast({ title: 'Erro de conexão', description: 'Não foi possível carregar as publicações.', type: 'error' });
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
            <h1 className="text-2xl font-bold text-gray-900">Pesquisas Disponíveis</h1>
            <span className="text-sm text-gray-500">
              {loading ? 'Carregando...' : `${publications.length} resultados encontrados`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64 flex flex-col justify-between">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
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

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                        {pub.profiles?.full_name?.charAt(0) || <User className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {pub.profiles?.full_name || 'Autor Desconhecido'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {new Date(pub.created_at).toLocaleDateString('pt-AO')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                    <Link to={`/publicacao/${pub.id}`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                      Ver Pesquisa
                    </Link>
                    {pub.file_url && (
                        <a href={pub.file_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-600">
                            <FileText className="w-4 h-4" />
                        </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
              <SearchIcon className="w-10 h-10 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sem resultados</h3>
              <p className="text-gray-500">Tente buscar por outro termo ou área científica.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};