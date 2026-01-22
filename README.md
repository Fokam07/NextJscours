# NextJscours

# Exercice 005: 

| Framework           | SSG | ISR | SSR |
|---------------------|-----|-----|-----|
| Next.js             | ✔️  |  ✔️  | ✔️ |
| Nuxt.js             | ✔️  |     | ✔️  |
| NestJS              |     |     | ✔️  |
| SvelteKit           | ✔️  |     | ✔️  |
| Remix               | ✔️  |     | ✔️  |
| Gatsby              | ✔️  |     |     |
| Astro               | ✔️  |     |     |
| Angular (Universal) |      |     | ✔️  |
| Vue.js (Vite)       |     |     | ✔️  |
| Qwik                | ✔️  |     | ✔️  |

# Exercie006:
| Framework   | Frontend | Backend | Full-Stack |
|-------------|----------|---------|------------|
| Next.js     |    x     |        |      x     |
| Nuxt.js     |    x     |        |      x     |
| Nest.js     |          |    x    |            |      
| React       |    x     |        |           |
| Angular     |    x     |        |           |
| Vue.js      |    x     |        |           |
| Svelte      |    x     |        |           |
| Express.js  |         |    x    |           |	
| Remix       |    x     |        |      x     |
| Astro       |    x     |        |           |

# Exercice007: 
| Framework   |    PP    |   MP    |     GP     |
|-------------|----------|---------|------------|
| Next.js     |    x     |    x    |     x      |
| Nuxt.js     |    x     |    x    |     x      |
| Nest.js     |          |    x    |     x      |      
| React       |    x     |    x    |     x      |
| Angular     |          |    x    |     x      |
| Vue.js      |    x     |    x    |     x      |
| Svelte      |    x     |    x    |            |
| Express.js  |          |    x    |     x      |	
| Remix       |    x     |    x    |     x      |
| Astro       |    x     |    x    |            |

# Exercice008: 

Partie 1: Analyse des besoins 
|Critère                  |        Next.js                               |          Nuxt.js     |
|-------------------------|----------------------------------------------|----------------------|
|Ecosystéme               |Enorme ecosystéme React                       | ecosystéme Vue       |
|Type de framework        |Full-stack react(frontend + server)           | Full-stack vue       |
|Langage /UI              |JS/TS + React (JSX/TSX)                       | JS/TS + vue(SFC)     |
| SSR                     |          OUI                                 |       OUI            |
| SSG                     |     OUI (Static generation)                  | OUI (prerender)      |
| ISR                     |     OUI (ISR natif)                          | Rendu hybride        |
|Backend intégré          |     API Routes/Routes Handlers               | Serveur via Nitro    |
|Routing                  |File-based routing(App router/Pages router)   | File-based routing   |
|Courbe d'apprentissage   |Moyen , depend de React + concept next        |simple si connais vue |
|Déploiment               |très fluide sur vercel(réference),netlifly    | Très flexible        |
Next = le standard côté React, Nuxt = le standard côté Vue, les deux savent faire SSR/SSG et du “hybride”.

Partie 2 : Choix technologie 

1) Site vitrine SEO : lequel ? Pourquoi ?
Next.js ou Nuxt.js : les deux sont excellents en SSR/SSG.
Choix pratique :
Next.js si ton équipe/stack est React (et/ou Vercel).

Nuxt.js si ton équipe/stack est Vue et que tu veux beaucoup de choses prêtes (routing, conventions, modules).
2) Dashboard complexe : lequel ? Pourquoi ?
Next.js si l’équipe est React et que tu veux profiter de l’écosystème (UI libs, state management, patterns d’app).
Nuxt.js si l’équipe est Vue et que tu veux une structure très guidée et un “DX” (expérience dev) très fluide.
 Le “dashboard complexe” dépend surtout de l’équipe + architecture (auth, permissions, API, états), pas seulement du framework.
3) Équipe React ? Équipe Vue ?
Équipe React → Next.js
Équipe Vue → Nuxt.js
(Le gain de productivité vient de rester dans l’écosystème naturel.)

