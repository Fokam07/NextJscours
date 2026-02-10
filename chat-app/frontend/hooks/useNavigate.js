'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

const navigateContext  = createContext();
export function NavigateProvider({children}){
  const [route, setRoute] = useState('home');
    const [abrRoute, setAbr] = useState(['home']);
    const {user} = useAuth();
    function updateRoute(newRoute){
        sessionStorage.setItem('router',newRoute );
        setRoute(newRoute);
    }

    // Redirection vers login si pas connecté
    useEffect(()=> {
        // if (!user && route !== 'login' && route !== 'register' && route !== 'home') {
        //     setRoute('login');
        //     setAbr(['login']);
        // }
            updateRoute(sessionStorage.getItem('router') || 'chat-area');
            setAbr(['chat-area']);
        
    }, [user]);

    const push = (rt, remplace = false) => {
        if (!user && rt !== 'login' && rt !== 'register' && rt !== 'home') {
            console.log("l'utilisateur n'est pas connecte")
            updateRoute('login');
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
        updateRoute(rt);
    };

    const pop = () => {
        if (abrRoute.length <= 1) return;
        const rt = abrRoute[abrRoute.length - 2];
        
        setAbr(prev => {
            const copy = [...prev];
            copy.pop();
            return copy;
        });

        updateRoute(rt);
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
