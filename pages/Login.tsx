import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Estados do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Novos campos de perfil
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [academicRole, setAcademicRole] = useState('estudante');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- FLUXO DE CADASTRO ---
        
        // Salvamos TUDO nos metadados (options.data). 
        // Isso garante que os dados existam mesmo que o usuário só confirme o email dias depois.
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin, 
            data: {
              full_name: fullName,
              institution: institution,
              birth_date: birthDate,
              address: address,
              academic_role: academicRole,
              user_type: 'researcher'
            }
          }
        });

        if (authError) throw authError;

        // Não tentamos inserir em 'profiles' aqui para evitar erros de permissão (RLS)
        // A inserção será feita automaticamente no primeiro login (ver Layout.tsx)
        
        setRegistrationSuccess(true);
        window.scrollTo(0, 0);

      } else {
        // --- FLUXO DE LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        // O redirecionamento acontece via Listener no Layout.tsx ou aqui
        navigate('/dashboard');
      }
    } catch (error: any) {
      addToast({ title: 'Erro', description: error.message || 'Ocorreu um erro inesperado', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-emerald-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifique seu Email</h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Enviamos um link de confirmação para:<br/>
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg text-left mb-8 border border-blue-100">
            <p className="text-sm text-blue-800 flex gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>
                Para ativar sua conta e acessar o painel, clique no link enviado para o seu e-mail.
              </span>
            </p>
          </div>

          <button 
            onClick={() => {
              setRegistrationSuccess(false);
              setIsSignUp(false);
              setPassword('');
            }}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para o Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl mx-auto mb-4">P</div>
           <h1 className="text-2xl font-bold text-gray-900">
             {isSignUp ? 'Criar Nova Conta' : 'Acesse sua Conta'}
           </h1>
           <p className="text-gray-500">
             {isSignUp ? 'Preencha seus dados acadêmicos para começar.' : 'Bem-vindo de volta à plataforma.'}
           </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {isSignUp && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input 
                    type="date" 
                    required={isSignUp}
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                   <select 
                      value={academicRole}
                      onChange={(e) => setAcademicRole(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                   >
                     <option value="estudante">Estudante</option>
                     <option value="professor">Professor</option>
                     <option value="investigador">Investigador</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                <input 
                  type="text" 
                  required={isSignUp}
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Universidade ou Centro de Pesquisa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço / Localização</label>
                <input 
                  type="text" 
                  required={isSignUp}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Cidade, Província"
                />
              </div>
              
              <div className="border-t border-gray-100 my-4"></div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Institucional ou Pessoal</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="********"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Processando...' : (isSignUp ? 'Concluir Cadastro' : 'Entrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-emerald-600 font-semibold hover:underline"
            >
              {isSignUp ? 'Fazer Login' : 'Cadastre-se aqui'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};