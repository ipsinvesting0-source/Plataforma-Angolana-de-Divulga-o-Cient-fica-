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
  Clock,
  Save,
  MapPin,
  Calendar,
  Building2,
  GraduationCap,
  X,
  UploadCloud,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { Publication, Profile } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { useNavigate, Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'publications' | 'profile'>('overview');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Profile State
  const [profileData, setProfileData] = useState<Partial<Profile>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  
  // New Publication Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPub, setNewPub] = useState({
    title: '',
    scientific_area: 'Ciências Sociais',
    abstract: '',
    keywords: '',
    file: null as File | null
  });

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
      setErrorMsg(null);
      const meta = session.user.user_metadata || {};
      setProfileData({
          full_name: meta.full_name || '',
          institution: meta.institution || '',
          birth_date: meta.birth_date || '',
          address: meta.address || '',
          academic_role: meta.academic_role || 'estudante'
      });

      const { data: pubs, error: pubsError } = await supabase
        .from('publicacoes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (pubsError) {
        throw pubsError;
      }
      
      setPublications(pubs as Publication[] || []);
      
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Erro ao carregar dados: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Profile Logic ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: profileData.full_name,
                institution: profileData.institution,
                birth_date: profileData.birth_date,
                address: profileData.address,
                academic_role: profileData.academic_role,
            }
        });

        if (error) throw error;
        addToast({ title: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (error: any) {
        console.error('Error saving profile:', error);
        addToast({ title: 'Erro ao atualizar', description: error.message, type: 'error' });
    } finally {
        setSavingProfile(false);
    }
  };

  // --- Publication Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        addToast({ title: 'Formato inválido', description: 'Por favor, envie apenas arquivos PDF.', type: 'error' });
        return;
      }
      setNewPub({ ...newPub, file: file });
    }
  };

  const handleSubmitPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPub.file) {
      addToast({ title: 'Arquivo obrigatório', description: 'Adicione o PDF da publicação.', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada');

      const BUCKET_NAME = 'publications';

      // 1. Prepare File Name
      const fileExt = newPub.file.name.split('.').pop();
      const sanitizedBaseName = newPub.file.name
          .replace(/\.[^/.]+$/, "")
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]/g, '_');
      
      const fileName = `${session.user.id}/${Date.now()}_${sanitizedBaseName}.${fileExt}`;
      
      // 2. Upload File
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, newPub.file);

      if (uploadError) {
          console.error("Supabase Upload Error:", uploadError);
          if (uploadError.message.includes('not found') || (uploadError as any).statusCode === '404') {
              throw new Error(`O bucket '${BUCKET_NAME}' não foi encontrado. Verifique se ele foi criado corretamente no Supabase.`);
          }
          if (uploadError.message.includes('row-level security') || (uploadError as any).statusCode === '403') {
              throw new Error(`Erro de Permissão (RLS). Vá no painel do Supabase > Storage > Policies e adicione uma política 'INSERT' para usuários autenticados no bucket '${BUCKET_NAME}'.`);
          }
          throw uploadError;
      }

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      // 4. Insert Record
      const { data: insertedPub, error: insertError } = await supabase
        .from('publicacoes')
        .insert({
          user_id: session.user.id,
          title: newPub.title,
          scientific_area: newPub.scientific_area,
          abstract: newPub.abstract,
          keywords: newPub.keywords.split(',').map(k => k.trim()),
          file_url: publicUrl,
          approved: true, 
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Success
      setPublications([insertedPub as Publication, ...publications]);
      setIsModalOpen(false);
      setNewPub({
        title: '',
        scientific_area: 'Ciências Sociais',
        abstract: '',
        keywords: '',
        file: null
      });
      addToast({ title: 'Sucesso!', description: 'Publicação enviada e aprovada automaticamente.', type: 'success' });
      setActiveTab('publications');

    } catch (error: any) {
      console.error('Error uploading:', error);
      addToast({ title: 'Erro no Envio', description: error.message || 'Verifique sua conexão.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePublication = async (id: string) => {
    if(!window.confirm("Tem certeza que deseja excluir esta publicação?")) return;
    
    try {
        const { error } = await supabase.from('publicacoes').delete().eq('id', id);
        if (error) throw error;
        setPublications(publications.filter(p => p.id !== id));
        addToast({ title: 'Publicação excluída', type: 'info' });
    } catch (error: any) {
        addToast({ title: 'Erro', description: error.message, type: 'error' });
    }
  };

  // --- Renders ---

  const stats = {
    views: publications.reduce((acc, curr) => acc + (curr.views || 0), 0),
    downloads: publications.reduce((acc, curr) => acc + (curr.downloads || 0), 0),
    total: publications.length,
    pending: publications.filter(p => !p.approved).length
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
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
    </div>
  );

  const renderPublications = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Minhas Publicações</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
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
                  <Link to={`/publicacao/${pub.id}`} className="font-medium text-gray-900 truncate max-w-xs hover:text-emerald-600 hover:underline block">
                    {pub.title}
                  </Link>
                  <p className="text-xs text-gray-500">{pub.scientific_area}</p>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {new Date(pub.created_at).toLocaleDateString()}
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
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/publicacao/${pub.id}`} className="text-gray-400 hover:text-emerald-500 transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDeletePublication(pub.id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {publications.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Você ainda não tem publicações. Clique em "Nova Publicação" para começar.
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
      {/* Sidebar - Usando gray-900 para garantir visibilidade caso zinc-850 não funcione */}
      <aside className="w-full md:w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Menu</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Meu Painel</span>
            </button>
            <button
              onClick={() => setActiveTab('publications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'publications' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Minhas Publicações</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Meu Perfil</span>
            </button>
          </nav>
        </div>
        
        <div className="p-6 mt-auto border-t border-gray-800">
           {loading ? <Skeleton className="h-10 w-full bg-gray-800" /> : (
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white uppercase">
                 {profileData?.full_name?.charAt(0) || 'U'}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-medium text-white truncate">{profileData?.full_name || 'Usuário'}</p>
                 <p className="text-xs text-gray-500 truncate">{profileData?.institution || 'Pesquisador'}</p>
               </div>
             </div>
           )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {errorMsg ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                    <h3 className="font-bold">Erro ao carregar painel</h3>
                    <p>{errorMsg}</p>
                    <p className="text-sm mt-2 text-red-600">Verifique se a tabela 'publicacoes' foi criada corretamente no Supabase.</p>
                </div>
            </div>
        ) : loading ? (
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
              <div className="max-w-3xl animate-in fade-in duration-500">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Configurações do Perfil</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full uppercase font-bold text-xs">
                        {profileData.academic_role || 'USUÁRIO'}
                    </span>
                 </div>
                 
                 <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                     <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <User className="w-4 h-4 text-emerald-500" /> Nome Completo
                                </label>
                                <input 
                                    type="text" 
                                    value={profileData.full_name || ''} 
                                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-500" /> Data de Nascimento
                                </label>
                                <input 
                                    type="date" 
                                    value={profileData.birth_date || ''} 
                                    onChange={(e) => setProfileData({...profileData, birth_date: e.target.value})}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                />
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-emerald-500" /> Função
                                </label>
                                <select 
                                    value={profileData.academic_role || 'estudante'} 
                                    onChange={(e) => setProfileData({...profileData, academic_role: e.target.value as any})}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white" 
                                >
                                    <option value="estudante">Estudante</option>
                                    <option value="professor">Professor</option>
                                    <option value="investigador">Investigador</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-emerald-500" /> Instituição
                                </label>
                                <input 
                                    type="text" 
                                    value={profileData.institution || ''} 
                                    onChange={(e) => setProfileData({...profileData, institution: e.target.value})}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-500" /> Endereço / Localização
                                </label>
                                <input 
                                    type="text" 
                                    value={profileData.address || ''} 
                                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                                    placeholder="Cidade, Província"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button 
                                type="submit" 
                                disabled={savingProfile}
                                className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-600 flex items-center gap-2 font-medium disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                     </form>
                 </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* New Publication Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-900">Nova Publicação</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmitPublication} className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                            <p className="font-semibold mb-1">Atenção ao PDF</p>
                            <p>Certifique-se de que seu arquivo PDF não esteja protegido por senha e tenha menos de 50MB.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título da Obra</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Ex: Análise Sociológica do..."
                            value={newPub.title}
                            onChange={e => setNewPub({...newPub, title: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Área Científica</label>
                            <select 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                value={newPub.scientific_area}
                                onChange={e => setNewPub({...newPub, scientific_area: e.target.value})}
                            >
                                <option>Ciências Sociais</option>
                                <option>Engenharia</option>
                                <option>Saúde</option>
                                <option>Educação</option>
                                <option>Tecnologia</option>
                                <option>Direito</option>
                                <option>Economia</option>
                                <option>Outra</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave</label>
                            <input 
                                type="text" 
                                required 
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Separe por vírgulas"
                                value={newPub.keywords}
                                onChange={e => setNewPub({...newPub, keywords: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resumo / Abstract</label>
                        <textarea 
                            required 
                            rows={5}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                            placeholder="Descreva brevemente sua pesquisa..."
                            value={newPub.abstract}
                            onChange={e => setNewPub({...newPub, abstract: e.target.value})}
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo PDF</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                            <input 
                                type="file" 
                                accept="application/pdf"
                                required
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                            {newPub.file ? (
                                <p className="text-emerald-600 font-medium">{newPub.file.name}</p>
                            ) : (
                                <p className="text-gray-500 text-sm">Clique ou arraste o arquivo PDF aqui</p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            disabled={uploading}
                            className="flex-1 py-3 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {uploading ? 'Enviando...' : 'Publicar Pesquisa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};