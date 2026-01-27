import React from 'react';
import { Scale, FileText, ShieldAlert, UserCheck } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-emerald-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
        <p className="text-emerald-100 max-w-2xl mx-auto px-4">
          Última atualização: 27 de Janeiro de 2026
        </p>
      </div>

      <div className="max-w-screen-md mx-auto px-4 py-16">
        <div className="prose prose-emerald lg:prose-lg max-w-none space-y-12">
          
          <section className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Natureza da Plataforma</h2>
              <p className="text-gray-600 leading-relaxed">
                O PADC é um portal dedicado à promoção do conhecimento científico em Angola. Ao navegar no site, o utilizador aceita as condições aqui descritas.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Uso de Conteúdo</h2>
              <p className="text-gray-600 leading-relaxed">
                É permitida a partilha de conteúdos para fins educativos e de citação, desde que o PADC seja devidamente identificado como a fonte original. É proibido o uso do material para fins comerciais sem autorização prévia.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Conduta do Utilizador</h2>
              <p className="text-gray-600 leading-relaxed">
                Espaços de discussão e comentários devem manter o respeito e o rigor. Discursos de ódio, desinformação deliberada ou ataques pessoais resultarão em banimento imediato.
              </p>
            </div>
          </section>

          <section className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Limitação de Responsabilidade</h2>
              <p className="text-gray-600 leading-relaxed">
                O PADC esforça-se por verificar todas as fontes, mas o conteúdo não substitui aconselhamento profissional médico, jurídico ou técnico especializado.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};