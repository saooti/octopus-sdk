<template>
    <h1>Déclaration d'accessibilité</h1>

    <h2>État de conformité</h2>
    <p>
        Le site {{ url }} est {{ conformite }} avec le Référentiel Général
        d’Amélioration de l’Accessibilité (RGAA) version 4, en raison des
        non-conformités énumérées ci-dessous.
    </p>

    <h2> Résultats des tests</h2>
    <p>
        L’audit de conformité réalisé en interne révèle que :

        <ul>
            <li>{{ pourcentageOK }}% des critères RGAA sont respectés</li>
            <li>{{ nbKO }} critères sont non conformes</li>
            <li>{{ nbNonApplicables }} critères sont non applicables</li>
        </ul>
    </p>

    <h2>Contenus non accessibles</h2>
    <p>
        Les contenus listés ci-dessous ne sont pas accessibles pour les raisons suivantes :

        <!-- TODO -->
        Non-conformités

            Critère 8.2 :
            Certains contenus ne respectent pas les règles de validité du code HTML, ce qui peut entraîner des difficultés d’interprétation par les technologies d’assistance.

            Critère 12.7 :
            La navigation au clavier n’est pas toujours visible, ce qui peut rendre difficile l’utilisation du site pour les personnes naviguant sans souris.
    </p>

    <h2>Contenus non soumis à l’obligation d’accessibilité</h2>
    <p>
        Les {{ nbNonApplicables}} critères non applicables correspondent à des
        fonctionnalités ou contenus absents du site (par exemple : médias
        temporels, cartes interactives, formulaires complexes, documents
        bureautiques, etc.).
    </p>

    <h2>Établissement de cette déclaration d’accessibilité</h2>
    <p>
        Cette déclaration a été établie le {{ date }}.
    </p>

    <h2>Technologies utilisées pour la réalisation du site</h2>
    <p>
        <ul>
            <li>HTML5</li>
            <li>CSS</li>
            <li>TypeScript</li>
            <li>Vue.js</li>
        </ul>
    </p>

    <h2>Environnement de test</h2>

Les vérifications de restitution de contenus ont été réalisées avec les configurations suivantes :

    Navigateurs : Firefox, Chrome, Safari

    Systèmes d’exploitation : Windows, macOS

Amélioration et contact

Si vous constatez un défaut d’accessibilité vous empêchant d’accéder à un contenu ou à une fonctionnalité du site, vous pouvez nous contacter à partir de la page Nous contacter.

Nous nous engageons à vous répondre dans un délai raisonnable.

Voies de recours

Si vous constatez un défaut d’accessibilité qui vous empêche d’accéder à un contenu ou une fonctionnalité du site, que vous nous l’avez signalé et que vous n’avez pas obtenu de réponse satisfaisante, vous pouvez :

    Écrire à la Défenseure des droits

    Utiliser le formulaire de contact : https://www.defenseurdesdroits.fr

    Appeler le 09 69 39 00 00
</template>

<script setup lang="ts">
import { ref } from 'vue';

const url = ref('');
const conformite = ref('partiellement conforme');
</script>
