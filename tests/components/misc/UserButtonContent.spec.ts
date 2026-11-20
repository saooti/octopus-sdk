import { mockUseRouter, mockI18n } from '@tests/mocks';
vi.mock('vue-router', () => ({
    ...mockUseRouter(),
    useRoute: () => ({ path: '/podcasts', query: {}, fullPath: '/podcasts?a=1&b=2#top' })
}));
vi.mock('vue-i18n', () => mockI18n());

const { mockLogout } = vi.hoisted(() => ({ mockLogout: vi.fn() }));
vi.mock('@/helper/logoutHelper', () => ({ default: { logout: mockLogout } }));

import UserButtonContent from '@/components/misc/UserButtonContent.vue';
import { useApiStore } from '@/stores/ApiStore';
import { useAuthStore } from '@/stores/AuthStore';
import { mount, setupAuthStore } from '@tests/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

async function mountAuthenticated() {
    return mount(UserButtonContent, {
        stubs: ['ExternalLink'],
        beforeMount: async () => {
            await setupAuthStore()();
            useAuthStore().$patch({ authProfile: { userId: 'user-1' } });
        }
    });
}

describe('UserButtonContent', () => {
    beforeEach(() => {
        mockLogout.mockClear();
    });

    it('offers logout as a button, not a GET link to /logout', async () => {
        const wrapper = await mountAuthenticated();
        const logout = wrapper.findAll('button').find((button) => 'Logout' === button.text());
        expect(logout?.attributes('type')).toBe('button');
        expect(wrapper.find('a[href="/logout"]').exists()).toBe(false);
    });

    it('logs out with the POST helper on click', async () => {
        const wrapper = await mountAuthenticated();
        const logout = wrapper.findAll('button').find((button) => 'Logout' === button.text());
        await logout?.trigger('click');
        expect(mockLogout).toHaveBeenCalledOnce();
    });

    it('sends the whole current URL as the login redirect', async () => {
        const wrapper = await mount(UserButtonContent, {
            stubs: ['ExternalLink'],
            beforeMount: async () => {
                await setupAuthStore()();
                useApiStore().$patch({ frontendUrl: 'https://fo.example.com' });
            }
        });
        const href = wrapper.find('a[href^="/sso/login"]').attributes('href') ?? '';
        const redirect = new URL(href, 'https://fo.example.com').searchParams.get('redirect_url');
        expect(redirect).toBe('https://fo.example.com/podcasts?a=1&b=2#top');
    });
});
