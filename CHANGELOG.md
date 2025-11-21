# CHANGELOG

## 41.0.20

**Features**

- `durationHelper.convertTimestamptoString` accepte les nanosecondes

**Fixes**

- Bannière 'en cours de traitement' ne s'affiche que pour la consultation d'épisode

**Misc**

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
