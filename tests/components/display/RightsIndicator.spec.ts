// Must be before any other imports so vitest can hoist the mock correctly.
// We override the i18n mock here (rather than importing @tests/mocks/i18n)
// because RightsIndicator also calls `te`, which the shared mock does not provide.
import { vi } from 'vitest';

vi.mock('vue-i18n', () => {
    const { ref } = require('vue');
    // `te` returns true for entity-specific keys so we can verify that branch.
    return {
        useI18n: () => ({
            t: (key: string) => key,
            te: (key: string) => key.startsWith('RightsIndicator -'),
            locale: ref('fr')
        }),
        createI18n: () => {}
    };
});

import { describe, expect, it } from 'vitest';
import { mount, setupAuthStore } from '@tests/utils';
import { useAuthStore } from '@/stores/AuthStore';
import RightsIndicator from '@/components/display/RightsIndicator.vue';
import type { Podcast } from '@/stores/class/general/podcast';
import type { Mix } from '@/stores/class/radio/mix';
import type { PlaylistMedia } from '@/stores/class/radio/playlistMedia';
import type { Cartouchier } from '@/stores/class/cartouchier/cartouchier';
import type { Media } from '@/stores/class/general/media';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const ownUserId = 'test-user-123';

const ownPodcast = { podcastId: 1, createdByUserId: ownUserId, valid: true } as Podcast;
const otherPodcast = { podcastId: 2, createdByUserId: 'other-user', valid: true } as Podcast;

const ownCartouchier = {
    cartouchierId: 1, ownerId: ownUserId,
    title: 'c', organisationId: 'o', cartouches: {}
} as Cartouchier;
const otherCartouchier = {
    cartouchierId: 2, ownerId: 'other-user',
    title: 'c', organisationId: 'o', cartouches: {}
} as Cartouchier;

const ownMix = {
    mixId: 1, ownerId: ownUserId,
    color: '', description: '', name: '', organisationId: 'o', samplings: []
} as Mix;
const otherMix = {
    mixId: 2, ownerId: 'other-user',
    color: '', description: '', name: '', organisationId: 'o', samplings: []
} as Mix;

const ownPlaylistMedia = {
    playlistId: 1, ownerId: ownUserId,
    color: '', description: '', name: '', organisationId: 'o', medias: []
} as PlaylistMedia;
const otherPlaylistMedia = {
    playlistId: 2, ownerId: 'other-user',
    color: '', description: '', name: '', organisationId: 'o', medias: []
} as PlaylistMedia;

const ownMedia = { mediaId: 1, ownerId: ownUserId } as Media;
const otherMedia = { mediaId: 2, ownerId: 'other-user' } as Media;

// ── Helper ───────────────────────────────────────────────────────────────────

