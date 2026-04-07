import { describe, it, expect, afterEach } from 'vitest';
import { getLanguage } from '../../src/helper/language';

function setNavigatorLanguage(lang: string) {
    Object.defineProperty(navigator, 'languages', {
        value: [lang],
        configurable: true,
    });
}

describe('language', () => {
    afterEach(() => {
        document.cookie = 'octopus-language=; Max-Age=0';
        setNavigatorLanguage('fr-FR');
    });

    describe('getLanguage', () => {
        describe('cookie-based detection', () => {
            it('returns the language from the octopus-language cookie', () => {
                document.cookie = 'octopus-language=de';
                expect(getLanguage()).toBe('de');
            });

            it('trims leading spaces from the cookie value', () => {
                document.cookie = 'octopus-language=it';
                expect(getLanguage()).toBe('it');
            });
        });

        describe('navigator-based detection', () => {
            it.each([
                { input: 'en-US', expected: 'en' },
                { input: 'it-IT', expected: 'it' },
                { input: 'sl-SI', expected: 'sl' },
                { input: 'de-DE', expected: 'de' },
                { input: 'es-ES', expected: 'es' },
                { input: 'fr-FR', expected: 'fr' },
                { input: 'ja-JP', expected: 'fr' }
            ])('returns "$expected" for navigator language $input', ({ input , expected }) => {
                setNavigatorLanguage(input);
                expect(getLanguage()).toBe(expected);
            });
        });
    });
});
