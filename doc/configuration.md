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

## Paramètres du player

- `topPlacement` : Ajuste l'affichage pour un bon fonctionnement quand placé
  en haut de page
  > [!important]
  > Le fonctionnement de ce paramètre ne contrôle pas le positionnement
  > du player, il ne sert qu'à indiquer son placement en haut de page.
  > Pour le placer en haut de page, il est nécessaire d'effectuer ce
  > placement manuellement.
- `startLarge` : Le player s'ouvrira par défaut dans sa variante *large*
- `showAITranscriptWarning` : Affiche un message informatif indiquant que la
  transcription est générée par IA
- `stayOpenOnFinish` : Ne ferme pas le player une fois la lecture terminée
