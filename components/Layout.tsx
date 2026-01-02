import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/Toast';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Redirecionamento inteligente após login
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (location.pathname === '/' || location.pathname === '/login') {
            navigate('/dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast({ title: 'Logout realizado', type: 'info' });
    navigate('/');
  };

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Pesquisas', path: '/pesquisas' },
    { name: 'Sobre', path: '/sobre' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-emerald-600 font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-emerald-600 tracking-tight">PADC</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                  isActive(link.path) ? 'text-emerald-600' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <button className="text-sm font-medium text-gray-700 hover:text-emerald-600">
                    Meu Painel
                  </button>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-emerald-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-base font-medium p-2 rounded-lg hover:bg-gray-50 ${
                   isActive(link.path) ? 'text-emerald-600 bg-emerald-50' : 'text-gray-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t pt-4 mt-2">
               {user ? (
                 <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                    <UserIcon className="w-5 h-5" /> Meu Painel
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-2 w-full text-left p-2 text-red-600 hover:bg-red-50 rounded-lg mt-2">
                    <LogOut className="w-5 h-5" /> Sair
                  </button>
                 </>
               ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-emerald-500 text-white px-5 py-3 rounded-lg font-medium"
                  >
                    Entrar
                  </Link>
               )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center">
                    <span className="text-emerald-600 font-bold text-xs">P</span>
                  </div>
                <span className="font-bold text-lg text-gray-900">PADC</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                Promovendo a ciência e a investigação em Angola através do acesso aberto e da colaboração institucional.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Plataforma</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/pesquisas" className="hover:text-emerald-600">Pesquisas</Link></li>
                <li><Link to="/sobre" className="hover:text-emerald-600">Sobre Nós</Link></li>
                <li><Link to="/login" className="hover:text-emerald-600">Área do Pesquisador</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-emerald-600">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-emerald-600">Privacidade</a></li>
                <li><a href="#" className="hover:text-emerald-600">Contato</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} PADC. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};