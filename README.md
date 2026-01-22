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


