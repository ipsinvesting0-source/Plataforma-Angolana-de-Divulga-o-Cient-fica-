import React from 'react';
import { Shield, Eye, Lock, Database } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-emerald-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
        <p className="text-emerald-100 max-w-2xl mx-auto px-4 italic">
          Em conformidade com a Lei n.º 22/11 (Lei de Protecção de Dados Pessoais - Angola)
        </p>
      </div>

      <div className="max-w-screen-md mx-auto px-4 py-16">
        <div className="grid gap-8">
          
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">Recolha de Informação</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              O PADC solicita dados pessoais (como nome e e-mail) apenas quando necessário para subscrição de newsletters ou participação em eventos.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">Armazenamento</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Os dados são armazenados de forma segura e utilizados exclusivamente para a comunicação entre o portal e o leitor.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">Transparência</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Não partilhamos dados com entidades externas sem o seu consentimento explícito, exceto por obrigatoriedade legal.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-gray-900">Gestão de Dados</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Qualquer utilizador pode solicitar a visualização, alteração ou eliminação definitiva dos seus dados enviando uma mensagem para a nossa equipa de suporte.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};