# CHANGELOG

## 41.1.0

**Features**

- Accélération `selectOrganisation`
- Ajout d'options de personnalisation à `EmissionInlineList`
- Ajout d'options de personnalisation à `EmissionPresentationItem`
- Ajout des composants `PresentationLayout` & `PresentationItem`
  - `PresentationLayout` permet de simplement disposer quelques éléments
  - `PresentationItem` permet de simplement afficher une image avec description
- Ajout de `PodcastPresentationList`, pendant podcast de `EmissionPresentationList`

**Fixes**

- Correction taille variable de `EmissionItem`

**Misc**

- Réécriture de `EmissionPresentationItem` & `EmissionPresentationList` pour
  utiliser `PresentationItem` & `PresentationLayout`

## 41.0.21 (25/11/2025)

**Fixes**

- Correction affichage durée quand il n'y a pas de décimales

**Misc**

- Amélioration affichage bouton PlayPodcast

## 41.0.20 (21/11/2025)

**Features**

- `durationHelper.convertTimestamptoString` accepte les nanosecondes

**Fixes**

- Bannière 'en cours de traitement' ne s'affiche que pour la consultation d'épisode

**Misc**

- Ajout de slots sur `ClassicRadio`
- Correction d'un warning sur `SwiperList`
- Mise à jour des dépendances

## 41.0.19 (13/11/2025)

**Features**

- Ajout recherche par référence ayant-droit sur les émissions et épisodes
- Ajout du composant `ClassicTagInput` pour simplifier la saisie de tags
- Affichage des mots-clés lors de la consultation d'une émission

**Misc**

- Amélioration affichage des crédits dans les épisodes

## 41.0.18 (12/11/2025)

**Features**

- Changements pour les émissions non publiées (`visible = false`) :
  - La recherche permet de les afficher quand on affiche les épisodes non
    publiés
  - Un bandeau s'affiche pour indiquer que l'émission n'est pas disponible aux
    auditeurs

**Misc**

- Ajout d'une propriété `relative` pour faire fonctionner les
  `ClassicHelpButton` quand un parent a une position relative.
- Correction alignement du texte dans `ClassicAlert`
- Ajout d'un slot `after-label` sur `ClassicCheckbox`

## 41.0.17 (07/11/2025)

**Features**

- Ajout options de configuration sur `ClassicHelpButton`

**Fixes**

- Correction anomalie fermeture `ClassicPopover`

**Misc**

- Ajout du `CHANGELOG`
- Ajustements configuration typescript pour analyse de code
- Nouvelles règles eslint

## 41.0.16 (04/11/2025)

- Bannière 'en cours de traitement' ne s'affiche plus dans les listes
- Ajustements sur `ClassicSelect` & `ClassicHelpButton`
- Ajout de `ClassicAlert`, pour l'affichage de message
