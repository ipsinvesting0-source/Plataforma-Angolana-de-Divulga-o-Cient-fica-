import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Plus, 
  Download, 
  Eye, 
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { Publication } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'publications' | 'profile'>('overview');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    try {
      // Load Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      setUserProfile(profile);

      // Load Publications
      const { data: pubs } = await supabase
        .from('publicacoes')
        .select('*')
        .eq('user_id', session.user.id);
      
      setPublications(pubs as Publication[] || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    views: publications.reduce((acc, curr) => acc + (curr.views || 0), 0),
    downloads: publications.reduce((acc, curr) => acc + (curr.downloads || 0), 0),
    total: publications.length,
    pending: publications.filter(p => !p.approved).length
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Visão Geral</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Publicações</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Visualizações</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.views}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Downloads</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.downloads}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Download className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.pending}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Simplified "Recent Activity" or Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p>Gráficos de desempenho serão exibidos aqui</p>
          <span className="text-xs">(Integração futura com Recharts)</span>
        </div>
      </div>
    </div>
  );

  const renderPublications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Publicações</h2>
        <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 flex items-center gap-2 text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Publicação
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Título</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {publications.map((pub) => (
              <tr key={pub.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <p className="font-medium text-gray-900 truncate max-w-xs">{pub.title}</p>
                  <p className="text-xs text-gray-500">{pub.scientific_area}</p>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(pub.data_publicacao || pub.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {pub.approved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Aprovado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                      <Clock className="w-3 h-3" /> Em análise
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {publications.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Você ainda não tem publicações.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-850 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Menu</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Meu Painel</span>
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'publications' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Minhas Publicações</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Meu Perfil</span>
            </button>
          </nav>
        </div>
        
        <div className="p-6 mt-auto border-t border-zinc-800">
           {loading ? <Skeleton className="h-10 w-full bg-zinc-800" /> : (
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold">
                 {userProfile?.full_name?.charAt(0) || 'U'}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-medium text-white truncate">{userProfile?.full_name || 'Usuário'}</p>
                 <p className="text-xs text-gray-500 truncate">{userProfile?.institution || 'Pesquisador'}</p>
               </div>
             </div>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
             <Skeleton className="h-8 w-1/3" />
             <div className="grid grid-cols-4 gap-4">
               <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
             </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'publications' && renderPublications()}
            {activeTab === 'profile' && (
              <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm max-w-2xl">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Perfil</h2>
                 <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                      <input type="text" defaultValue={userProfile?.full_name} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Instituição</label>
                      <input type="text" defaultValue={userProfile?.institution} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <button type="button" className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600">Salvar Alterações</button>
                 </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};