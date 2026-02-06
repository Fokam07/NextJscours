'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

const navigateContext  = createContext();
export function NavigateProvider({children}){
console.log("useNavigate() executé");
  const [route, setRoute] = useState("home");
    const [abrRoute, setAbr] = useState(['home']);
    const {user} = useAuth();

    // Redirection vers login si pas connecté
    useEffect(()=> {
        if (!user && route !== 'login' && route !== 'logout' && route !== 'home') {
            setRoute('login');
            setAbr(['login']);
        }
        if(user){
            setRoute('chat-area');
            setAbr(['chat-area']);
        }
    }, [user]);

    const push = (rt, remplace = false) => {
        if (!user && rt !== 'login' && rt !== 'logout' && rt !== 'home') {
            setRoute('login');
            setAbr(['login']);
            return;
        }

        if (!remplace) {
            setAbr(prev => {
                const copy = [...prev];
                copy.pop();
                return copy;
            });
        }

        setAbr(prev => [...prev, rt]);
        setRoute(rt);
    };

    const pop = () => {
        if (abrRoute.length <= 1) return;
        const rt = abrRoute[abrRoute.length - 2];
        
        setAbr(prev => {
            const copy = [...prev];
            copy.pop();
            return copy;
        });

        setRoute(rt);
    };

    return <navigateContext.Provider value={{route, pop, push}}>
        {children }
    </navigateContext.Provider>;
}

export function useNavigate(){
    if(navigateContext!=null){
        return useContext(navigateContext);
    }
}
