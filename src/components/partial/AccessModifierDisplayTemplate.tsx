'use client';
import style from '@/components/common.module.css';

export default function AccessModifierDisplayTemplate(accessModifier: string|undefined) {
    return <>
    {
    (() => {
        switch (accessModifier) {
            case 'public':
            case 'protected':
            case 'private':
            case '':
                return <span className={style[`accessModifier_${accessModifier}`]}>
                    {accessModifier === '' ? '(default)' : accessModifier}
                </span>;
            
            case undefined:
            default:
                return <span className={style.accessModifier_disabled}>
                    DISABLED
                </span>;
        }
    })()
    }
    </>;
}

export function accessModifierDisplayWithFieldName(fieldName: string) {
    return (rowData: any) => AccessModifierDisplayTemplate(rowData[fieldName]);
}
