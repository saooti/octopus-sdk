import { describe, it, expect, afterEach } from 'vitest';
import { getLanguage } from '../../src/helper/language';

function setNavigatorLanguage(lang: string) {
    Object.defineProperty(navigator, 'language', {
        value: lang,
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
                ['en-US', 'en'],
                ['it-IT', 'it'],
                ['sl-SI', 'sl'],
                ['de-DE', 'de'],
                ['es-ES', 'es'],
                ['fr-FR', 'fr'],
                ['ja-JP', 'fr'],
            ])('returns "%s" for navigator language %s', (navigatorLang, expected) => {
                setNavigatorLanguage(navigatorLang);
                expect(getLanguage()).toBe(expected);
            });
        });
    });
});
