# Routing

octopus-sdk se base sur `vue-router` pour mettre en place le routing de
l'application.

Il est cependant nécessaire de faire une mise en place particulière pour
le bon fonctionnement de l'application.

## Mise en place du routing

Les routes sont définies de manière standard dans octopus-sdk, dans le fichier
`src/router/routes.ts`. Ces routes sont exportées, afin de pouvoir être
intégrées dans les applications s'appuyant sur le sdk.

Afin d'appliquer la logique propre aux routes, il est nécessaire d'appeler la
fonction utilitaire `setupRouter` (définie dans `src/router/utils.ts`).
Celle-ci se charge de mettre en place des navigation guards, en particulier
pour la gestion du productor actif.

Un exemple d'appel est disponible dans `src/router/router.ts`.

## Layouts

octopus-sdk inclu un système de layouts permettant de simplement modifier la
façon dont les pages sont affichées.

Par défaut, les pages utilisent le layout défini lors de l'appel à
`setupRouter`.

Il est cependant possible d'écraser ce layout en rajoutant une propriété
`layout` aux `meta` de la route. Cela permet par exemple de créer une page
n'affichage pas le header ou le footer standard de l'application.

Exemple d'usage :

```ts
{
  path: '/my/new/page',
  component: Page,
  meta: {
    title: 'Title of page with custom layout',
    layout: () => import('../layouts/MyCustomLayout.vue')
  }
}
```

Dans ce cas, la page `/my/new/page` n'utilisera pas le layout par défaut,
mais celui de `../layouts/MyCustomLayout.vue`.

Des exemples de layouts sont définis dans `src/layouts`.
