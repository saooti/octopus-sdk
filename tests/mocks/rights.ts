import type { Emission } from '@/stores/class/general/emission';
import type { Podcast } from '@/stores/class/general/podcast';

export function mockEmission(data: Partial<Emission> = {}): Emission {
    return {
        emissionId: 1,
        ...data
    };
}

export function mockPodcast(data: Partial<Podcast> = {}): Podcast {
    return {
        podcastId: 1,
        emission: mockEmission(data.emission),
        ...data
    };
}
