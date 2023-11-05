'use client';
import style from '@/components/common.module.css';

import { AutoComplete } from "primereact/autocomplete";
import { Dispatch, SetStateAction, useState } from "react";

export default function DataTypeInput({
    id, dataType, setDataType
} : {
    id: string,
    dataType: string,
    setDataType: Dispatch<SetStateAction<string>>,
}) {
    const basicDataTypes = [
        'String',
        'int',
        'float',
        'double',
        'boolean',
        'long',
        'byte',
        'short',
        'char',
    ];
    const [currentSuggestions, setCurrentSuggestions] = useState(basicDataTypes);

    return <>
    <AutoComplete
    id={id}
    value={dataType}
    suggestions={currentSuggestions}
    completeMethod={(event) => {
        const q = event.query;
        const suggestions = [...basicDataTypes];
        suggestions.sort((a, b) => {
            let pa = a.indexOf(q);
            if (pa < 0) pa = 1000;
            let pb = b.indexOf(q);
            if (pb < 0) pb = 1000;
            // A simple algorithm to sort the suggestions:
            // If a matches query q right from the beginning
            // while b does not => a has higher priority (hence
            // the part `- pa * 1000`).
            // If both matches query q at the same position
            // (or neither of them match), then which one is
            // longer will have higher priority (hence the
            // part `a.length`. So for example, the user has
            // typed `String` and there are two close matches
            // `String` and `String2`, then `String2` should
            // be at the top, because there's no need to
            // autocomplete the `String` while the user has
            // already typed `String`).
            let x = a.length - pa * 1000;
            let y = b.length - pb * 1000;
            if (x > y) return -1;
            else if (x == y) return 0;
            else return 1;
        });
        setCurrentSuggestions(suggestions);
    }}
    onChange={(event) => setDataType(event.value)}
    dropdown
    />
    </>;
}
