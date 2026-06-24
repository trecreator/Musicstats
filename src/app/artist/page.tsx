'use client'

import { useEffect } from 'react'





export default function ArtistPage() {

    useEffect(() => {
        document.documentElement.style.setProperty('--nav-bg', '#1e1b4b');
        return () => { document.documentElement.style.setProperty('--nav-bg', '#20102c25');

        };
    }, []);



    return(

        <main className="pt-25">
         
         <div className="flex items-center justify-start w-full h-28 pl-6 border-8 border-red-900 bg-red-900">

            <div className="text-white font-bold text-4xl">
                ARTIST NAME
            </div>

            </div>


        </main>

    )

}