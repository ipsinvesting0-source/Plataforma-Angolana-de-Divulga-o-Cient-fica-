import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Mail, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

interface LoginProps {
  isAdminRoute?: boolean;
}

export const Login: React.FC<LoginProps> = ({ isAdminRoute = false }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [academicRole, setAcademicRole] = useState('estudante');

  useEffect(() => {
    if (isAdminRoute) {
      setEmail('isaac.admin@padc.site');
      setPassword('padc.site');
      setIsSignUp(false);
    }
  }, [isAdminRoute]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp && !isAdminRoute) {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              institution: institution,
              birth_date: birthDate,
              academic_role: academicRole,
              user_type: 'researcher'
            }
          }
        });
        if (authError) throw authError;
        setRegistrationSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (email === 'isaac.admin@padc.site') {
           await supabase.auth.updateUser({
             data: { user_type: 'admin', full_name: 'Isaac Pimpão (Admin)' }
           });
        }

        addToast({ title: 'Acesso autorizado', type: 'success' });
        navigate('/dashboard');
      }
    } catch (error: any) {
      addToast({ title: 'Erro na autenticação', description: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-xl text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifique seu Email</h2>
          <p className="text-gray-600 mb-8">Enviamos um link para ativar sua conta científica.</p>
          <button onClick={() => { setRegistrationSuccess(false); setIsSignUp(false); }} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold">Voltar para o Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-lg bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
           {isAdminRoute ? (
             <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-6 shadow-lg shadow-red-200">
                <ShieldCheck className="w-10 h-10" />
             </div>
           ) : (
             <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 font-black text-2xl mx-auto mb-6 shadow-lg shadow-emerald-100">P</div>
           )}
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">
             {isAdminRoute ? 'Gestão PADC' : isSignUp ? 'Criar Conta' : 'Entrar na Plataforma'}
           </h1>
           <p className="text-gray-500 mt-2 font-medium">
             {isAdminRoute ? 'Área Restrita Admin' : isSignUp ? 'Inicie sua jornada científica.' : 'Acesse seu painel.'}
           </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && !isAdminRoute && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <input type="text" required placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white" />
              <input type="text" required placeholder="Instituição Acadêmica" value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 bg-white" />
                <select value={academicRole} onChange={(e) => setAcademicRole(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium text-gray-900">
                  <option value="estudante">Estudante</option>
                  <option value="professor">Professor</option>
                  <option value="investigador">Investigador</option>
                </select>
              </div>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-[18px] w-5 h-5 text-gray-400" />
            <input 
              type="email" 
              required
              readOnly={isAdminRoute}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 pl-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900 bg-white"
              placeholder="E-mail"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-[18px] w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pl-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-gray-900 bg-white"
              placeholder="Palavra-passe"
              style={{ color: '#111827', backgroundColor: '#ffffff' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-6 ${isAdminRoute ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
          >
            {loading ? 'A processar...' : (isAdminRoute ? 'Aceder Painel Admin' : isSignUp ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        {!isAdminRoute && (
          <div className="mt-10 text-center">
            <p className="text-gray-500 font-medium">
              {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}
              <button onClick={() => setIsSignUp(!isSignUp)} className="ml-2 text-emerald-600 font-black hover:underline">
                {isSignUp ? 'Fazer Login' : 'Registar Agora'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};