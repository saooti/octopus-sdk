# octopus-sdk

Librairie pour les projets Octopus.

## Usage

Installer dans un projet:

```bash
npm i @saooti/octopus-sdk
```

Le SDK est publié pré-buildé (`dist/`). Les alias `@` sont résolus au build du SDK,
et les styles `<style scoped>` de tous les composants sont extraits dans un unique
fichier CSS. Ce fichier n'est pas importé automatiquement: il faut l'importer une
fois dans le projet consommateur (en plus de `octopus-library.scss` qui ne contient
que les variables/utilitaires globaux):

```ts
import "@saooti/octopus-sdk/style.css";
```

Sans cet import, les composants du SDK s'affichent sans leurs styles.

Utiliser dans un projet en local:
```bash
# Dans le SDK
npm link  # Nécessaire uniquement la première fois
npm run build:watch

# Dans le projet
npm link @saooti/octopus-sdk
```
