'use client';
import style from '@/components/common.module.css';

import { InputText } from "primereact/inputtext";
import { Dispatch, SetStateAction } from "react";

export default function IdentifierInput({
    id, identifier, setIdentifier, setDirty
} : {
    id: string,
    identifier: string,
    setIdentifier: Dispatch<SetStateAction<string>>,
    setDirty: Dispatch<SetStateAction<boolean>>,
}) {
    return <>
    <InputText
    value={identifier}
    onChange={(event) => {
        setIdentifier(event.target.value);
        setDirty(true);
    }}
    />
    </>;
}
