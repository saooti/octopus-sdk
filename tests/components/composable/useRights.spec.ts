import { describe, expect, it } from 'vitest';
import { setupPinia, setupAuthStore } from '@tests/utils';
import { useAuthStore } from '@/stores/AuthStore';
import { useRights } from '@/components/composable/useRights';
import type { Organisation } from '@/stores/class/general/organisation';
import type { Emission } from '@/stores/class/general/emission';
import type { Podcast } from '@/stores/class/general/podcast';

async function setup(roles: string[], userId = 'test-user-123'): Promise<void> {
    setupPinia();
    await setupAuthStore({ roles })();
    useAuthStore().$patch({ authProfile: { userId } });
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
                expect(useRights().canEditEmission({ emissionId: 1, createdByUserId: 'other-user' } as Emission)).toBe(true);
            });

            it('allows RESTRICTED_PRODUCTION to edit own emission', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canEditEmission({ emissionId: 1, createdByUserId: 'test-user-123' } as Emission)).toBe(true);
            });

            it('denies RESTRICTED_PRODUCTION editing others\' emission', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canEditEmission({ emissionId: 1, createdByUserId: 'other-user' } as Emission)).toBe(false);
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
                    expect(useRights().canDeleteEmission()).toBe(true);
                });
            });

            it('denies unrelated roles', async () => {
                await setup(['PLAYLISTS']);
                expect(useRights().canDeleteEmission()).toBe(false);
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
            const ownPodcast = { podcastId: 1, createdByUserId: 'test-user-123', valid: true } as Podcast;
            const otherPodcast = { podcastId: 1, createdByUserId: 'other-user', valid: true } as Podcast;

            ['ADMIN', 'ORGANISATION', 'PRODUCTION'].forEach(role => {
                it(`allows ${role} to edit any podcast`, async () => {
                    await setup([role]);
                    expect(useRights().canEditPodcast(otherPodcast)).toBe(true);
                });
            });

            it('allows PODCAST_CRUD to edit own non-valid podcast', async () => {
                await setup(['PODCAST_CRUD']);
                const podcast = { podcastId: 1, valid: false, publisher: { userId: 'test-user-123' } } as Podcast;
                expect(useRights().canEditPodcast(podcast)).toBe(true);
            });

            it('denies PODCAST_CRUD editing own valid podcast', async () => {
                await setup(['PODCAST_CRUD']);
                const podcast = { podcastId: 1, valid: true, publisher: { userId: 'test-user-123' } } as Podcast;
                expect(useRights().canEditPodcast(podcast)).toBe(false);
            });

            it('denies PODCAST_CRUD editing others\' podcast', async () => {
                await setup(['PODCAST_CRUD']);
                const podcast = { podcastId: 1, valid: false, publisher: { userId: 'other-user' } } as Podcast;
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
                    const podcast = { podcastId: 1, createdByUserId: 'test-user-123', valid: true, publisher: { userId: 'test-user-123' } } as Podcast;
                    expect(useRights().canEditPodcast(podcast)).toBe(true);
                });
            });

            it('denies RESTRICTED_PRODUCTION + PODCAST_CRUD editing others\' valid podcast', async () => {
                await setup(['RESTRICTED_PRODUCTION', 'PODCAST_CRUD']);
                const podcast = { podcastId: 1, createdByUserId: 'other-user', valid: true, publisher: { userId: 'other-user' } } as Podcast;
                expect(useRights().canEditPodcast(podcast)).toBe(false);
            });
        });

        describe('canDeletePodcast', () => {
            it('delegates to canEditPodcast', async () => {
                await setup(['RESTRICTED_PRODUCTION']);
                expect(useRights().canDeletePodcast({ podcastId: 1, createdByUserId: 'test-user-123' } as Podcast)).toBe(true);
                expect(useRights().canDeletePodcast({ podcastId: 1, createdByUserId: 'other-user' } as Podcast)).toBe(false);
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
        const ownPodcast = { podcastId: 1, createdByUserId: 'test-user-123' } as Podcast;
        const otherPodcast = { podcastId: 2, createdByUserId: 'other-user' } as Podcast;

        ['ADMIN', 'ORGANISATION', 'PRODUCTION'].forEach(role => {
            it(`allows ${role} to edit transcript of any podcast`, async () => {
                await setup([role]);
                expect(useRights().canEditTranscript(otherPodcast)).toBe(true);
            });
        });

        ['RESTRICTED_PRODUCTION', 'RESTRICTED_ANIMATION'].forEach(role => {
            it(`${role} can only edit transcript of own podcast`, async () => {
                await setup([role]);
                expect(useRights().canEditTranscript(ownPodcast)).toBe(true);
                expect(useRights().canEditTranscript(otherPodcast)).toBe(false);
            });
        });

        it('denies unrelated roles', async () => {
            await setup(['PODCAST_CRUD']);
            expect(useRights().canEditTranscript(ownPodcast)).toBe(false);
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
});
