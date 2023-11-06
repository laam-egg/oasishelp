import { JClass, JProperty, JValidator } from '@/lib/jdocgen/jdocgen';
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
    });

    it('should validate Java data type correctly', () => {
        expect(JValidator.checkDataType('s')).toBe(true);
        expect(JValidator.checkDataType('SimpleIdentifier')).toBe(true);
        expect(JValidator.checkDataType('j.l')).toBe(true);
        expect(JValidator.checkDataType('java.lang')).toBe(true);
        expect(JValidator.checkDataType('java.lang.Exception')).toBe(true);
        expect(JValidator.checkDataType('ArrayList<String>')).toBe(true);
        expect(JValidator.checkDataType('java.util.ArrayList<String>')).toBe(true);
        expect(JValidator.checkDataType('java.util.ArrayList<ArrayList<String>>')).toBe(true);
        expect(JValidator.checkDataType('java.util.ArrayList<java.util.ArrayList<String>>')).toBe(true);
        expect(JValidator.checkDataType('A<B<C<D.E.F<G>.H>>>')).toBe(true);

        expect(JValidator.checkDataType('')).toBe(false);
        expect(JValidator.checkDataType('.')).toBe(false);
        expect(JValidator.checkDataType('s.')).toBe(false);
        expect(JValidator.checkDataType('.s')).toBe(false);
        expect(JValidator.checkDataType('SimpleIdentifier.')).toBe(false);
        expect(JValidator.checkDataType('..s')).toBe(false);
        expect(JValidator.checkDataType('java..lang.Exception')).toBe(false);
        expect(JValidator.checkDataType('java.lang.Exception.')).toBe(false);
        expect(JValidator.checkDataType('>')).toBe(false);
        expect(JValidator.checkDataType('<')).toBe(false);
        expect(JValidator.checkDataType('.<')).toBe(false);
        expect(JValidator.checkDataType('S.<')).toBe(false);
        expect(JValidator.checkDataType('S<E>.')).toBe(false);
        expect(JValidator.checkDataType('S.E<>')).toBe(false);
        expect(JValidator.checkDataType('java.util.ArrayList<String')).toBe(false);
        expect(JValidator.checkDataType('java.util.ArrayList<String.')).toBe(false);
        expect(JValidator.checkDataType('java.util.ArrayList<<String>>')).toBe(false);
        expect(JValidator.checkDataType('A<B<C<D>')).toBe(false);
    });
});
