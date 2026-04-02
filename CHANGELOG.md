# CHANGELOG

## 41.9.1 (En cours)

## 41.9.0 (31/03/2026)

**Features**

- **12535** - Implémentation de la traduction des sous-titres
  - Mise en place de l'api `transcriptionApi` pour simplifier les appels
  - Ajout du composable `useTranslation` pour regrouper les opérations relatives
    aux traductions
  - `PodcastRawTranscript` permet maintenant de choisir la langue de la
    transcription
    - La langue la plus pertinente pour l'utilisateur est sélectionnée par
      défaut
  - La transcription affichée dans le player correspond à la langue la plus
    pertinente disponible
- **14357** - Affichage des sous-titres et résumés d'épisodes, et des
  sous-titres des émissions
  - Ajout de nouveaux paramètres pour contrôler cet affichage :
    - `hideSubtitle` dans `emissionPage` & `podcastPage`, pour cacher les
      sous-titres
    - `descriptionOrSummary` dans `emissionPage`, pour choisir quel élément
      afficher
- **14387** - Affichage du numéro de saison et d'épisode, ainsi que du type
  d'épisode dans les `PodcastItemInfo`
- La configuration eslint est maintenant exportée, elle peut donc être intégrée
  telle quelle dans les projets se basant sur le SDK
- Ajout d'options de configuration pour `ClassicLoading` et `ClassicSpinner`

**Fix**

- **14404** - Correction affichage de la transcription dans le cas de preroll/
  postrolls multiples
- Correction `z-index` des boutons de `SwiperList`
- La propriété `focus` de `ClassicInputText` est à `false` par défaut

**Misc**

- Correction warning avec les icônes de `useSharePlatforms`
- Ajustement composants pour les podcastmakers
- Mise à jour des dépendances
- Les exports d'organisation viennent du SDK et non plus du package parent

## 41.8.4 (24/03/2026)

**Fix**

- **14291** - Correction vérification sur droits de transcription

## 41.8.3 (23/03/2026)

**Fix**

- **14083** - Correction affichage saisons sur page émission s'il y a un creux
  (par exemple saisons 2, 3, et pas de 1)
- **14373** - Correction taille icone Radio France

## 41.8.2 (23/03/2026)

**Fix**

- **14083** - Ajustements système de saison
  - Le bon dernier épisode est récupéré sur les pages d'émissions
  - Les saisons sont correctement énumérées sur les pages d'émissions

## 41.8.1 (20/03/2026)

**Fix**

- Correction `EmissionPlayerItem` ne permettant pas de lire un épisode

## 41.8.0 (18/03/2026)

**Features**

- **14083** - Ajout des fonctionnalités de saisons et types d'épisodes
  - Ajout des propriétés relatives aux saisons sur les émissions et les épisodes
  - `PodcastFilterList` permet de regrouper les épisodes en saisons
  - `EmissionPage` affiche ses épisodes en saisons si définies
  - `PodcastModuleBox` affiche le numéro de saison et d'épisode du podcast si
    définis et que le `seasonMode` permet leur affichage
- Ajout d'une classe `required` pour afficher une asterisque sur les champs
  requis

**Fix**

- **14291** - Activation du bouton de génération de la transcription suite à
  correction des droits

## 41.7.3 (11/03/2026)

**Features**

- Intégration du composable de vérification des droits

**Fix**

- Correction affichage épisodes à valider pour `PODCAST_VALIDATION`.

## 41.7.2 (10/03/2026)

**Fix**

- Correction tri épisodes dans `PodcastPresentationList`

## 41.7.1 (10/03/2026)

**Fix**

- Correction lecture épisodes sur organisations sécurisées
- Correction prise en compte paramètres SDK smartlink

## 41.7.0 (09/03/2026)

**Features**

- **14298** - Les épisodes à valider sont visibles par défaut quand
  l'utilisateur a les droits nécessaires
- **14299** - Ajout de la plateforme 'Radio France'
- **14301** - Ajout option `smartLink.showOnlyFirstParagraphInDescription` pour
  tronquer la description à un paragraphe dans le SmartLink

**Fix**

- **14235** - Correction affichage images avec caractères spéciaux dans leur nom
- Correctifs visuels smartlink :
  - Force le style du titre pour éviter overrides involontaires
  - Amélioration de l'affichage si le contenu est long
- Ajout du paramètre de recherche `validity`/`vl` dans les props de route

**Misc**

- Mise à jour des dépéndances

## 41.6.1 (04/03/2026)

**Fix**

- Correction code généré de newsletter

## 41.6.0 (03/03/2026)

**Features**

- Le smartlink affiche le lien vers saooti play si le podcastmaker n'est pas
  défini

**Fix**

