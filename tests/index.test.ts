import { JClass, JProperty } from '@/lib/jdocgen/jdocgen';
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

    it('should serialize and deserialize seamlessly', () => {
        const c = new JClass('public', 'Main', undefined, undefined);
        c.addProperty(new JProperty(
            'private',
            'String',
            'firstName',
            'public',
            'protected',
        ));
        const raw = JSON.stringify(c.toSerializable());
        const d = JClass.fromSerializable(JSON.parse(raw));
        expect(d.accessModifier).toBe(c.accessModifier);
        expect(d.identifier).toBe(c.identifier);
        expect(d.extendsWhat).toBe(c.extendsWhat);
        expect(d.implementsWhat).toBe(c.implementsWhat);
        expect(d.properties.length).toBe(1);
        expect(d.properties[0].identifier).toBe(c.properties[0].identifier);
    })
});
