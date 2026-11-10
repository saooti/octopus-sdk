import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/classicApi', () => ({
    default: {
        fetchData: vi.fn()
    }
}));

import classicApi from '../../src/api/classicApi';
import { rubriquesApi } from '../../src/api/rubriquesApi';
import { type Rubriquage, RubriquageMode } from '../../src/stores/class/rubrique/rubriquage';
import type { Rubrique } from '../../src/stores/class/rubrique/rubrique';

function rubriquage(mode: RubriquageMode, rubriqueIds: Array<number>): Rubriquage {
    return {
        title: mode,
        mode,
        rubriques: rubriqueIds.map(rubriqueId => ({ rubriqueId } as Rubrique))
    };
}

/** Mocks the API: the user's scope and the organisation's rubriquages */
function mockApi(scope: Array<number>, rubriquages: Array<Rubriquage>): void {
    vi.mocked(classicApi.fetchData).mockImplementation(async ({ path }) =>
        path.startsWith('rubrique/user/list/rubriques/') ? scope : rubriquages
    );
}

describe('rubriquesApi', () => {
    describe('listUserScope', () => {
        it('returns the raw scope when no organisation is given', async () => {
            mockApi([1, 2, 99], []);
            expect(await rubriquesApi.listUserScope('user-1')).toEqual([1, 2, 99]);
        });

        it('returns an empty scope when the organisation has no restrictive rubriquage', async () => {
            mockApi([1, 2], [rubriquage(RubriquageMode.OPTIONAL, [1, 2])]);
            expect(await rubriquesApi.listUserScope('user-1', 'org-1')).toEqual([]);
        });

        it('keeps only the scope entries of the restrictive rubriquage', async () => {
            mockApi([1, 2, 3], [
                rubriquage(RubriquageMode.OPTIONAL, [1]),
                rubriquage(RubriquageMode.RESTRICTIVE, [2, 3, 4])
            ]);
            expect(await rubriquesApi.listUserScope('user-1', 'org-1')).toEqual([2, 3]);
        });
    });
});
