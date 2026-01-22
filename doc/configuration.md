# Configuration

Se référer à [`src/stores/ParamSdkStore.ts`](../src/stores/ParamSdkStore.ts)
pour une liste exhaustive des propriétés disponibles.

## Paramètres généraux

### Affichage

- `showTimeWithDates` : Affiche l'heure à côté de la date de publication des
  podcasts

### Filtrage automatique

Les propriétés suivantes sont ajoutées automatiquement aux requêtes "ajustées"
de `classicApi` (c'est à dire quand le paramètre correspondant est à true).

Cela permet un filtrage systématique sur certaines propriétés, ce qui est par
exemple utilisé dans les podcastmakers pour n'afficher que certaines rubriques.

- `forceOrganisationId` : Filtre par organisation
- `forceRubriqueId` : Filtre par rubrique (peut être une liste)
- `forceNoRubriquageId` : Filtre par rubriquage (exclusion des rubriquages,
  peut être une liste)

## Paramètres de la page de consultation d'un podcast

- `hideTags` : N'affiche pas les mots-clés
- `maxTags` : Limite le nombre maximal de mots-clés à afficher

## Paramètres de la page de consultation d'une émission

- `hideTags` : N'affiche pas les mots-clés
- `maxTags` : Limite le nombre maximal de mots-clés à afficher
