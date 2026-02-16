import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Plus, 
  Eye, 
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
  MessageSquare,
  UploadCloud,
  Edit3,
  ChevronRight,
  School
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import { Publication, Profile } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { useNavigate, Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'publications' | 'profile' | 'admin_review'>('overview');
  const [publications, setPublications] = useState<Publication[]>([]);
  const [pendingPublications, setPendingPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [profileData, setProfileData] = useState<Partial<Profile>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [editingPub, setEditingPub] = useState<Partial<Publication> | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
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
      const meta = session.user.user_metadata || {};
      const userEmail = session.user.email;
      const userIsAdmin = userEmail === 'isaac.admin@padc.site' || meta.user_type === 'admin';
      
      setIsAdmin(userIsAdmin);
      setProfileData({
          full_name: meta.full_name || 'Pesquisador Angolano',
          institution: meta.institution || 'Não informada',
          academic_role: meta.academic_role || 'estudante',
          user_type: userIsAdmin ? 'admin' : 'researcher'
      });

      await refreshData(session.user.id, userIsAdmin);
      
    } catch (e: any) {
      console.error("Dashboard Error:", e);
      addToast({ title: 'Erro de Dados', description: 'Falha ao sincronizar as suas obras.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async (userId: string, userIsAdmin: boolean) => {
    // Busca as publicações do autor logado
    const { data: pubs, error: pubsErr } = await supabase
      .from('publicacoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (pubsErr) console.error("Error loading user pubs:", pubsErr);
    setPublications(pubs as Publication[] || []);

    // Se admin, busca fila de moderação
    if (userIsAdmin) {
      const { data: pending, error: pendErr } = await supabase
        .from('publicacoes')
        .select(`
          *,
          profiles:user_id (
            full_name,
            institution
          )
        `)
        .eq('approved', false)
        .is('rejection_reason', null)
        .order('created_at', { ascending: true });
      
      if (pendErr) {
        // Fallback se o join falhar
        const { data: fallbackPending } = await supabase
          .from('publicacoes')
          .select('*')
          .eq('approved', false)
          .is('rejection_reason', null);
        setPendingPublications(fallbackPending as Publication[] || []);
      } else {
        setPendingPublications(pending as Publication[] || []);
      }
    }
  };

  const handleApprove = async (pubId: string) => {
    try {
      // Limpa rejection_reason e define approved: true de forma atómica
      const { error } = await supabase
        .from('publicacoes')
        .update({ approved: true, rejection_reason: null })
        .eq('id', pubId);

      if (error) throw error;
      
      // Recarrega todos os dados para garantir que o estado local mude
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await refreshData(session.user.id, isAdmin);
      
      addToast({ title: 'Obra Publicada!', description: 'O autor e o público já podem ver a pesquisa.', type: 'success' });
    } catch (error: any) {
      addToast({ title: 'Falha na Aprovação', description: error.message, type: 'error' });
    }
  };

  const handleUpdatePub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPub) return;

    try {
      const { error } = await supabase
        .from('publicacoes')
        .update({
          title: editingPub.title,
          abstract: editingPub.abstract,
          scientific_area: editingPub.scientific_area,
          rejection_reason: null,
          approved: false 
        })
        .eq('id', editingPub.id);

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      if (session) await refreshData(session.user.id, isAdmin);
      
      setIsEditModalOpen(false);
      addToast({ title: 'Ajustes Gravados', description: 'A obra será reavaliada pelo administrador.', type: 'success' });
    } catch (error: any) {
      addToast({ title: 'Erro ao Gravar', description: error.message, type: 'error' });
    }
  };

  const handleDeletePub = async (id: string) => {
    if (!confirm("Confirmar a eliminação definitiva desta obra?")) return;

    try {
      const { error } = await supabase.from('publicacoes').delete().eq('id', id);
      if (error) throw error;

      setPublications(publications.filter(p => p.id !== id));
      addToast({ title: 'Removido', type: 'info' });
    } catch (error: any) {
      addToast({ title: 'Erro ao Eliminar', description: error.message, type: 'error' });
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPub || !rejectionReason.trim()) return;

    try {
      const { error } = await supabase
        .from('publicacoes')
        .update({ 
          approved: false, 
          rejection_reason: rejectionReason 
        })
        .eq('id', selectedPub.id);

      if (error) throw error;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await refreshData(session.user.id, isAdmin);
      
      setIsReviewModalOpen(false);
      setSelectedPub(null);
      setRejectionReason('');
      addToast({ title: 'Pedido de Correção Enviado', type: 'info' });
    } catch (error: any) {
      addToast({ title: 'Erro na Operação', description: error.message, type: 'error' });
    }
  };

  const handleSubmitPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPub.file) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const fileName = `${session?.user.id}/${Date.now()}_${newPub.file.name.replace(/\s+/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage.from('publications').upload(fileName, newPub.file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('publications').getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('publicacoes')
        .insert({
          user_id: session?.user.id,
          title: newPub.title,
          scientific_area: newPub.scientific_area,
          abstract: newPub.abstract,
          keywords: newPub.keywords.split(',').map(k => k.trim()),
          file_url: publicUrl,
          approved: false,
          rejection_reason: null
        });

      if (insertError) throw insertError;

      if (session) await refreshData(session.user.id, isAdmin);
      setIsModalOpen(false);
      setNewPub({ title: '', scientific_area: 'Ciências Sociais', abstract: '', keywords: '', file: null });
      addToast({ title: 'Depósito Realizado', type: 'success' });
      setActiveTab('publications');
    } catch (error: any) {
      addToast({ title: 'Falha no Depósito', description: error.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-zinc-850 text-white flex-shrink-0 shadow-2xl relative z-10">
        <div className="p-8">
           <div className="mb-12 text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white font-black text-2xl shadow-xl">P</div>
              <h3 className="font-black text-lg truncate px-2">{profileData.full_name}</h3>
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mt-2">{isAdmin ? 'ADMINISTRADOR' : 'INVESTIGADOR'}</p>
              <div className="mt-4 flex items-center justify-center gap-1 text-[9px] font-bold text-gray-500 uppercase bg-zinc-800/50 py-1.5 rounded-lg px-2">
                <School className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{profileData.institution}</span>
              </div>
           </div>
          <nav className="space-y-4">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-emerald-600 shadow-xl' : 'hover:bg-zinc-800 text-gray-400 font-bold'}`}>
              <LayoutDashboard className="w-5 h-5" /> Painel Geral
            </button>
            <button onClick={() => setActiveTab('publications')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'publications' ? 'bg-emerald-600 shadow-xl' : 'hover:bg-zinc-800 text-gray-400 font-bold'}`}>
              <FileText className="w-5 h-5" /> Minhas Obras
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin_review')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'admin_review' ? 'bg-red-600 shadow-xl text-white' : 'hover:bg-red-900/10 text-red-400 font-black border border-red-900/20'}`}>
                <ShieldCheck className="w-5 h-5" /> Moderação PADC
              </button>
            )}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
        {loading ? <Skeleton className="h-96 w-full rounded-[3rem]" /> : (
          <>
            {activeTab === 'overview' && (
               <div className="space-y-12 animate-in fade-in duration-700">
                  <header>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Gestão Científica</h1>
                    <p className="text-gray-500 font-medium mt-2">Área de controlo institucional e depósito.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Obras Depositadas</p>
                      <h3 className="text-6xl font-black text-emerald-600 mt-5">{publications.length}</h3>
                    </div>
                    {isAdmin && (
                      <div className="bg-red-600 p-12 rounded-[3rem] shadow-2xl text-white flex flex-col items-center group cursor-pointer hover:scale-[1.02] transition-transform" onClick={() => setActiveTab('admin_review')}>
                        <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">Aguardando Avaliação</p>
                        <h3 className="text-6xl font-black mt-5">{pendingPublications.length}</h3>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black bg-white/20 px-4 py-2 rounded-full uppercase">
                           Aceder Fila <ShieldCheck className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            )}

            {activeTab === 'admin_review' && isAdmin && (
               <div className="space-y-10">
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Fila de Revisão</h2>
                  <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50/50 border-b">
                        <tr>
                          <th className="p-10 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Obra / Investigador</th>
                          <th className="p-10 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingPublications.map((pub) => (
                          <tr key={pub.id} className="hover:bg-gray-50/30">
                            <td className="p-10">
                              <p className="font-black text-gray-900 text-xl leading-tight mb-2">{pub.title}</p>
                              <div className="flex gap-4">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                   {pub.profiles?.full_name || 'Autor Registado'}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                   {pub.profiles?.institution || 'Afiliação Académica'}
                                </span>
                              </div>
                            </td>
                            <td className="p-10 text-right">
                              <div className="flex justify-end gap-3">
                                <a href={pub.file_url} target="_blank" rel="noreferrer" className="p-4 text-emerald-600 bg-emerald-50 rounded-2xl hover:bg-emerald-100"><Eye className="w-6 h-6" /></a>
                                <button onClick={() => handleApprove(pub.id)} className="p-4 text-white bg-emerald-500 rounded-2xl hover:bg-emerald-600 shadow-xl"><CheckCircle2 className="w-6 h-6" /></button>
                                <button onClick={() => { setSelectedPub(pub); setIsReviewModalOpen(true); }} className="p-4 text-white bg-red-500 rounded-2xl hover:bg-red-600 shadow-xl"><XCircle className="w-6 h-6" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            )}

            {activeTab === 'publications' && (
              <div className="space-y-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">A Minha Estante Científica</h2>
                  <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] shadow-2xl font-black flex items-center gap-3">
                    <Plus className="w-6 h-6" /> NOVO DEPÓSITO
                  </button>
                </div>
                <div className="grid gap-8">
                  {publications.map((pub) => (
                    <div key={pub.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center group">
                      <div className="flex-1">
                        <h3 className="font-black text-gray-900 text-2xl leading-tight mb-4 group-hover:text-emerald-600 transition-colors">{pub.title}</h3>
                        <div className="flex flex-wrap items-center gap-4">
                          {pub.approved ? (
                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase border border-emerald-200">PUBLICADO</span>
                          ) : pub.rejection_reason ? (
                            <span className="px-4 py-1.5 bg-red-100 text-red-700 text-[10px] font-black rounded-full uppercase border border-red-200">AJUSTE PENDENTE</span>
                          ) : (
                            <span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase border border-amber-200 flex items-center gap-2">
                               <Clock className="w-3 h-3" /> EM REVISÃO
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 font-black uppercase">{new Date(pub.created_at).toLocaleDateString()}</span>
                        </div>
                        {pub.rejection_reason && (
                          <div className="mt-8 p-8 bg-red-50 border border-red-100 rounded-[2rem] flex gap-5">
                            <MessageSquare className="w-6 h-6 text-red-500 shrink-0" />
                            <div className="text-red-700">
                               <p className="font-black text-sm uppercase">Nota do Revisor:</p>
                               <p className="text-base mt-2 italic">"{pub.rejection_reason}"</p>
                               <p className="text-[10px] font-black mt-4 uppercase">Use o botão editar (lápis) para corrigir.</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Link to={`/publicacao/${pub.id}`} className="p-4 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl"><Eye className="w-7 h-7" /></Link>
                        <button onClick={() => { setEditingPub(pub); setIsEditModalOpen(true); }} className="p-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl"><Edit3 className="w-7 h-7" /></button>
                        <button onClick={() => handleDeletePub(pub.id)} className="p-4 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl"><Trash2 className="w-7 h-7" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Editar */}
      {isEditModalOpen && editingPub && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3.5rem] w-full max-w-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-black mb-10 uppercase tracking-tighter">Editar e Reenviar</h3>
            <form onSubmit={handleUpdatePub} className="space-y-6">
              <input type="text" value={editingPub.title} onChange={e => setEditingPub({...editingPub, title: e.target.value})} className="w-full p-5 border border-gray-100 rounded-2xl font-bold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500" />
              <textarea value={editingPub.abstract} onChange={e => setEditingPub({...editingPub, abstract: e.target.value})} rows={6} className="w-full p-5 border border-gray-100 rounded-2xl font-medium text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500" />
              <div className="flex gap-6 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-5 font-black text-gray-400 uppercase tracking-widest">Cancelar</button>
                <button type="submit" className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest">Gravar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Submissão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-black mb-10 uppercase tracking-tighter">Novo Depósito Científico</h3>
            <form onSubmit={handleSubmitPublication} className="space-y-6">
              <input type="text" required placeholder="Título da Obra" onChange={e => setNewPub({...newPub, title: e.target.value})} className="w-full p-5 border border-gray-100 rounded-2xl font-bold text-gray-900 bg-white" />
              <textarea required placeholder="Resumo Académico" rows={4} onChange={e => setNewPub({...newPub, abstract: e.target.value})} className="w-full p-5 border border-gray-100 rounded-2xl font-medium text-gray-900 bg-white" />
              <input type="file" accept=".pdf" required onChange={e => setNewPub({...newPub, file: e.target.files?.[0] || null})} className="w-full p-5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-900 bg-white" />
              <div className="flex gap-6 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black text-gray-400">Voltar</button>
                <button type="submit" disabled={uploading} className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl">
                   {uploading ? 'A enviar...' : 'Depositar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rejeição Admin */}
      {isReviewModalOpen && selectedPub && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-12 shadow-2xl relative">
            <h3 className="text-2xl font-black mb-4 text-red-600 uppercase tracking-tighter">Solicitar Correção</h3>
            <form onSubmit={handleReject} className="space-y-6">
              <textarea placeholder="Explique os ajustes necessários para aprovação..." required rows={6} className="w-full p-6 border-2 border-red-50 rounded-[2rem] text-gray-900 bg-white" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
              <div className="flex gap-6">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-5 font-black text-gray-400 uppercase tracking-widest">Sair</button>
                <button type="submit" className="flex-1 py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl uppercase tracking-widest">Enviar Nota</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};