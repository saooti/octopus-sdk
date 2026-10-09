# Scripts & utilitaires

Ce document présente les différents scripts et utilitaires utilisés par le SDK.

## Husky

[Husky](https://typicode.github.io/husky/) est installé en tant que dépendance
de dev, afin de manager les hooks git.

Les hooks sont définis dans `./.husky`, et utilisent la même syntaxe que les
hooks git classiques.

Les sections suivantes décrivent le fonctionnement de ces scripts.

### pre-commit

Ce script se déclenche lors d'un commit. Il lance :

- `npm lint-staged` pour vérifier que le code modifié répond aux règles définies
  dans la configuration eslint, et les corriger si possible. Si une règle n'est
  pas respectée, le commit échoue. Le but est de **forcer l'usage de code
  propre**.
- `npm vitest run` pour lancer les tests unitaires. En cas d'echec, le commit
  échoue.

## Smoke

Ceci est un script disponible dans `./scripts/smoke-bundle` qui a pour but de
monter le SDK comme le ferait une vraie application, afin de vérifier que les
dépendances résolvent correctement.

Sert par exemple à détecter le passage d'un `import Test from "lib"` à
`import { Test } from "lib"`. Le build actuel passe à côté de ce genre de
problème, ce script le détecte.

Ce script est lancé **automatiquement à la publication** du SDK, via la
directive `prepublishOnly` dans le `pakcage.json`.
