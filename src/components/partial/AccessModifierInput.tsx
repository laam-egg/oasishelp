'use client';
import style from '@/components/common.module.css';

import { Dropdown } from "primereact/dropdown";
import { Dispatch, SetStateAction } from "react";

export default function AccessModifierInput({
    id, accessModifier, setAccessModifier, setDirty
} : {
    id: string,
    accessModifier: string|undefined,
    setAccessModifier: Dispatch<SetStateAction<string|undefined>>,
    setDirty: Dispatch<SetStateAction<boolean>>,
}) {
    return <>
    <Dropdown
    id={id}
    value={accessModifier === '' ? '(default)' : accessModifier}
    onChange={(event) => {
        const newAccessModifier = event.target.value;
        setAccessModifier(newAccessModifier === '(default)' ? '' : newAccessModifier);
        setDirty(true);
    }}
    options={[
        'public',
        'protected',
        'private',
        '(default)',
    ]}
    // https://stackoverflow.com/questions/51150757/how-to-make-a-dropdown-with-specific-values-in-reactjs#comment89285842_51150977
    placeholder='Not selected'
    showClear
    />
    </>;
}
