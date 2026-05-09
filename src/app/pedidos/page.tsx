import { buscarPedidosPopulares } from '../actions';
import Link from 'next/link';

export default async function PaginaPedidos() {
  const result = await buscarPedidosPopulares();
  const pedidos = (result.dados as any[]) || [];

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-500 hover:text-white transition-colors text-sm">
          ← Voltar para a busca
        </Link>
        
        <h1 className="text-4xl font-black mt-6 mb-8 italic uppercase tracking-tighter text-blue-600">
          🔥 No Radar da Galera
        </h1>

        <div className="grid gap-4">
          {pedidos.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-gray-900 rounded-3xl text-center">
              <p className="text-gray-600 italic">Nenhuma música chegou a 15 votos ainda.</p>
            </div>
          ) : (
            pedidos.map((item) => (
              <div key={item.id_video} className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <div>
                  <h3 className="font-bold text-xl">{item.titulo_sugerido}</h3>
                  <span className="text-xs font-mono text-gray-500 uppercase">{item.id_video}</span>
                </div>
                <div className="text-center bg-blue-600/10 p-3 rounded-xl border border-blue-600/30">
                  <span className="block text-3xl font-black text-blue-500">{item.votos}</span>
                  <span className="text-[10px] font-bold uppercase text-blue-400">Votos</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}