- Correction écoute épisodes non validés quand connecté

**Misc**

- Ajout utilitaire pour les plateformes de partage

## 41.5.10 (02/03/2026)

**Misc**

- Mise à jour des dépendances

## 41.5.9 (25/02/2026)

**Fix**

- Autorise les utilisateurs `PODCAST_VALIDATION` à voir les épisodes à valider

## 41.5.8 (24/02/2026)

**Fix**

- Correction "Tout sélectionner" du `ClassicMultiselect`

## 41.5.7 (20/02/2026)

**Fix**

- Correction affichage composants utilisant `swiper`

## 41.5.6 (20/02/2026)

**Misc**

- Ajout d'un props pour ajouter une entrée permettant de sélectionner toutes les
  entrées dans `ClassicMultiselect`

## 41.5.5 (16/02/2026)

**Fix**

- Correctif pour la lecture de lives/radio sur Organisation sécurisée sous
  chrome
- Correction affichage critère de filtrage pour épisodes à valider

**Misc**

- Ajout de `frameborder="0"` dans les iframes miniplayer
- Ajustements de composants génériques

## 41.5.4 (12/02/2026)

**Misc**

- Ajouts d'options pour customiser les éléments de `TopBar`
- Ajout d'un slot `bottom` pour `PlaylistPage`

## 41.5.3 (09/02/2026)

**Fix**

- Enregistrement stats d'écoutes pour vidéos Digiteka

**Misc**

- Correction double slash dans sharePath

## 41.5.2 (06/02/2026)

**Misc**

- Remise en place du style correct pour la plupart des boutons boutons
- Export de `PodcastList` de playlists

## 41.5.1 (04/02/2026)

**Fixes**

- Correction d'un problème de lecture des lives sous chrome

## 41.5.0 (02/02/2026)

**Features**

- Paramètres SDK
  - Il est maintenant possible de changer le critère de tri dans les résultats
    de recherche

**Fixes**

- `ClassicPopover` se ferme correctement après perte de focus

**Misc**

- Mise à jour du système de tests pour mieux fonctionner avec pinia

## 41.4.2 (28/01/2026)

**Misc**

- Ajout export de composants jusque là non accessibles

## 41.4.1 (26/01/2026)

**Fixes**

- Corrige une anomalie sur les podcastmakers due à une mise à jour de
  l'organisation trop aggressive

## 41.4.0 (26/01/2026)

**Features**

- Paramètres SDK
  - Il est maintenant possible de forcer le filtrage par plusieurs rubrique, et
    non plus seulement une
  - Il est maintenant possible de forcer le filtrage sur des rubriquages exclus
  - Option de configuration pour afficher l'heure de publication des podcasts
    en plus de la date
  - Option de configuration pour limiter le nombre de tags affichés sur les
    pages d'émission et de podcast
  - Option de configuration pour les players en haut de page
  - Option de configuration pour ouvrir le player en grand par défaut
  - Option de configuration pour afficher un message informatif sur l'IA pour
    la transcription dans le player
  - Option de configuration pour ne pas fermer le player à la fin de la lecture
- La page de playlist des podcastmakers affiche maintenant les boutons pour
  s'abonner sur les différentes plateformes

**Fixes**

- Correction affichage bouton play des `PodcastPresentationList` sur mobile

**Misc**

- Ajustements affichage SmartLink
- Ajout de quelques textes localisés

## 42.3.3 (23/01/2026)

**Fixes**

- Correction anomalie pagination sur épisodes

## 42.3.2 (14/01/2026)

**Misc**

- Amélioration du système de plateformes de distribution
  - Les plateformes affichées en bas de page d'émission sont maintenant gérées
    par le frontoffice, et non le sdk
  - Suppression de la localisation des noms, cela empêchait l'usage du
    composable à différents endroits, et n'était pas pertinent (ce sont des
    marques, il n'y a pas de localisation)
- Les erreurs de récupération des commentaires ne renvoient plus sur une page
  d'erreur

## 41.3.1 (09/01/2026)

**Features**

- Recherche avancée
  - Ajout du filtrage par groupe sur les émissions
  - Ajustement filtrage par groupe sur les podcasts
- Miniplayer
  - Ajout d'une option de hauteur automatique
- Les liens dans les descriptions s'ouvrent maintenant dans un nouvel onglet

**Fixes**

- Suppression d'un lien SmartLink oublié sur les playlists.
- Correction d'affichage des descriptions html dans les SmartLinks

**Misc**

- Producteur mis à jour lors de la consultation d'une émission/playlist/podcast
  quand non connecté

## 41.3.0 (09/01/2026)

**Features**

