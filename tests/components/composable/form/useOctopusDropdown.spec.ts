import { getDropdownStyle } from '@/components/composable/form/useOctopusDropdown';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Field of 30px height, at the given vertical position
function anchorAt(top: number): HTMLElement {
    const anchor = document.createElement('div');
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue(
        { top, bottom: top + 30, left: 10, width: 200 } as DOMRect
    );
    return anchor;
}

function floatingOfHeight(height: number): HTMLElement {
    const floating = document.createElement('div');
    vi.spyOn(floating, 'offsetHeight', 'get').mockReturnValue(height);
    return floating;
}

describe('useOctopusDropdown', () => {
    describe('getDropdownStyle', () => {
        beforeEach(() => {
            vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('opens below the field when there is enough room', () => {
            expect(getDropdownStyle(anchorAt(100), floatingOfHeight(200))).toEqual({
                position: 'fixed',
                top: '132px',
                left: '10px',
                width: '200px'
            });
        });

        it('opens above the field when cut off by the viewport bottom', () => {
            expect(getDropdownStyle(anchorAt(700), floatingOfHeight(200))).toEqual({
                position: 'fixed',
                bottom: '102px',
                left: '10px',
                width: '200px'
            });
        });

        it('stays below when there is even less room above', () => {
            vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(300);
            const style = getDropdownStyle(anchorAt(100), floatingOfHeight(250));
            expect(style.top).toBe('132px');
            expect(style.bottom).toBeUndefined();
        });

        it('opens below when the dropdown is not rendered yet', () => {
            expect(getDropdownStyle(anchorAt(700), null).top).toBe('732px');
        });
    });
});
