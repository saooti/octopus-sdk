import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/api/classicApi', () => ({
    default: {
        fetchData: vi.fn()
    }
}));

import classicApi from '../../src/api/classicApi';
import { organisationApi } from '../../src/api/organisationApi';
import { setupPinia } from '../utils';

const CRAFTED_ID = '../admin?x=1#';
const ENCODED_ID = '..%2Fadmin%3Fx%3D1%23';

describe('organisationApi', () => {
    beforeEach(() => {
        setupPinia();
        vi.mocked(classicApi.fetchData).mockReset().mockResolvedValue({});
    });

    const calledPath = () => vi.mocked(classicApi.fetchData).mock.calls[0][0].path;

    describe('organisation ID encoding', () => {
        it('encodes the ID in get', async () => {
            await organisationApi.get(CRAFTED_ID);
            expect(calledPath()).toBe(`organisation/${ENCODED_ID}`);
        });

        it('encodes the ID in getAttributes', async () => {
            await organisationApi.getAttributes(CRAFTED_ID);
            expect(calledPath()).toBe(`organisation/attributes/${ENCODED_ID}`);
        });

        it('encodes the ID in getVideoConfig', async () => {
            await organisationApi.getVideoConfig(CRAFTED_ID);
            expect(calledPath()).toBe(`video/config/${ENCODED_ID}`);
        });

        it('leaves UUIDs unchanged', async () => {
            await organisationApi.get('ecbd98d9-79bd-4312-ad5e-fc7c1c4a191c');
            expect(calledPath()).toBe('organisation/ecbd98d9-79bd-4312-ad5e-fc7c1c4a191c');
        });
    });
});
