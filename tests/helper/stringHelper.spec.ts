import stringHelper from '@/helper/stringHelper';
import { describe, expect, it } from 'vitest';

describe('stringHelper', () => {
    describe('escapeHtml', () => {
        it('escapes HTML special characters', () => {
            expect(stringHelper.escapeHtml('<img src="x" onerror=\'alert(1)\'> & co'))
                .toBe('&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt; &amp; co');
        });

        it('leaves plain text unchanged', () => {
            expect(stringHelper.escapeHtml('Plain text')).toBe('Plain text');
        });
    });
});
