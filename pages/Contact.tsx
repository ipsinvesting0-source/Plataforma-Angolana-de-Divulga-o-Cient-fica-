import React from 'react';
import { Mail, MessageCircle, MapPin, Send } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-emerald-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Contacto</h1>
        <p className="text-emerald-100 max-w-2xl mx-auto px-4">
          Conecte-se com a Ciência. Estamos abertos a colaborações.
        </p>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Canais de Comunicação</h2>
              <div className="grid gap-6">
                
                <a 
                  href="mailto:isaacdasilva013@gmail.com" 
                  className="group flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">E-mail Geral</h3>
                    <p className="text-gray-500 text-sm">isaacdasilva013@gmail.com</p>
                  </div>
                </a>

                <a 
                  href="https://wa.me/244935547549" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">WhatsApp</h3>
                    <p className="text-gray-500 text-sm">+244 935 547 549</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Localização</h3>
                    <p className="text-gray-500 text-sm">Luanda, Angola</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <h3 className="font-bold text-emerald-900 mb-2">Departamentos</h3>
              <ul className="text-sm text-emerald-800 space-y-2 opacity-80">
                <li>• Geral: isaacdasilva013@gmail.com</li>
                <li>• Submissão de Artigos: isaacdasilva013@gmail.com</li>
                <li>• Parcerias Institucionais: isaacdasilva013@gmail.com</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Envie uma Mensagem</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                <input type="text" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nome completo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu E-mail</label>
                <input type="email" className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <select className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                  <option>Dúvida Geral</option>
                  <option>Submissão de Pesquisa</option>
                  <option>Parceria</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea rows={4} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Como podemos ajudar?"></textarea>
              </div>
              <button className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Enviar Mensagem
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};