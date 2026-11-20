import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/helper/fetchHelper', () => ({
    default: { createAuthenticatedFetchHeader: vi.fn().mockResolvedValue({ Authorization: 'Bearer token' }) }
}));

import downloadHelper from '@/helper/downloadHelper';

/** Minimal XMLHttpRequest stand-in, outcome chosen per test */
class FakeXhr {
    static instance: FakeXhr;
    static outcome: 'load' | 'error' = 'load';
    static status = 200;
    status = 0;
    response: Blob = new Blob(['audio']);
    responseType = '';
    url = '';
    headers: Record<string, string> = {};
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor() { FakeXhr.instance = this; }
    open(_method: string, url: string) { this.url = url; }
    setRequestHeader(name: string, value: string) { this.headers[name] = value; }
    send() {
        if ('error' === FakeXhr.outcome) {
            this.onerror?.();
            return;
        }
        this.status = FakeXhr.status;
        this.onload?.call(this);
    }
}

describe('downloadHelper', () => {
    let clicked: Array<{ href: string, download: string }>;

    beforeEach(() => {
        FakeXhr.outcome = 'load';
        FakeXhr.status = 200;
        clicked = [];
        vi.stubGlobal('XMLHttpRequest', FakeXhr);
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            clicked.push({ href: this.getAttribute('href') ?? '', download: this.download });
        });
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:file');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('saves the downloaded blob under the given name', async () => {
        await downloadHelper.onDownload('https://cdn.example.com/a.mp3', 'Mon épisode.mp3', false);
        expect(clicked).toEqual([{ href: 'blob:file', download: 'Mon_épisode.mp3' }]);
        expect(document.querySelector('a')).toBeNull();
    });

    it('sends the Authorization header only with auth', async () => {
        await downloadHelper.onDownload('https://api.example.com/f.pdf', 'f.pdf');
        expect(FakeXhr.instance.headers).toEqual({ Authorization: 'Bearer token' });
        await downloadHelper.onDownload('https://cdn.example.com/a.mp3', 'a.mp3', false);
        expect(FakeXhr.instance.headers).toEqual({});
    });

    it('falls back to the backend proxy on a network error', async () => {
        FakeXhr.outcome = 'error';
        await downloadHelper.onDownload('https://cdn.example.com/a b.mp3?x=1&y=2', 'Mon épisode.mp3', false, true);
        expect(clicked).toHaveLength(1);
        const link = new URL(clicked[0].href, 'https://fo.example.com');
        expect(link.pathname).toBe('/download/url');
        expect(link.searchParams.get('param')).toBe('https://cdn.example.com/a b.mp3?x=1&y=2');
        expect(link.searchParams.get('name')).toBe('Mon_épisode.mp3');
        expect(clicked[0].download).toBe('Mon_épisode.mp3');
    });

    it('rejects on a network error without fallback', async () => {
        FakeXhr.outcome = 'error';
        await expect(downloadHelper.onDownload('https://cdn.example.com/a.mp3', 'a.mp3', false)).rejects.toThrow('Download failed');
        expect(clicked).toEqual([]);
    });

    it('rejects on a non-200 status, even with fallback', async () => {
        FakeXhr.status = 404;
        await expect(downloadHelper.onDownload('https://cdn.example.com/a.mp3', 'a.mp3', false, true)).rejects.toThrow('status 404');
        expect(clicked).toEqual([]);
    });
});