Partie 3: Mise en situation

Blog statique → Nuxt.js ou Next.js (SSG)
Justificatif : contenu stable, rapide, SEO top. (Si blog “pur”, Astro est aussi excellent, mais ici on compare Next/Nuxt.)

Application SaaS → Next.js ou Nuxt.js (SSR + API)
Justif : auth, pages dynamiques, données par utilisateur, routes protégées, API intégrée.

MVP rapide → Nuxt.js (souvent) ou Next.js
Justif : Nuxt est très “batteries included” (conventions/modules). Next est aussi très rapide si l’équipe maîtrise React.

Projet avec une équipe junior → Nuxt.js (souvent) / Next.js si juniors React
Justif : conventions + structure guidée = moins de décisions au début (ça aide les juniors).

Projet long terme évolutif → Next.js ou Nuxt.js
Justif : les deux sont robustes. Le bon choix = ce que l’équipe maîtrise, + le style d’archi (monorepo, CI/CD, hébergement, perf).

Phrase de conclusion attendue

Next.js et Nuxt.js offrent SSR/SSG et une approche full-stack ; le meilleur choix dépend surtout de l’écosystème de l’équipe (React vs Vue) et du besoin (SEO statique vs app dynamique).


# Exercice009: 

## Tableau 1 - Environnement d'execution 
| Critere                    | Node js  | Navigateur    |
|----------------------------|----------|---------------|   
| Execute javascriipt        |     X    |       X       |   
| Cote Serveur               |     X    |               |   
| Cote client                |          |       x       |   
| Acces au Dom               |          |       X       |   
| Acces au systeme de fichier|     X    |               |   
| Acces au reseau bas niveau |     X    |       X       |  

## Tableau 2 - APIs disponibles

| API\Fonctionnalite  | Node js | Navigateur |
|---------------------|---------|------------|
| DOM                 |         |      X     |
| fs(file System)     |    X    |            |
| http                |    X    |            |
| fetch               |    X    |      X     |
| localstorage        |         |      X     |
| process             |    X    |            |

## Tableau 3 - Securite et contraintes

| Criteres           | Node js       | Navigateur   |
|--------------------|---------------|--------------|
| Acces libre disque |     X         |              |
| Sanbox de securite |               |       X      |
| Acces Materiel     | acces partiel | Acces tres limiter|
| Isolation du code  |               |       X      |

## Tableau 4 - Cas d'usage

| Cas d'usage |  Node js | Navigateur    |
|--------------------|--------------|-----|
|API backend         |   X       |          |
| interface utilisateur | X         | X     |
| traitement des fichiers |  X      |       |
| validation de formulaire |        |   X   |
| temps reel(Web sockets) |  X      |   X   |

## Tableau 5 - performance de l'execution

| critere   |  Node js  | Navigateur |
|-----------|-----------|------------|
| Event Loop |  X   |   X   |
| Multithreading |  X   | tres limiter |
| longs calculs |    X   |   bloque le rendu pas tres optimal |
|interaction utilisateur |      |   X   |

## Question de synthèse
    JavaScript se comporte différemment car l’environnement détermine les APIs et les restrictions.
Dans le navigateur, JS est sandboxé, avec accès au DOM, aux événements et stockage limité, pour la sécurité de l’utilisateur.
Dans Node.js, JS s’exécute côté serveur, avec accès complet au système de fichiers, réseau et processus.
La boucle d’événements reste la même, mais les modules, objets globaux et permissions diffèrent.
Ainsi, le même langage a des capacités très différentes selon l’environnement.

## Conclusion 

Exactement ! Cette phrase résume bien la situation :

*   Node.js : JS côté serveur → accès complet au système (fichiers, réseau, processus), responsable de la sécurité, performance et gestion serveur.
*   Navigateur : JS côté client → accès limité pour protéger l’utilisateur, manipule le DOM, événements et stockage local.
Node.js et le navigateur utilisent JavaScript, mais n’offrent pas les mêmes capacités ni les mêmes responsabilités.


