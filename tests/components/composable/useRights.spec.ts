import { describe, expect, it } from 'vitest';
import { setupPinia, setupAuthStore } from '@tests/utils';
import { mockEmission, mockPodcast } from '@tests/mocks/rights';
import { useAuthStore } from '@/stores/AuthStore';
import { useRights, ActionRight } from '@/components/composable/useRights';
import type { Organisation } from '@/stores/class/general/organisation';
import type { Emission } from '@/stores/class/general/emission';
import type { Podcast } from '@/stores/class/general/podcast';
import type { Mix } from '@/stores/class/radio/mix';
import { PlaylistMedia } from '@/stores/class/radio/playlistMedia';
import { Cartouchier } from '@/stores/class/cartouchier/cartouchier';
import type { Media } from '@/stores/class/general/media';
import type { Rubrique } from '@/stores/class/rubrique/rubrique';

async function setup(roles: string[], userId = 'test-user-123', scope: Array<number> = []): Promise<void> {
    setupPinia();
    await setupAuthStore({ roles })();
    useAuthStore().$patch({ authProfile: { userId, scope } });
}

describe('useRights', () => {
    describe('Emission permissions', () => {
        describe('canCreateEmission', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canCreateEmission()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canCreateEmission()).toBe(false);
            });
        });

        describe('canEditEmission', () => {
            it('allows ADMIN to edit any emission', async () => {
                await setup(['ADMIN']);
                expect(useRights().canEditEmission(mockEmission({ createdByUserId: 'other-user' }))).toBe(true);
            });

            it('allows RESTRICTED_PRODUCTION to edit own emission', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canEditEmission(mockEmission({ createdByUserId: 'test-user-123' }))).toBe(true);
            });

            it('denies RESTRICTED_PRODUCTION editing others\' emission', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canEditEmission(mockEmission({ createdByUserId: 'other-user' }))).toBe(false);
            });

            it('allows editing new emissions if can create', async () => {
                await setup(['PRODUCTION']);
                const newEmission = {
                    emissionId: undefined,
                    beneficiaries: [],
                    description: '',
                    monetisable: false,
                    name: 'New Emission',
                    orga: {} as Organisation,
                    rubriqueIds: []
                } as unknown as Emission;
                expect(useRights().canEditEmission(newEmission)).toBe(true);
            });
        });

        describe('canDeleteEmission', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canDeleteEmission(mockEmission({}))).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canDeleteEmission(mockEmission({}))).toBe(false);
            });
        });
    });

    describe('Podcast permissions', () => {
        describe('canCreatePodcast', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canCreatePodcast()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canCreatePodcast()).toBe(false);
            });
        });

        describe('canDuplicatePodcast', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canDuplicatePodcast()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canDuplicatePodcast()).toBe(false);
            });
        });

        describe('canEditPodcast', () => {
            const ownPodcast = mockPodcast({ createdByUserId: 'test-user-123', valid: true });
            const otherPodcast = mockPodcast({ createdByUserId: 'other-user', valid: true });

            ['ADMIN', 'ORGANISATION', 'PRODUCTION'].forEach(role => {
                it(`allows ${role} to edit any podcast`, async () => {
                    await setup([role]);
                    expect(useRights().canEditPodcast(otherPodcast)).toBe(true);
                });
            });

            it('allows PODCAST_CRUD to edit own non-valid podcast', async () => {
                await setup(['PODCAST_CRUD']);
                const podcast = mockPodcast({ valid: false, publisher: { userId: 'test-user-123' } });
                expect(useRights().canEditPodcast(podcast)).toBe(true);
            });

            it('denies PODCAST_CRUD editing own valid podcast', async () => {
                await setup(['PODCAST_CRUD']);
                const podcast = mockPodcast({ valid: true, publisher: { userId: 'test-user-123' } });
                expect(useRights().canEditPodcast(podcast)).toBe(false);
            });

            it('denies PODCAST_CRUD editing others\' podcast', async () => {
                await setup(['PODCAST_CRUD']);
                const podcast = mockPodcast({ valid: false, publisher: { userId: 'other-user' } });
                expect(useRights().canEditPodcast(podcast)).toBe(false);
            });

            ['RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'].forEach(role => {
                it(`allows ${role} to edit own podcast`, async () => {
                    await setup([role]);
                    expect(useRights().canEditPodcast(ownPodcast)).toBe(true);
                });

                it(`denies ${role} editing others' podcast`, async () => {
                    await setup([role]);
                    expect(useRights().canEditPodcast(otherPodcast)).toBe(false);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canEditPodcast(ownPodcast)).toBe(false);
            });

            // Regression: RESTRICTED_* must take priority over PODCAST_CRUD when both roles are present.
            ['RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'].forEach(role => {
                it(`allows ${role} + PODCAST_CRUD to edit own valid podcast`, async () => {
                    await setup([role, 'PODCAST_CRUD']);
                    const podcast = mockPodcast({ createdByUserId: 'test-user-123', valid: true, publisher: { userId: 'test-user-123' } });
                    expect(useRights().canEditPodcast(podcast)).toBe(true);
                });
            });

            it('denies RESTRICTED_PRODUCTION + PODCAST_CRUD editing others\' valid podcast', async () => {
                await setup(['RESTRICTED_PRODUCTION', 'PODCAST_CRUD']);
                const podcast = mockPodcast({ createdByUserId: 'other-user', valid: true, publisher: { userId: 'other-user' } });
                expect(useRights().canEditPodcast(podcast)).toBe(false);
            });
        });

        describe('canDeletePodcast', () => {
            it('delegates to canEditPodcast', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canDeletePodcast(mockPodcast({ createdByUserId: 'test-user-123'}))).toBe(true);
                expect(useRights().canDeletePodcast(mockPodcast({ createdByUserId: 'other-user' }))).toBe(false);
            });
        });

        describe('canValidatePodcast', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'PODCAST_VALIDATION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canValidatePodcast()).toBe(true);
                });
            });

            ['PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'PLAYLISTS'].forEach(role => {
                it(`denies ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canValidatePodcast()).toBe(false);
                });
            });
        });
    });

    describe('Playlist permissions', () => {
        ['canCreatePlaylist', 'canEditPlaylist', 'canDeletePlaylist'].forEach(method => {
            describe(method, () => {
                ['ADMIN', 'ORGANISATION', 'PLAYLISTS'].forEach(role => {
                    it(`allows ${role}`, async () => {
                        await setup([role]);
                        expect(useRights()[method as 'canCreatePlaylist']()).toBe(true);
                    });
                });

                it('denies unrelated roles', async () => {
                    await setup(['PRODUCTION']);
                    expect(useRights()[method as 'canCreatePlaylist']()).toBe(false);
                });
            });
        });
    });

    describe('Participant permissions', () => {
        describe('canCreateParticipant', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canCreateParticipant()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canCreateParticipant()).toBe(false);
            });
        });

        ['canEditParticipant', 'canDeleteParticipant'].forEach(method => {
            describe(method, () => {
                ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RESTRICTED_PRODUCTION'].forEach(role => {
                    it(`allows ${role}`, async () => {
                        await setup([role]);
                        expect(await useRights()[method as 'canEditParticipant'](123)).toBe(true);
                    });
                });

                it('allows undefined id (new participant)', async () => {
                    await setup(['RESTRICTED_PRODUCTION']);
                    expect(await useRights()[method as 'canEditParticipant'](undefined)).toBe(true);
                });

                it('denies unrelated roles for existing participant', async () => {
                    await setup(['PLAYLISTS']);
                    expect(await useRights()[method as 'canEditParticipant'](123)).toBe(false);
                });
            });
        });
    });

    describe('canEditTranscript', () => {
        const ownPodcast = mockPodcast({ createdByUserId: 'test-user-123' });
        const otherPodcast = mockPodcast({ createdByUserId: 'other-user' });

        ['ADMIN', 'ORGANISATION', 'PRODUCTION'].forEach(role => {
            it(`allows ${role} to edit transcript of any podcast`, async () => {
                await setup([role]);
                expect(useRights().canEditTranscript(otherPodcast)).toBe(true);
            });
        });

        ['RESTRICTED_PRODUCTION', 'PODCAST_CRUD'].forEach(role => {
            it(`${role} can only edit transcript of own podcast`, async () => {
                await setup([role]);
                expect(useRights().canEditTranscript(ownPodcast)).toBe(true);
                expect(useRights().canEditTranscript(otherPodcast)).toBe(false);
            });
        });

        it('denies unrelated roles', async () => {
            await setup(['RESTRICTED_ANIMATION']);
            expect(useRights().canEditTranscript(ownPodcast)).toBe(false);
        });
    });

    describe('canEditTranslation', () => {
        const ownPodcast = mockPodcast({ createdByUserId: 'test-user-123' });
        const otherPodcast = mockPodcast({ createdByUserId: 'other-user' });

        ['ADMIN', 'ORGANISATION', 'PRODUCTION'].forEach(role => {
            it(`allows ${role} to edit transcript of any podcast`, async () => {
                await setup([role]);
                expect(useRights().canEditTranslation(otherPodcast)).toBe(true);
            });
        });

        ['RESTRICTED_PRODUCTION', 'PODCAST_CRUD'].forEach(role => {
            it(`${role} can only edit transcript of own podcast`, async () => {
                await setup([role]);
                expect(useRights().canEditTranslation(ownPodcast)).toBe(true);
                expect(useRights().canEditTranslation(otherPodcast)).toBe(false);
            });
        });

        it('denies unrelated roles', async () => {
            await setup(['RESTRICTED_ANIMATION']);
            expect(useRights().canEditTranslation(ownPodcast)).toBe(false);
        });
    });

    describe('canEditTranscriptVisibility', () => {
        const ownPodcast = mockPodcast({ createdByUserId: 'test-user-123' });
        const otherPodcast = mockPodcast({ createdByUserId: 'other-user' });

        ['ADMIN', 'ORGANISATION', 'PRODUCTION'].forEach(role => {
            it(`allows ${role} to edit transcript of any podcast`, async () => {
                await setup([role]);
                expect(useRights().canEditTranscriptVisibility(otherPodcast)).toBe(true);
            });
        });

        it('denies unrelated roles', async () => {
            await setup(['PODCAST_CRUD']);
            expect(useRights().canEditTranscriptVisibility(ownPodcast)).toBe(false);
        });

        it('denies PRODUCTION with insufficient scope', async () => {
            await setup(['PRODUCTION'], 'test-user-123', [999]);
            const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
            expect(useRights().canEditTranscriptVisibility(podcast)).toBe(false);
        });
    });

    describe('canEditChaptering', () => {
        it('delegates to canEditPodcast', async () => {
            await setup(['RESTRICTED_PRODUCTION']);
            expect(useRights().canEditChaptering(mockPodcast({ createdByUserId: 'test-user-123', valid: true }))).toBe(true);
            expect(useRights().canEditChaptering(mockPodcast({ createdByUserId: 'other-user', valid: true }))).toBe(false);
        });
    });

    describe('Rubrique/Rubriquage permissions', () => {
        describe('canCreateRubriques', () => {
            ['ADMIN', 'ORGANISATION', 'EDITION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canCreateRubriques()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canCreateRubriques()).toBe(false);
            });
        });

        describe('canEditRubriques', () => {
            ['ADMIN', 'ORGANISATION', 'EDITION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canEditRubriques({ rubriqueId: 1, name: 'Test' } as Rubrique)).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canEditRubriques({ rubriqueId: 1, name: 'Test' } as Rubrique)).toBe(false);
            });
        });
    });

    describe('Aggregator permissions', () => {
        ['canCreateAggregator', 'canEditAggregator', 'canDeleteAggregator'].forEach(method => {
            describe(method, () => {
                ['ADMIN', 'ORGANISATION'].forEach(role => {
                    it(`allows ${role}`, async () => {
                        await setup([role]);
                        expect(useRights()[method as 'canCreateAggregator']()).toBe(true);
                    });
                });

                it('denies unrelated roles', async () => {
                    await setup(['PRODUCTION']);
                    expect(useRights()[method as 'canCreateAggregator']()).toBe(false);
                });
            });
        });
    });

    describe('Cartouchier permissions', () => {
        const ownCartouchier = { ownerId: 'test-user-123' } as Cartouchier;
        const otherCartouchier = { ownerId: 'other-user' } as Cartouchier;
        const noOwnerCartouchier = {} as Cartouchier;

        describe('canCreateCartouchier', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION', 'PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canCreateCartouchier()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canCreateCartouchier()).toBe(false);
            });
        });

        describe('canEditCartouchier', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION'].forEach(role => {
                it(`allows ${role} to edit any element`, async () => {
                    await setup([role]);
                    expect(useRights().canEditCartouchier(otherCartouchier)).toBe(true);
                });
            });

            ['RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION', 'PODCAST_CRUD'].forEach(role => {
                it(`${role} can only edit own element`, async () => {
                    await setup([role]);
                    expect(useRights().canEditCartouchier(ownCartouchier)).toBe(true);
                    expect(useRights().canEditCartouchier(otherCartouchier)).toBe(false);
                    expect(useRights().canEditCartouchier(noOwnerCartouchier)).toBe(false);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canEditCartouchier(ownCartouchier)).toBe(false);
            });
        });

        describe('canDeleteCartouchier', () => {
            it('restricted user can delete own element but not others\'', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canDeleteCartouchier(ownCartouchier)).toBe(true);
                expect(useRights().canDeleteCartouchier(otherCartouchier)).toBe(false);
            });
        });
    });

    describe('Bac/PlaylistMedia permissions', () => {
        const ownBac = { ownerId: 'test-user-123' } as PlaylistMedia;
        const otherBac = { ownerId: 'other-user' } as PlaylistMedia;
        const noOwnerBac = {} as PlaylistMedia;

        describe('canCreatePlaylistMedia', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION', 'PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canCreatePlaylistMedia()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canCreatePlaylistMedia()).toBe(false);
            });
        });

        describe('canEditPlaylistMedia', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION'].forEach(role => {
                it(`allows ${role} to edit any element`, async () => {
                    await setup([role]);
                    expect(useRights().canEditPlaylistMedia(otherBac)).toBe(true);
                });
            });

            ['RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION', 'PODCAST_CRUD'].forEach(role => {
                it(`${role} can only edit own element`, async () => {
                    await setup([role]);
                    expect(useRights().canEditPlaylistMedia(ownBac)).toBe(true);
                    expect(useRights().canEditPlaylistMedia(otherBac)).toBe(false);
                    expect(useRights().canEditPlaylistMedia(noOwnerBac)).toBe(false);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canEditPlaylistMedia(ownBac)).toBe(false);
            });
        });

        describe('canDeletePlaylistMedia', () => {
            it('restricted user can delete own element but not others\'', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canDeletePlaylistMedia(ownBac)).toBe(true);
                expect(useRights().canDeletePlaylistMedia(otherBac)).toBe(false);
            });
        });
    });

    describe('Media permissions', () => {
        const ownMedia = { mediaId: 1, ownerId: 'test-user-123' } as Media;
        const otherMedia = { mediaId: 2, ownerId: 'other-user' } as Media;
        const noOwnerMedia = { mediaId: 3 } as Media;

        describe('canCreateMedia', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION',
             'PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canCreateMedia()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canCreateMedia()).toBe(false);
            });
        });

        describe('canEditMedia', () => {
            ['ADMIN', 'ORGANISATION', 'PRODUCTION', 'RADIO', 'ANIMATION'].forEach(role => {
                it(`allows ${role} to edit any element`, async () => {
                    await setup([role]);
                    expect(useRights().canEditMedia(otherMedia)).toBe(true);
                });
            });

            ['RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION', 'PODCAST_CRUD'].forEach(role => {
                it(`${role} can only edit own element`, async () => {
                    await setup([role]);
                    expect(useRights().canEditMedia(ownMedia)).toBe(true);
                    expect(useRights().canEditMedia(otherMedia)).toBe(false);
                    expect(useRights().canEditMedia(noOwnerMedia)).toBe(false);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canEditMedia(ownMedia)).toBe(false);
            });
        });

        describe('canDeleteMedia', () => {
            it('delegates to canEditMedia', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canDeleteMedia(ownMedia)).toBe(true);
                expect(useRights().canDeleteMedia(otherMedia)).toBe(false);
            });
        });
    });

    describe('Mix permissions', () => {
        const ownMix = { ownerId: 'test-user-123' } as Mix;
        const otherMix = { ownerId: 'other-user' } as Mix;

        describe('canCreateMix', () => {
            ['ADMIN', 'RADIO'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canCreateMix()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canCreateMix()).toBe(false);
            });
        });

        describe('canEditMix', () => {
            ['ADMIN', 'RADIO'].forEach(role => {
                it(`allows ${role} to edit any element`, async () => {
                    await setup([role]);
                    expect(useRights().canEditMix(otherMix)).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canEditMix(ownMix)).toBe(false);
            });
        });

        describe('canDeleteMix', () => {
            ['ADMIN', 'RADIO'].forEach(role => {
                it(`allows ${role} to delete any element`, async () => {
                    await setup([role]);
                    expect(useRights().canDeleteMix(otherMix)).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canDeleteMix(ownMix)).toBe(false);
            });
        });
    });

    describe('Other permissions', () => {
        describe('canEditCodeInsertPlayer', () => {
            ['ADMIN', 'ORGANISATION'].forEach(role => {
                it(`allows ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canEditCodeInsertPlayer()).toBe(true);
                });
            });

            ['PRODUCTION', 'PODCAST_CRUD', 'RESTRICTED_PRODUCTION', 'PLAYLISTS'].forEach(role => {
                it(`denies ${role}`, async () => {
                    await setup([role]);
                    expect(useRights().canEditCodeInsertPlayer()).toBe(false);
                });
            });
        });
    });

    describe('ActionRight detailed reasons', () => {
        describe('getEditEmissionRight', () => {
            it('returns Allowed for PRODUCTION', async () => {
                await setup(['PRODUCTION']);
                expect(useRights().getEditEmissionRight(mockEmission({ createdByUserId: 'other' }))).toBe(ActionRight.Allowed);
            });

            it('returns Allowed for RESTRICTED_PRODUCTION editing own emission', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().getEditEmissionRight(mockEmission({ createdByUserId: 'test-user-123' }))).toBe(ActionRight.Allowed);
            });

            it('returns DeniedNotOwner for RESTRICTED_PRODUCTION editing others\' emission', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().getEditEmissionRight(mockEmission({ createdByUserId: 'other' }))).toBe(ActionRight.DeniedNotOwner);
            });

            it('returns DeniedNoRight for role without emission access', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().getEditEmissionRight(mockEmission({ createdByUserId: 'test-user-123' }))).toBe(ActionRight.DeniedNoRight);
            });
        });

        describe('getEditPodcastRight', () => {
            it('returns Allowed for PRODUCTION on any podcast', async () => {
                await setup(['PRODUCTION']);
                expect(useRights().getEditPodcastRight(mockPodcast({ createdByUserId: 'other', valid: true }))).toBe(ActionRight.Allowed);
            });

            it('returns Allowed for RESTRICTED_PRODUCTION editing own podcast', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().getEditPodcastRight(mockPodcast({ createdByUserId: 'test-user-123', valid: true }))).toBe(ActionRight.Allowed);
            });

            it('returns DeniedNotOwner for RESTRICTED_PRODUCTION editing others\' podcast', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().getEditPodcastRight(mockPodcast({ createdByUserId: 'other', valid: true }))).toBe(ActionRight.DeniedNotOwner);
            });

            it('returns DeniedNotOwner for PODCAST_CRUD editing others\' podcast', async () => {
                await setup(['PODCAST_CRUD']);
                expect(useRights().getEditPodcastRight(mockPodcast({ valid: false, publisher: { userId: 'other' } }))).toBe(ActionRight.DeniedNotOwner);
            });

            it('returns DeniedNoRight for role without podcast access', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().getEditPodcastRight(mockPodcast({ createdByUserId: 'test-user-123', valid: true }))).toBe(ActionRight.DeniedNoRight);
            });
        });

        describe('getEditCartouchierRight', () => {
            it('returns Allowed for ANIMATION on any element', async () => {
                await setup(['ANIMATION']);
                expect(useRights().getEditCartouchierRight({ ownerId: 'other' } as Cartouchier)).toBe(ActionRight.Allowed);
            });

            it('returns Allowed for RESTRICTED_PRODUCTION editing own element', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().getEditCartouchierRight({ ownerId: 'test-user-123' } as Cartouchier)).toBe(ActionRight.Allowed);
            });

            it('returns DeniedNotOwner for RESTRICTED_PRODUCTION editing others\' element', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().getEditCartouchierRight({ ownerId: 'other' } as Cartouchier)).toBe(ActionRight.DeniedNotOwner);
            });

            it('returns DeniedNoRight for role without cartouchier access', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().getEditCartouchierRight({ ownerId: 'test-user-123' } as Cartouchier)).toBe(ActionRight.DeniedNoRight);
            });
        });

        describe('getEditMediaRight', () => {
            it('returns Allowed for ANIMATION on any element', async () => {
                await setup(['ANIMATION']);
                expect(useRights().getEditMediaRight({ mediaId: 1, ownerId: 'other' } as Media)).toBe(ActionRight.Allowed);
            });

            it('returns Allowed for RESTRICTED_PRODUCTION editing own element', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().getEditMediaRight({ mediaId: 1, ownerId: 'test-user-123' } as Media)).toBe(ActionRight.Allowed);
            });

            it('returns DeniedNotOwner for RESTRICTED_PRODUCTION editing others\' element', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().getEditMediaRight({ mediaId: 1, ownerId: 'other' } as Media)).toBe(ActionRight.DeniedNotOwner);
            });

            it('returns DeniedNotOwner when ownerId is absent', async () => {
                await setup(['PODCAST_CRUD']);
                expect(useRights().getEditMediaRight({ mediaId: 1 } as Media)).toBe(ActionRight.DeniedNotOwner);
            });

            it('returns DeniedNoRight for role without media access', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().getEditMediaRight({ mediaId: 1, ownerId: 'test-user-123' } as Media)).toBe(ActionRight.DeniedNoRight);
            });
        });

        describe('getEditRubriquesRight', () => {
            it('returns Allowed for EDITION', async () => {
                await setup(['EDITION']);
                expect(useRights().getEditRubriquesRight({ rubriqueId: 1, name: 'Test' } as Rubrique)).toBe(ActionRight.Allowed);
            });

            it('returns DeniedNoRight for role without rubrique access', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().getEditRubriquesRight({ rubriqueId: 1, name: 'Test' } as Rubrique)).toBe(ActionRight.DeniedNoRight);
            });
        });

        describe('getEditTranscriptRight', () => {
            it('returns Allowed for PRODUCTION on any podcast', async () => {
                await setup(['PRODUCTION']);
                expect(useRights().getEditTranscriptRight(mockPodcast({ createdByUserId: 'other' }))).toBe(ActionRight.Allowed);
            });

            it('returns Allowed for PODCAST_CRUD editing own transcript', async () => {
                await setup(['PODCAST_CRUD']);
                expect(useRights().getEditTranscriptRight(mockPodcast({ createdByUserId: 'test-user-123' }))).toBe(ActionRight.Allowed);
            });

            it('returns DeniedNotOwner for PODCAST_CRUD editing others\' transcript', async () => {
                await setup(['PODCAST_CRUD']);
                expect(useRights().getEditTranscriptRight(mockPodcast({ createdByUserId: 'other' }))).toBe(ActionRight.DeniedNotOwner);
            });

            it('returns DeniedNoRight for role without transcript access', async () => {
                await setup(['RESTRICTED_ANIMATION']);
                expect(useRights().getEditTranscriptRight(mockPodcast({ createdByUserId: 'test-user-123' }))).toBe(ActionRight.DeniedNoRight);
            });
        });

        describe('getEditChapteringRight', () => {
            it('matches getEditPodcastRight for ADMIN on any podcast', async () => {
                await setup(['ADMIN']);
                const podcast = mockPodcast({ createdByUserId: 'other', valid: true });
                expect(useRights().getEditChapteringRight(podcast)).toBe(useRights().getEditPodcastRight(podcast));
                expect(useRights().getEditChapteringRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('matches getEditPodcastRight for RESTRICTED_PRODUCTION on own podcast', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                const podcast = mockPodcast({ createdByUserId: 'test-user-123', valid: true });
                expect(useRights().getEditChapteringRight(podcast)).toBe(useRights().getEditPodcastRight(podcast));
                expect(useRights().getEditChapteringRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('matches getEditPodcastRight for RESTRICTED_PRODUCTION on others\' podcast', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                const podcast = mockPodcast({ createdByUserId: 'other', valid: true });
                expect(useRights().getEditChapteringRight(podcast)).toBe(useRights().getEditPodcastRight(podcast));
                expect(useRights().getEditChapteringRight(podcast)).toBe(ActionRight.DeniedNotOwner);
            });

            it('matches getEditPodcastRight with insufficient scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditChapteringRight(podcast)).toBe(useRights().getEditPodcastRight(podcast));
                expect(useRights().getEditChapteringRight(podcast)).toBe(ActionRight.DeniedInsufficientScope);
            });
        });
    });

    describe('Scope permissions', () => {
        describe('getEditEmissionRight scope', () => {
            it('denies PRODUCTION with insufficient scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                expect(useRights().getEditEmissionRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows PRODUCTION with matching scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [1]);
                expect(useRights().getEditEmissionRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.Allowed);
            });

            it('denies RESTRICTED_PRODUCTION with insufficient scope even on own emission', async () => {
                await setup(['RESTRICTED_PRODUCTION'], 'test-user-123', [999]);
                expect(useRights().getEditEmissionRight(mockEmission({ createdByUserId: 'test-user-123', rubriqueIds: [1] })))
                    .toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows RESTRICTED_PRODUCTION with matching scope on own emission', async () => {
                await setup(['RESTRICTED_PRODUCTION'], 'test-user-123', [1]);
                expect(useRights().getEditEmissionRight(mockEmission({ createdByUserId: 'test-user-123', rubriqueIds: [1] })))
                    .toBe(ActionRight.Allowed);
            });

            it('allows ADMIN regardless of scope', async () => {
                await setup(['ADMIN'], 'test-user-123', [999]);
                expect(useRights().getEditEmissionRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.Allowed);
            });

            it('canEditEmission forwards the scope-driven denial', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                expect(useRights().canEditEmission(mockEmission({ rubriqueIds: [1] }))).toBe(false);
            });
        });

        describe('getDeleteEmissionRight scope', () => {
            it('denies PRODUCTION with insufficient scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                expect(useRights().getDeleteEmissionRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows PRODUCTION with matching scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [1]);
                expect(useRights().getDeleteEmissionRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.Allowed);
            });

            it('allows ADMIN regardless of scope', async () => {
                await setup(['ADMIN'], 'test-user-123', [999]);
                expect(useRights().getDeleteEmissionRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.Allowed);
            });
        });

        describe('getCreatePodcastRight scope', () => {
            it('allows creation without an emission arg regardless of scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                expect(useRights().getCreatePodcastRight()).toBe(ActionRight.Allowed);
            });

            it('denies PRODUCTION with insufficient scope when an emission is passed', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                expect(useRights().getCreatePodcastRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows PRODUCTION with matching scope when an emission is passed', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [1]);
                expect(useRights().getCreatePodcastRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.Allowed);
            });

            it('allows ADMIN regardless of scope', async () => {
                await setup(['ADMIN'], 'test-user-123', [999]);
                expect(useRights().getCreatePodcastRight(mockEmission({ rubriqueIds: [1] }))).toBe(ActionRight.Allowed);
            });
        });

        describe('getEditPodcastRight scope', () => {
            it('denies PRODUCTION when neither podcast nor emission rubriques match scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditPodcastRight(podcast)).toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows PRODUCTION when the podcast\'s own rubriques match scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [1]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditPodcastRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('allows PRODUCTION when only the emission\'s rubriques match scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [2]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditPodcastRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('denies RESTRICTED_PRODUCTION with insufficient scope even on own podcast', async () => {
                await setup(['RESTRICTED_PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({
                    createdByUserId: 'test-user-123',
                    rubriqueIds: [1],
                    emission: mockEmission({ rubriqueIds: [2] })
                });
                expect(useRights().getEditPodcastRight(podcast)).toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows ADMIN regardless of scope', async () => {
                await setup(['ADMIN'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditPodcastRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('canEditPodcast forwards the scope-driven denial', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().canEditPodcast(podcast)).toBe(false);
            });
        });

        describe('getEditTranscriptRight scope', () => {
            it('denies PRODUCTION when neither podcast nor emission rubriques match scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditTranscriptRight(podcast)).toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows PRODUCTION when the podcast\'s own rubriques match scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [1]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditTranscriptRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('allows PRODUCTION when only the emission\'s rubriques match scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [2]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditTranscriptRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('denies RESTRICTED_PRODUCTION with insufficient scope even on own podcast', async () => {
                await setup(['RESTRICTED_PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({
                    createdByUserId: 'test-user-123',
                    rubriqueIds: [1],
                    emission: mockEmission({ rubriqueIds: [2] })
                });
                expect(useRights().getEditTranscriptRight(podcast)).toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows ADMIN regardless of scope', async () => {
                await setup(['ADMIN'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditTranscriptRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('canEditTranscript forwards the scope-driven denial', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().canEditTranscript(podcast)).toBe(false);
            });
        });

        describe('getEditTranscriptVisibilityRight scope', () => {
            it('denies PRODUCTION with insufficient scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditTranscriptVisibilityRight(podcast)).toBe(ActionRight.DeniedInsufficientScope);
            });

            it('allows PRODUCTION with matching scope', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [1]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditTranscriptVisibilityRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('allows ADMIN regardless of scope', async () => {
                await setup(['ADMIN'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().getEditTranscriptVisibilityRight(podcast)).toBe(ActionRight.Allowed);
            });

            it('canEditTranscriptVisibility forwards the scope-driven denial', async () => {
                await setup(['PRODUCTION'], 'test-user-123', [999]);
                const podcast = mockPodcast({ rubriqueIds: [1], emission: mockEmission({ rubriqueIds: [2] }) });
                expect(useRights().canEditTranscriptVisibility(podcast)).toBe(false);
            });
        });
    });
});
