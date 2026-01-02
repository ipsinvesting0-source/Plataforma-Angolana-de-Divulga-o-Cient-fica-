import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, BookOpen, Users } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-emerald-50/30 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="max-w-screen-xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Conectando o saber científico angolano
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
            Divulgação Científica <br className="hidden md:block" />
            <span className="text-emerald-600">de Angola</span> para o mundo
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Uma plataforma centralizada para pesquisadores, estudantes e instituições publicarem, descobrirem e compartilharem conhecimento acadêmico.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/pesquisas" 
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 hover:scale-105 transition-all duration-200 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Explore as Pesquisas
            </Link>
            <Link 
              to="/sobre" 
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 hover:border-emerald-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Saiba Mais <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Acesso Aberto</h3>
              <p className="text-gray-600">
                Disponibilize suas pesquisas gratuitamente para a comunidade, aumentando a visibilidade e citações do seu trabalho.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Networking</h3>
              <p className="text-gray-600">
                Conecte-se com outros pesquisadores e instituições angolanas, fomentando parcerias e projetos conjuntos.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Descoberta Fácil</h3>
              <p className="text-gray-600">
                Utilize filtros avançados para encontrar teses, dissertações e artigos relevantes para sua área de estudo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};