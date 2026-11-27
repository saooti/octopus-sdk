# Onglets : OctopusTabsList & OctopusTabsPanel

Composants d'onglets accessibles, suivant le
[motif ARIA « Tabs »](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/). Ils
remplacent `ClassicTabs` et `ClassicNav`, qui sont dépréciés.

- `OctopusTabsList` : la liste des onglets (`role="tablist"`)
- `OctopusTabsPanel` : le panneau affichant le contenu de l'onglet sélectionné
  (`role="tabpanel"`)

## Utilisation

Les deux composants sont liés par un `prefix` commun, à créer avec
`useOctopusTabs()` dans le `setup` du composant parent. L'onglet sélectionné est
géré avec `v-model:tab` sur la liste, et la même ref est passée au panneau.

```vue
<template>
    <h2 id="days-title">Programme</h2>
    <OctopusTabsList
        v-model:tab="selected"
        :tabs="days"
        :prefix="prefix"
        labelled-by="days-title"
    />
    <OctopusTabsPanel :tab="selected" :prefix="prefix">
        <!-- Contenu de l'onglet sélectionné -->
    </OctopusTabsPanel>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
    OctopusTabsList,
    OctopusTabsPanel,
    useOctopusTabs,
    type TabID
} from "@saooti/octopus-sdk";

const { prefix } = useOctopusTabs();
const selected = ref<TabID|undefined>();
const days = [
    { id: 1, label: "Lundi" },
    { id: 2, label: "Mardi" }
];
</script>
```

## OctopusTabsList

| Prop          | Type                   | Description                                                      |
|---------------|------------------------|------------------------------------------------------------------|
| `tabs`        | `Array<TabItem>`       | Onglets à afficher (`id`, `label`, `current` optionnel)          |
| `tab`         | `TabID`                | Onglet sélectionné, à utiliser avec `v-model:tab`                |
| `prefix`      | `string`               | Préfixe des ids, partagé avec le panneau                         |
| `labelledBy`  | `string`               | Id de l'élément nommant la liste (un titre en général)           |
| `label`       | `string`               | Nom de la liste, si aucun élément visible ne la nomme            |
| `extend`      | `boolean`              | L'onglet sélectionné est deux fois plus large                    |
| `indicator`   | `'border' \| 'arrow'`  | Indicateur de l'onglet sélectionné (`border` par défaut)         |

`labelledBy` et `label` sont exclusifs, l'un des deux est obligatoire : la liste
doit avoir un nom accessible.

- **Slot `tab`** (`{ tab }`) : personnalise le contenu d'un onglet. Il doit
  rendre du texte, qui est le nom accessible de l'onglet.
- **`TabItem.current`** : ajoute `aria-current` sur l'onglet (par exemple
  `'date'` pour le jour courant). Il est indépendant de la sélection. Ajouter
  aussi un repère visuel, sinon l'information n'est donnée qu'aux lecteurs
  d'écran.
- **Clavier** : flèches gauche/droite (en boucle), Début/Fin. Le focus suit la
  sélection, Tab sort de la liste.
- **Sélection par défaut** : si `tab` est absent ou ne correspond à aucun
  onglet, le premier onglet est sélectionné (et émis). Si `tabs` devient vide,
  la liste n'est plus affichée et émet `undefined` : la ref liée doit accepter
  `undefined`.
- **Largeur** : les onglets ont tous la même largeur, avec un minimum de
  `--octopus-tabs-min-width` (`5rem` par défaut). En dessous, la liste défile
  horizontalement.

## OctopusTabsPanel

| Prop               | Type      | Description                                                    |
|--------------------|-----------|----------------------------------------------------------------|
| `tab`              | `TabID`   | Onglet sélectionné : la ref du `v-model:tab` de la liste       |
| `prefix`           | `string`  | Le même préfixe que la liste                                   |
| `contentFocusable` | `boolean` | À activer si le contenu contient des éléments focusables       |

- Le panneau est toujours rendu. Sans onglet sélectionné, il n'a ni
  `role="tabpanel"` ni `aria-labelledby`.
- Sans `contentFocusable`, le panneau est focusable (`tabindex="0"`), pour que
  son contenu soit atteignable au clavier.
- Ce n'est pas une zone live : changer d'onglet n'est pas annoncé.
- Le panneau ne vérifie pas `tab` : utiliser la ref mise à jour par la liste,
  pas une valeur passée uniquement au panneau.

## Points d'attention

- `useOctopusTabs()` s'appuie sur `useId()` : il doit être appelé dans le
  `setup`. Si plusieurs applications Vue partagent une page, définir
  `app.config.idPrefix` pour éviter les ids en double.
- Les espaces des ids d'onglets sont remplacés par `-` : deux ids ne différant
  que par leurs espaces (`"a b"` et `"a-b"`) entrent en collision.
- `getTabId` et `getPanelId` sont exportés, pour retrouver les ids générés
  (par exemple dans les tests).
