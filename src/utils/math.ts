


export function SuavizarNumero(num: number) //Suaviza numeros grandes e retorna-os como string
{
    let numeroSuavizado: string = " ";

    // Centenas
    if (num < 1000) {

         if(num == 0)
            return " ";

        return num.toString();
    }

    // Mil (K)
    if (num <= 999999) {
        numeroSuavizado = (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        return numeroSuavizado;
    } 
    // Milhões (M)
    else if (num >= 1000000 && num < 1000000000) {
        numeroSuavizado = (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
        return numeroSuavizado;
    }
    // Bilhões (B)
    else {
        numeroSuavizado = (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
       
        return numeroSuavizado;
    }
}

//toFixed = força a variável a ter pelo menos 1 decimal
//replace = remove o zero caso seja um número redondo

