
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
  ShieldCheck,
  XCircle,
  MessageSquare,
  // Added missing UploadCloud icon
  UploadCloud
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
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
      
      // Identificar Admin por email ou metadados
      const userIsAdmin = userEmail === 'isaac.admin@padc.site' || meta.user_type === 'admin';
      
      setIsAdmin(userIsAdmin);
      setProfileData({
          full_name: meta.full_name || 'Usuário PADC',
          institution: meta.institution || 'Não informada',
          academic_role: meta.academic_role || 'estudante',
          user_type: userIsAdmin ? 'admin' : 'researcher'
      });

      // Publicações do próprio usuário
      const { data: pubs, error: pubsError } = await supabase
        .from('publicacoes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (pubsError) throw pubsError;
      setPublications(pubs as Publication[] || []);

      // Se for admin, carrega fila de espera
      if (userIsAdmin) {
        const { data: pending, error: pendingError } = await supabase
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
        
        if (pendingError) throw pendingError;
        setPendingPublications(pending as Publication[] || []);
      }
      
    } catch (e: any) {
      addToast({ title: 'Erro de Dados', description: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (pubId: string) => {
    try {
      const { error } = await supabase
        .from('publicacoes')
        .update({ approved: true, rejection_reason: null })
        .eq('id', pubId);

      if (error) throw error;
      
      setPendingPublications(pendingPublications.filter(p => p.id !== pubId));
      addToast({ title: 'Publicação Aprovada!', type: 'success' });
    } catch (error: any) {
      addToast({ title: 'Erro na Aprovação', description: error.message, type: 'error' });
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
      
      setPendingPublications(pendingPublications.filter(p => p.id !== selectedPub.id));
      setIsReviewModalOpen(false);
      setSelectedPub(null);
      setRejectionReason('');
      addToast({ title: 'Publicação Devolvida', description: 'Autor notificado das correções.', type: 'info' });
    } catch (error: any) {
      addToast({ title: 'Erro na Rejeição', description: error.message, type: 'error' });
    }
  };

  const handleSubmitPublication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPub.file) {
      addToast({ title: 'PDF obrigatório', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada');

      const fileName = `${session.user.id}/${Date.now()}_${newPub.file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const { error: uploadError } = await supabase.storage
        .from('publications')
        .upload(fileName, newPub.file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('publications')
        .getPublicUrl(fileName);

      const { data: insertedPub, error: insertError } = await supabase
        .from('publicacoes')
        .insert({
          user_id: session.user.id,
          title: newPub.title,
          scientific_area: newPub.scientific_area,
          abstract: newPub.abstract,
          keywords: newPub.keywords.split(',').map(k => k.trim()),
          file_url: publicUrl,
          approved: false, // Toda pesquisa começa pendente
          rejection_reason: null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setPublications([insertedPub as Publication, ...publications]);
      setIsModalOpen(false);
      setNewPub({ title: '', scientific_area: 'Ciências Sociais', abstract: '', keywords: '', file: null });
      addToast({ title: 'Enviado para o Administrador', type: 'info' });
      setActiveTab('publications');

    } catch (error: any) {
      addToast({ title: 'Erro no envio', description: error.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
      <aside className="w-full md:w-72 bg-zinc-850 text-white flex-shrink-0 shadow-2xl">
        <div className="p-8">
           <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-2xl">P</div>
              <h3 className="font-black truncate">{profileData.full_name}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{isAdmin ? 'Administrador' : 'Pesquisador'}</p>
           </div>
          <nav className="space-y-3">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'overview' ? 'bg-emerald-600 shadow-xl' : 'hover:bg-zinc-800 text-gray-400'}`}>
              <LayoutDashboard className="w-5 h-5" /> Painel
            </button>
            <button onClick={() => setActiveTab('publications')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'publications' ? 'bg-emerald-600 shadow-xl' : 'hover:bg-zinc-800 text-gray-400'}`}>
              <FileText className="w-5 h-5" /> Minhas Obras
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin_review')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'admin_review' ? 'bg-red-600 shadow-xl' : 'hover:bg-red-900/20 text-red-400 font-black border border-red-900/30'}`}>
                <ShieldCheck className="w-5 h-5" /> Moderação
              </button>
            )}
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === 'profile' ? 'bg-emerald-600 shadow-xl' : 'hover:bg-zinc-800 text-gray-400'}`}>
              <User className="w-5 h-5" /> Perfil
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {loading ? <Skeleton className="h-64 w-full rounded-[2.5rem]" /> : (
          <>
            {activeTab === 'overview' && (
               <div className="space-y-10 animate-in fade-in duration-700">
                  <header>
                    <h1 className="text-4xl font-black text-gray-900">Bem-vindo, {profileData.full_name?.split(' ')[0]}</h1>
                    <p className="text-gray-500 font-medium mt-2">Acompanhe o estado das suas publicações científicas.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center">
                      <p className="text-sm font-black text-gray-400 uppercase tracking-tighter">Obras Totais</p>
                      <h3 className="text-6xl font-black text-emerald-600 mt-4">{publications.length}</h3>
                    </div>
                    {isAdmin && (
                      <div className="bg-red-600 p-10 rounded-[2rem] shadow-2xl text-white flex flex-col items-center">
                        <p className="text-sm font-black opacity-80 uppercase tracking-widest">Aguardando Revisão</p>
                        <h3 className="text-6xl font-black mt-4">{pendingPublications.length}</h3>
                      </div>
                    )}
                  </div>
               </div>
            )}

            {activeTab === 'admin_review' && isAdmin && (
               <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                  <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 uppercase">
                    Portal de Moderação
                  </h2>
                  <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="p-8 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Pesquisa / Autor</th>
                          <th className="p-8 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Revisão</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingPublications.map((pub) => (
                          <tr key={pub.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-8">
                              <p className="font-black text-gray-900 text-xl leading-tight">{pub.title}</p>
                              <p className="text-sm font-bold text-emerald-600 mt-2">{pub.profiles?.full_name} • {pub.profiles?.institution}</p>
                            </td>
                            <td className="p-8">
                              <div className="flex items-center justify-end gap-3">
                                <a href={pub.file_url} target="_blank" rel="noreferrer" className="p-4 text-emerald-600 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-all">
                                  <Eye className="w-6 h-6" />
                                </a>
                                <button onClick={() => handleApprove(pub.id)} className="p-4 text-white bg-emerald-500 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all active:scale-95">
                                  <CheckCircle2 className="w-6 h-6" />
                                </button>
                                <button onClick={() => { setSelectedPub(pub); setIsReviewModalOpen(true); }} className="p-4 text-white bg-red-500 rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100 transition-all active:scale-95">
                                  <XCircle className="w-6 h-6" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {pendingPublications.length === 0 && (
                          <tr><td colSpan={2} className="p-24 text-center text-gray-400 font-black uppercase tracking-widest">Fila de espera vazia.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            )}

            {activeTab === 'publications' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black text-gray-900 uppercase">Minhas Pesquisas</h2>
                  <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] hover:bg-emerald-700 shadow-xl shadow-emerald-100 flex items-center gap-3 font-black transition-all active:scale-95">
                    <Plus className="w-6 h-6" /> Nova Submissão
                  </button>
                </div>
                <div className="grid gap-6">
                  {publications.map((pub) => (
                    <div key={pub.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex-1">
                        <h3 className="font-black text-gray-900 text-2xl leading-tight">{pub.title}</h3>
                        <div className="flex items-center gap-4 mt-3">
                           {pub.approved ? (
                             <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full">PUBLICADO</span>
                           ) : pub.rejection_reason ? (
                             <span className="px-4 py-1.5 bg-red-100 text-red-700 text-xs font-black rounded-full">SOLICITADO CORREÇÃO</span>
                           ) : (
                             <span className="px-4 py-1.5 bg-amber-100 text-amber-700 text-xs font-black rounded-full flex items-center gap-2">
                               <Clock className="w-3 h-3" /> AGUARDANDO APROVAÇÃO
                             </span>
                           )}
                           <span className="text-xs text-gray-400 font-bold">{new Date(pub.created_at).toLocaleDateString()}</span>
                        </div>
                        {pub.rejection_reason && (
                          <div className="mt-6 p-6 bg-red-50 border border-red-100 rounded-[1.5rem] flex gap-4">
                            <MessageSquare className="w-6 h-6 text-red-500 shrink-0" />
                            <div>
                               <p className="font-black text-red-900 text-sm">Correções Solicitadas:</p>
                               <p className="text-red-700 text-sm mt-1">{pub.rejection_reason}</p>
                               <p className="mt-4 text-xs font-black text-red-400 uppercase tracking-widest">Reenvie o PDF após as alterações.</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                         <Link to={`/publicacao/${pub.id}`} className="p-4 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"><Eye className="w-7 h-7" /></Link>
                         <button onClick={async () => {
                           if(confirm("Deseja mesmo remover esta obra do sistema?")) {
                             await supabase.from('publicacoes').delete().eq('id', pub.id);
                             setPublications(publications.filter(p => p.id !== pub.id));
                           }
                         }} className="p-4 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><Trash2 className="w-7 h-7" /></button>
                      </div>
                    </div>
                  ))}
                  {publications.length === 0 && (
                    <div className="p-20 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem]">
                       <p className="text-gray-400 font-black uppercase tracking-tighter">Nenhuma obra enviada ainda.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal: Submissão */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black mb-10 uppercase tracking-tight">Nova Pesquisa</h3>
            <form onSubmit={handleSubmitPublication} className="space-y-6">
              <input type="text" placeholder="Título da Obra" required className="w-full p-5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 outline-none text-lg font-bold" value={newPub.title} onChange={e => setNewPub({...newPub, title: e.target.value})} />
              <textarea placeholder="Resumo Científico / Abstract" required rows={6} className="w-full p-5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium" value={newPub.abstract} onChange={e => setNewPub({...newPub, abstract: e.target.value})} />
              <div className="border-4 border-dashed border-gray-100 p-12 text-center rounded-[2rem] hover:border-emerald-500 transition-all group bg-gray-50/50">
                <input type="file" accept=".pdf" required onChange={e => setNewPub({...newPub, file: e.target.files?.[0] || null})} className="w-full cursor-pointer opacity-0 absolute h-24" />
                <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-4 group-hover:text-emerald-500 transition-colors" />
                <p className="text-sm text-gray-500 font-black uppercase tracking-widest">{newPub.file ? newPub.file.name : 'Selecionar Documento PDF'}</p>
              </div>
              <div className="flex gap-6 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 font-black text-gray-400 hover:text-gray-600">Cancelar</button>
                <button type="submit" disabled={uploading} className="flex-1 py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 active:scale-95 disabled:opacity-50">
                  {uploading ? 'Aguarde...' : 'Submeter Pesquisa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Feedback de Rejeição */}
      {isReviewModalOpen && selectedPub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-12 shadow-2xl">
            <h3 className="text-2xl font-black mb-4 text-red-600 uppercase tracking-tighter">Solicitar Correção</h3>
            <p className="text-sm text-gray-400 mb-8 font-bold">Obra: {selectedPub.title}</p>
            <form onSubmit={handleReject} className="space-y-6">
              <textarea placeholder="Explique os motivos e o que o autor deve alterar no PDF..." required rows={7} className="w-full p-6 border-4 border-red-50 rounded-[2rem] focus:border-red-500 outline-none transition-all font-medium" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
              <div className="flex gap-6">
                <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-5 font-black text-gray-400">Voltar</button>
                <button type="submit" className="flex-1 py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-100 active:scale-95">Notificar Pesquisador</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
