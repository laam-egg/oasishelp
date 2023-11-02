import { JClass, JProperty } from '@/lib/jdocgen';
import { describe, expect } from '@jest/globals';

describe('jdocgen test', () => {
    it ('should dump code correctly', () => {
        const c = new JClass('public', 'Main', undefined, undefined);
        c.addProperty(new JProperty(
            'private',
            'String',
            'password',
            'public',
            'public',
        ));
        console.log(c.toString());
        expect(c.identifier).toBe('Main');
    });
});
