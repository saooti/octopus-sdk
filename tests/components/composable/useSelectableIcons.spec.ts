import { describe, expect, it } from 'vitest';
import Star from 'vue-material-design-icons/Star.vue';

import { useSelectableIcons, type IconName } from '@/components/composable/useSelectableIcons';

describe('useSelectableIcons', () => {
    it('getIcon returns the matching component', () => {
        expect(useSelectableIcons().getIcon('Star')).toBe(Star);
    });

    it('getIcon returns the same component as the Icons map for every name', () => {
        const { Icons, getIcon } = useSelectableIcons();
        Object.entries(Icons).forEach(([name, icon]) => {
            expect(getIcon(name as IconName)).toBe(icon);
        });
    });
});
