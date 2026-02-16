import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, BookOpen, Users } from 'lucide-react';

export const Home: React.FC = () => {
  // Imagem de alta qualidade de uma biblioteca acadêmica moderna para o fundo
  const bgImageUrl = "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000";

  return (
    <div className="flex flex-col">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-emerald-950">
        
        {/* Background Image via IMG tag for maximum reliability and scaling */}
        <img 
          src={bgImageUrl}
          alt="Biblioteca Científica PADC" 
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Professional Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-emerald-950/80 backdrop-blur-[1px]"></div>

        <div className="max-w-screen-xl mx-auto px-4 relative z-10 text-center py-20 lg:py-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-semibold mb-8 animate-fade-in-up border border-emerald-500/30 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            Conectando o saber científico angolano
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-tight drop-shadow-2xl">
            Divulgação Científica <br className="hidden md:block" />
            <span className="text-emerald-400">de Angola</span> para o mundo
          </h1>
          
          <p className="text-lg md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg">
            A porta de entrada para a produção acadêmica nacional. Publique, descubra e compartilhe o conhecimento que transforma a nossa sociedade.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link 
              to="/pesquisas" 
              className="w-full sm:w-auto px-10 py-5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 hover:scale-105 transition-all duration-300 shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 text-lg"
            >
              <Search className="w-6 h-6" />
              Explorar Pesquisas
            </Link>
            <Link 
              to="/sobre" 
              className="w-full sm:w-auto px-10 py-5 bg-white/10 backdrop-blur-xl text-white border border-white/30 rounded-2xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
            >
              Nossa Missão <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Subtle Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white relative">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Pilar da Ciência em Angola</h2>
            <div className="w-24 h-2 bg-emerald-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:border-emerald-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] transition-all duration-500">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Acesso Aberto</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Democratizamos o acesso ao conhecimento, garantindo que o trabalho de pesquisadores angolanos seja lido sem barreiras.
              </p>
            </div>
            
            <div className="group p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] transition-all duration-500">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Colaboração</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Fomentamos o intercâmbio entre universidades e centros de investigação para acelerar a inovação em Angola.
              </p>
            </div>
            
            <div className="group p-10 rounded-3xl bg-gray-50 border border-gray-100 hover:border-purple-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(168,85,247,0.1)] transition-all duration-500">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Descoberta</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Localize rapidamente dados e evidências científicas produzidas localmente para fundamentar os seus próprios estudos.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};