import { useState } from "react";

export function useCv(userId) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async ({ poste, offre, file }) => {
    if(!userId)
        return;
    try {
        setLoading(true);

        const form = new FormData();
        form.append("poste", poste);
        form.append("offre", offre);
        form.append("cv", file);

        const res = await fetch("/api/cv", {
        method: "POST",
        headers:{
            'x-user-id':userId
        },
        body: form
        });

        if(!res.ok){
            throw new Error(error.message);
        }
        const data = await res.json();
        setResult(data);
    } catch (error) {
        console.error("erruer useCv", error)
        return{
            error: error.message
        }
    }
    finally{
        setLoading(false);
    }
  };

  return { generate, loading, result };
}






