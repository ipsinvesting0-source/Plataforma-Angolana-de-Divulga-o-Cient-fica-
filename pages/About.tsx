import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-emerald-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Sobre a PADC</h1>
        <p className="text-emerald-100 max-w-2xl mx-auto px-4">
          Conheça a missão, visão e os valores que movem a Plataforma Angolana de Divulgação Científica.
        </p>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-16 space-y-16">
        
        {/* Context */}
        <section className="prose lg:prose-xl mx-auto text-gray-600 text-center">
          <p>
            A PADC surge da necessidade urgente de centralizar, organizar e democratizar o acesso à produção científica em Angola. 
            Em um cenário onde o conhecimento muitas vezes permanece fragmentado, nossa plataforma serve como uma ponte vital 
            entre pesquisadores, instituições acadêmicas e a sociedade em geral.
          </p>
        </section>

        {/* Pillars */}
        <section className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-2xl border-t-4 border-emerald-500 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Missão</h3>
            <p className="text-gray-600 leading-relaxed">
              [Missão a definir] Promover a visibilidade da ciência angolana através de uma infraestrutura digital robusta e acessível.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border-t-4 border-emerald-500 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Visão</h3>
            <p className="text-gray-600 leading-relaxed">
              [Visão a definir] Ser a referência principal para a busca e publicação de conteúdo acadêmico em Angola até 2030.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border-t-4 border-emerald-500 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Valores</h3>
            <ul className="text-gray-600 list-disc list-inside space-y-2">
              <li>[Valores a definir] Ética Científica</li>
              <li>Acesso Aberto</li>
              <li>Colaboração</li>
              <li>Inovação</li>
            </ul>
          </div>
        </section>

        {/* Objectives */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Objetivos Gerais</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <ul className="grid md:grid-cols-2 gap-4 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                Facilitar o acesso a teses, dissertações e artigos produzidos em Angola.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                Fomentar a colaboração entre instituições de ensino superior.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                Oferecer métricas de impacto para pesquisadores locais.
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 mt-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                Digitalizar o acervo científico nacional.
              </li>
            </ul>
          </div>
        </section>

        {/* Creator Info */}
        <section className="border-t border-gray-100 pt-10 mt-10 text-center">
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Ficha Técnica</h4>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Criado por <strong className="text-gray-700">Isaac Pimpão Da Silva</strong>, Licenciado em Sociologia pelo Instituto Superior de Ciências da Educação de Luanda.
            </p>
        </section>
      </div>
    </div>
  );
};