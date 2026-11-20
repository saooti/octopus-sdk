import { afterEach, describe, expect, it, vi } from 'vitest';
import logoutHelper from '@/helper/logoutHelper';

describe('logoutHelper', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        document.querySelectorAll('form[action$="/logout"]').forEach((form) => form.remove());
    });

    it('submits a hidden POST form to /logout', () => {
        const submit = vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
        logoutHelper.logout();

        const form = document.querySelector<HTMLFormElement>('form[action$="/logout"]');
        expect(form).not.toBeNull();
        expect(form?.method).toBe('post');
        expect(form?.hidden).toBe(true);
        expect(submit).toHaveBeenCalledOnce();
    });
});