- Affichage des flux RSS définis sur les playlists
- Ajout d'une page de smartlink pour les émissions et les playlists
  - Affiche les informations de base de l'émission/la playlist
  - Affiche les liens vers les différents diffuseurs définis
  - Affiche un bouton de lecture du dernier épisode
  - Affiche un lien vers le podcastmaker, si défini
- Mise en place d'un système de layouts (cf [documentation](./doc/routing.md))
- Plateformes de distribution
  - Factorisation du code pour simplifier la réutilisation
  - Mise en place du composable `useSharePlatforms`
  - Ajout de PodBean, Podcast Republic, et Castbox
- Ajout du composable `useSharePath`
  - Regroupe la logique pour le calcul des paths pour les liens partagés

**Misc**

- Début de [doc](./doc/README.md)
- Début mise en place de tests unitaires

## 41.2.1 (05/01/2026)

**Fixes**

- Recherche avancée
  - Correction chargements groupes & ayants-droits depuis routing
  - Filtrage des groupes par organisation

**Misc**

- Export des routes principales pour réutilisation dans projets incluant le SDK

## 41.2.0 (05/01/2026)

**Features**

- Ajout d'un système de notifications
  - Intégrez `ClassicNotification` dans la vue principale pour afficher les
    notifications
  - Utilisez le composable `useNotifications` pour contrôler l'affichage des
    notification depuis n'importe quel composant
- Ajout du composant `ClassicDataTable` pour afficher des tableaux de données
  facilement
- Ajout du composant `ActionButton` pour faire un bouton déclenchant une action,
  avec confirmation optionnelle
- Ajout du composant `ClassicBigChip` pour afficher des éléments simples
- Ajout du composant `EmissionGroupChooser` pour sélectionner un groupe
  d'émissions parmis ceux définis
- Ajout de la bibliothèque d'icones `src/components/icons.ts` pour uniformiser
  les icones au sein des différents projets
- Ajout de l'API groupes
- Ajout du filtrage par groupe sur les podcasts

**Fixes**

- Les mots-clés définis à la fois sur une émission et sur un épisode de cette
  émissions ne s'affichent qu'une seule fois lors de la consultation de cet
  épisode
- Le bouton de lecture vidéo ne disparait plus quand on lit une autre vidéo
- Correction des épisodes avec vidéos n'apparaissant plus lors de la
  consultation des émissions
- `ClassicHelpButton` utilise le string `relative-class` au lieu du booléen
  `relative` pour déterminer l'élément parent.

## 41.1.15 (19/12/2025)

**Fixes**

- Correction de l'affichage de certaines émission sur iPhone

**Misc**

- Troncature des descriptions d'émissions sur mobile

## 41.1.14 (18/12/2025)

**Misc**

- Ajustements affichage pour smartphones

## 41.1.13 (18/12/2025)

**Misc**

- Ajustements affichage pour smartphones

## 41.1.12 (18/12/2025)

**Feature**

- Ajout option de configuration dans `SdkParam` pour désactiver l'affichage des
  mots-clés.

## 41.1.11 (16/12/2025)

**Misc**

- Export de `ClassicWysiwyg`

## 41.1.10 (15/12/2025)

**Misc**

- Les pages d'émissions et d'épisodes peuvent afficher le titre de l'émission
  en header
- Ajustement pour assurer l'affichage d'épisodes d'émissions différentes dans
  `PodcastPresentationList`.

**Fixes**

- Correction d'un problème de lecture des lives sous Firefox

## 41.1.9 (11/12/2025)

**Fixes**

- Correction recherche dans `PodcastList`

## 41.1.8 (10/12/2025)

**Fixes**

- Correction recherche dans `PodcastList`

## 41.1.7 (10/12/2025)

**Misc**

- Ajout API podcast
- Utilisation search V2 pour les podcasts

## 41.1.6 (10/12/2025)

**Fixes**

- `playlistApi.getContentFull` ne récupère chaque émission & organisation qu'une
  seule fois

## 41.1.5 (10/12/2025)

**Misc**

- Ajout API playlist, emission, et organisation
- Utilisation content V2 pour la récupération du contenu des playlist

## 41.1.4 (04/12/2025)

**Misc**

- Passage de `pinia` à version `>=2.3.0`
  - *Podcastmaker* utilise la version `^2.3.0`
  - *Frontoffice* utilise la version `^3.0.3`

## 41.1.3 (04/12/2025)

**Misc**

- Les épisodes peuvent être écoutés dès qu'ils ne sont plus au statut "Planned"

## 41.1.2 (03/12/2025)

**Fixes**

- Correction lien de `EmissionPresentationItem`

## 41.1.1 (01/12/2025)

**Fixes**

- Passage de `pinia` en *peerDependency*

## 41.1.0 (01/12/2025)

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
