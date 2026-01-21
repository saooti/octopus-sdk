# Configuration

Se référer à [`src/stores/ParamSdkStore.ts`](../src/stores/ParamSdkStore.ts)
pour une liste exhaustive des propriétés disponibles.

## Paramètres généraux

### Filtrage automatique

Les propriétés suivantes sont ajoutées automatiquement aux requêtes "ajustées"
de `classicApi` (c'est à dire quand le paramètre correspondant est à true).

Cela permet un filtrage systématique sur certaines propriétés, ce qui est par
exemple utilisé dans les podcastmakers pour n'afficher que certaines rubriques.

- `forceOrganisationId` : Filtre par organisation
- `forceRubriqueId` : Filtre par rubrique (peut être une liste)
- `forceNoRubriquageId` : Filtre par rubriquage (exclusion des rubriquages,
  peut être une liste)
