import sdkConfig from './eslint-config.mjs';

export default [
    ...sdkConfig,
    // SDK-only: the package must not import itself (consumers sharing
    // eslint-config.mjs legitimately import it, so this rule stays here)
    {
        files: ['**/*.{ts,vue}'],
        rules: {
            "no-restricted-imports": ['error', {
                paths: [{
                    name: '@saooti/octopus-sdk',
                    message: 'Use a relative or "@/" import inside the SDK.'
                }],
                patterns: [{
                    group: ['@saooti/octopus-sdk/*'],
                    message: 'Use a relative or "@/" import inside the SDK.'
                }]
            }]
        }
    }
];
