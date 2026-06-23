import Link from "next/link";



export default function UpdatesPage() {
    return(

        <main className="pt-35 flex min-h-screen flex-col items-center">
            <div className="items-center justify-center flex flex-col mt-4 text-white font-mono text">
            Update Logs
            </div>

             <h5 className="w-full mt-4 text-center  text-xs text-white/80 border-t border-white/25 pt-4 pb-4">

            <div className="mt-4 items-center justify-center flex-col text-white/75 font-mono text-sm">
            22/06/2026 - DD/MM/YYYY
            </div>

            

            <div className="ml-130 mt-4 items-start flex flex-col text-white/60 font-mono text-xs">
            <span> - Faster pages </span>
            <span> - Now the historical data columns for each song are divided into pages to avoid creating a very long list. </span>
            <span> - Added "Update Logs" page </span>
            <span> - New Site Icon </span>
            </div>

            </h5>

        <h5 className="w-full mt-4 text-center justify-center text-xs text-white/80 border-t border-white/25 pt-4 pb-4">
            <Link href="/" className="mt-4 text-purple-500 hover:text-purple-200">
                Back to Homepage
            </Link>
            </h5>

        </main>

    )

}