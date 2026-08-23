import Link from "next/link";

export default function UpdatesPage() {
    return (
        // Substituído pt-35 por pt-24 (ou use pt-[140px] se quiser o valor exato)
        <main className="pt-24 flex min-h-screen flex-col items-center px-4">
            
            <h1 className="mt-4 text-white font-mono text-xl font-bold">
                Update Logs
            </h1>

            {/* Substituído h5 por section (semântica correta) */}
            <section className="w-full max-w-md mt-6 text-center border-t border-white/25 pt-4 pb-4">
                <div className="text-white/75 font-mono text-sm">
                    22/06/2026 - DD/MM/YYYY
                </div>

                {/* Removido ml-130 e centralizado o bloco com asfalto alinhado à esquerda */}
                <div className="mt-4 mx-auto max-w-xs flex flex-col items-start text-white/60 font-mono text-xs space-y-1 text-left">
                    <span>- Faster pages.</span>
                    <span>- Now the historical data columns for each song are divided into pages to avoid creating a very long list.</span>
                    <span>- Added "Update Logs" page.</span>
                    <span>- New Site Icon.</span>
                    <span>- New Visual Data Graphs added.</span>
                </div>
            </section>

            <section className="w-full max-w-md mt-6 text-center border-t border-white/25 pt-4 pb-4">
                <div className="text-white/75 font-mono text-sm">
                    22/08/2026 - DD/MM/YYYY
                </div>

                {/* Removido ml-130 e centralizado o bloco com asfalto alinhado à esquerda */}
                <div className="mt-4 mx-auto max-w-xs flex flex-col items-start text-white/60 font-mono text-xs space-y-1 text-left">
                    <span>- Fixed data errors.</span>
                    <span>- Around 15 new musics added.</span>
                    <span>- Fixed: 3 Old musics with incorrect url.</span>

                    
                </div>
            </section>

            {/* Rodapé com o link */}
            <footer className="w-full max-w-md mt-4 text-center border-t border-white/25 pt-4 pb-4">
                <Link href="/" className="inline-block mt-2 text-purple-500 hover:text-purple-200 transition-colors">
                    Back to Homepage
                </Link>
            </footer>



        </main>
    );
}
