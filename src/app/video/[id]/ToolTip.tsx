
import { useState } from 'react'
import { useEffect } from 'react'

interface Props{
    x: any,
    y: any,
    dado: any,
    nomeDado: any
}

export default function ToolTip({x, y, dado, nomeDado } : Props){

const [visible, setVisible] = useState(false);

useEffect(() => {
    setVisible(true);
}, [dado]);

return(
    <div
    className={`absolute border-2 border-purple-950 bg-purple-900 text-white p-2 rounded transition-all duration-800 ${visible ? "opacity-100 scale-100"
            : "opacity-0 scale-95"}`}
    style={{
        left: x,
        top: y
    }}
>
    {nomeDado}: {dado}
</div>
);

}