async function mountWith(props: Record<string, unknown>, roles: string[]) {
    return mount(RightsIndicator, {
        props: { text: true, ...props },
        beforeMount: async () => {
            await setupAuthStore({ roles })();
            useAuthStore().$patch({
                authProfile: { userId: ownUserId },
                authParam: { accessToken: 'test-token', refreshToken: undefined, expiration: undefined },
            });
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
describe('RightsIndicator', () => {

    // ── Entity detection ─────────────────────────────────────────────────────
    describe('entity detection', () => {
        it('detects podcast entity and grants access for privileged role', async () => {
            const wrapper = await mountWith({ action: 'create', podcast: ownPodcast }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('detects cartouchier entity and grants access for privileged role', async () => {
            const wrapper = await mountWith({ action: 'create', cartouchier: ownCartouchier }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('detects mix entity and grants access for privileged role', async () => {
            const wrapper = await mountWith({ action: 'create', mix: ownMix }, ['ADMIN']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('detects playlistMedia entity and grants access for privileged role', async () => {
            const wrapper = await mountWith({ action: 'create', playlistMedia: ownPlaylistMedia }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('detects media entity and grants access for privileged role', async () => {
            const wrapper = await mountWith({ action: 'create', media: ownMedia }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('shows alert when entity prop is boolean false (no entity)', async () => {
            // `podcast: false` — no real entity, so entity segment is undefined → DeniedNoRight
            const wrapper = await mountWith({ action: 'create', podcast: false }, ['ADMIN']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });
    });

    // ── action = 'create' ────────────────────────────────────────────────────
    describe("action = 'create'", () => {
        it('hides alert when user has create right for podcast', async () => {
            const wrapper = await mountWith({ action: 'create', podcast: ownPodcast }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('shows alert when user lacks create right for podcast', async () => {
            const wrapper = await mountWith({ action: 'create', podcast: ownPodcast }, ['PLAYLISTS']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });

        it('hides alert when user has create right for mix', async () => {
            const wrapper = await mountWith({ action: 'create', mix: ownMix }, ['RADIO']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('shows alert when user lacks create right for mix', async () => {
            // PRODUCTION is not in the mix create allowlist (only ADMIN and RADIO)
            const wrapper = await mountWith({ action: 'create', mix: ownMix }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });

        it('hides alert when user has create right for media', async () => {
            const wrapper = await mountWith({ action: 'create', media: ownMedia }, ['RADIO']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('shows alert when user lacks create right for media', async () => {
            const wrapper = await mountWith({ action: 'create', media: ownMedia }, ['PLAYLISTS']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });
    });

    // ── action = 'edit' ──────────────────────────────────────────────────────
    describe("action = 'edit'", () => {
        it('hides alert when user can edit their own podcast', async () => {
            const wrapper = await mountWith({ action: 'edit', podcast: ownPodcast }, ['RESTRICTED_PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('shows alert when restricted user cannot edit another user\'s podcast', async () => {
            const wrapper = await mountWith({ action: 'edit', podcast: otherPodcast }, ['RESTRICTED_PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });

        it('returns DeniedNoRight when arg is boolean true (not an object)', async () => {
            // edit/delete require a real entity object; a boolean is rejected
            const wrapper = await mountWith({ action: 'edit', podcast: true as unknown as Podcast }, ['ADMIN']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });

        it('hides alert when admin edits another user\'s cartouchier', async () => {
            const wrapper = await mountWith({ action: 'edit', cartouchier: otherCartouchier }, ['ADMIN']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('shows alert when restricted user edits another user\'s cartouchier', async () => {
            const wrapper = await mountWith({ action: 'edit', cartouchier: otherCartouchier }, ['RESTRICTED_PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });

        it('hides alert when admin edits another user\'s media', async () => {
            const wrapper = await mountWith({ action: 'edit', media: otherMedia }, ['ADMIN']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('shows alert when restricted user edits another user\'s media', async () => {
            const wrapper = await mountWith({ action: 'edit', media: otherMedia }, ['RESTRICTED_PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });
    });

    // ── action = 'delete' ────────────────────────────────────────────────────
    describe("action = 'delete'", () => {
        it('hides alert when user can delete their own playlistMedia', async () => {
            const wrapper = await mountWith({ action: 'delete', playlistMedia: ownPlaylistMedia }, ['RESTRICTED_ANIMATION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('shows alert when restricted user deletes another user\'s playlistMedia', async () => {
            const wrapper = await mountWith({ action: 'delete', playlistMedia: otherPlaylistMedia }, ['RESTRICTED_ANIMATION']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });

        it('returns DeniedNoRight when arg is boolean true (not an object)', async () => {
            const wrapper = await mountWith({ action: 'delete', mix: true as unknown as Mix }, ['ADMIN']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });
    });

    // ── action = 'any' with object arg ───────────────────────────────────────
    describe("action = 'any' with object arg", () => {
        it('returns Allowed if Create check passes (short-circuits on first Allowed)', async () => {
            // RESTRICTED_ANIMATION can create cartouchier → returns Allowed immediately
            const wrapper = await mountWith({ action: 'any', cartouchier: otherCartouchier }, ['RESTRICTED_ANIMATION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('returns Allowed when all three checks (Create/Edit/Delete) pass', async () => {
            const wrapper = await mountWith({ action: 'any', podcast: ownPodcast }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('returns DeniedNoRight when no check passes and no DeniedNotOwner accrues', async () => {
            // PLAYLISTS has no right for mix at all → stays at DeniedNoRight
            const wrapper = await mountWith({ action: 'any', mix: otherMix }, ['PLAYLISTS']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });
    });

    // ── action = 'any' with boolean arg ─────────────────────────────────────
    describe("action = 'any' with boolean arg", () => {
        it('only checks Create when arg is boolean true, grants access when allowed', async () => {
            // RADIO can create mix
            const wrapper = await mountWith({ action: 'any', mix: true as unknown as Mix }, ['RADIO']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('only checks Create when arg is boolean true, shows alert when denied', async () => {
            // PLAYLISTS cannot create mix
            const wrapper = await mountWith({ action: 'any', mix: true as unknown as Mix }, ['PLAYLISTS']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });
    });

    // ── message computation ──────────────────────────────────────────────────
    describe('message computation', () => {
        it('renders nothing when hasAccess is true (ActionRight.Allowed)', async () => {
            const wrapper = await mountWith({ action: 'create', podcast: ownPodcast }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('renders "insufficient rights" for ActionRight.DeniedNoRight', async () => {
            const wrapper = await mountWith({ action: 'create', podcast: ownPodcast }, ['PLAYLISTS']);
            expect(wrapper.text()).toContain('insufficient rights');
        });

        it('renders entity-specific i18n key for ActionRight.DeniedNotOwner on podcast', async () => {
            // te('RightsIndicator - Podcast - Not owner') returns true per our mock
            const wrapper = await mountWith({ action: 'edit', podcast: otherPodcast }, ['RESTRICTED_PRODUCTION']);
            expect(wrapper.text()).toContain('RightsIndicator - Podcast - Not owner');
        });

        it('renders entity-specific i18n key for ActionRight.DeniedNotOwner on cartouchier', async () => {
            const wrapper = await mountWith({ action: 'edit', cartouchier: otherCartouchier }, ['RESTRICTED_PRODUCTION']);
            expect(wrapper.text()).toContain('RightsIndicator - Cartouchier - Not owner');
        });

        it('renders entity-specific i18n key for ActionRight.DeniedNotOwner on playlistMedia', async () => {
            const wrapper = await mountWith({ action: 'edit', playlistMedia: otherPlaylistMedia }, ['RESTRICTED_PRODUCTION']);
            expect(wrapper.text()).toContain('RightsIndicator - PlaylistMedia - Not owner');
        });
    });

    // ── hasAccess computed ───────────────────────────────────────────────────
    describe('hasAccess', () => {
        it('is true only for ActionRight.Allowed (hides alert)', async () => {
            const wrapper = await mountWith({ action: 'create', podcast: ownPodcast }, ['PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(false);
        });

        it('is false for ActionRight.DeniedNoRight (shows alert)', async () => {
            const wrapper = await mountWith({ action: 'create', podcast: ownPodcast }, ['PLAYLISTS']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });

        it('is false for ActionRight.DeniedNotOwner (shows alert)', async () => {
            const wrapper = await mountWith({ action: 'edit', podcast: otherPodcast }, ['RESTRICTED_PRODUCTION']);
            expect(wrapper.find('.alert').exists()).toBe(true);
        });
    });

    // ── Method dispatch ───────────────────────────────────────────────────────
    describe('right method dispatch', () => {
        it('calls getCreateCartouchierRight for action=create + cartouchier', async () => {
            // RADIO can create cartouchier
            const allowed = await mountWith({ action: 'create', cartouchier: ownCartouchier }, ['RADIO']);
            expect(allowed.find('.alert').exists()).toBe(false);

            // PLAYLISTS cannot
            const denied = await mountWith({ action: 'create', cartouchier: ownCartouchier }, ['PLAYLISTS']);
            expect(denied.find('.alert').exists()).toBe(true);
        });

        it('calls getDeletePlaylistMediaRight for action=delete + playlistMedia', async () => {
            const allowed = await mountWith({ action: 'delete', playlistMedia: ownPlaylistMedia }, ['ANIMATION']);
            expect(allowed.find('.alert').exists()).toBe(false);

            const denied = await mountWith({ action: 'delete', playlistMedia: ownPlaylistMedia }, ['PLAYLISTS']);
            expect(denied.find('.alert').exists()).toBe(true);
        });

        it('calls getCreateMixRight for action=create + mix', async () => {
            const allowed = await mountWith({ action: 'create', mix: ownMix }, ['ADMIN']);
            expect(allowed.find('.alert').exists()).toBe(false);

            // PRODUCTION is not in the mix create allowlist
            const denied = await mountWith({ action: 'create', mix: ownMix }, ['PRODUCTION']);
            expect(denied.find('.alert').exists()).toBe(true);
        });

        it('calls getDeleteCartouchierRight for action=delete + cartouchier', async () => {
            const allowed = await mountWith({ action: 'delete', cartouchier: ownCartouchier }, ['ANIMATION']);
            expect(allowed.find('.alert').exists()).toBe(false);

            // PODCAST_CRUD on another user's cartouchier → DeniedNotOwner → no access
            const denied = await mountWith({ action: 'delete', cartouchier: otherCartouchier }, ['PODCAST_CRUD']);
            expect(denied.find('.alert').exists()).toBe(true);
        });

        it('calls getEditMediaRight for action=edit + media', async () => {
            const allowed = await mountWith({ action: 'edit', media: ownMedia }, ['RESTRICTED_PRODUCTION']);
            expect(allowed.find('.alert').exists()).toBe(false);

            const denied = await mountWith({ action: 'edit', media: otherMedia }, ['RESTRICTED_PRODUCTION']);
            expect(denied.find('.alert').exists()).toBe(true);
        });

        it('calls getDeleteMediaRight for action=delete + media', async () => {
            const allowed = await mountWith({ action: 'delete', media: ownMedia }, ['PODCAST_CRUD']);
            expect(allowed.find('.alert').exists()).toBe(false);

            const denied = await mountWith({ action: 'delete', media: otherMedia }, ['PODCAST_CRUD']);
            expect(denied.find('.alert').exists()).toBe(true);
        });
    });
});
