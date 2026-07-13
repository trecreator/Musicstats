import Link from "next/link"

export default function notfound(){


    return(
<>
        <div className="flex items-center justify-center pt-50 text-white">
            Page not found | Error 404 
            </div>
            <div className="flex pt-2 items-center justify-center">
            <Link 
            className="flex items-center justify-center  text-purple-400 font-bold"
            href="/">
            Back to homepage
            </Link>
            </div>
        </>

    );
}