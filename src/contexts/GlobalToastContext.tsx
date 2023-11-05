'use client';

import { RefObject, createContext, useContext, useRef } from "react";
import { Toast } from 'primereact/toast';

export const GlobalToastContext = createContext(
    null as null|RefObject<Toast>
);

export function GlobalToastContextProvider({
    children
}: {
    children: React.ReactNode
}) {
    const ref = useRef<Toast>(null);

    return <GlobalToastContext.Provider value={ref}>
        {children}
    </GlobalToastContext.Provider>;
}

export function GlobalToast() {
    const ref = useContext(GlobalToastContext);

    return <>
    <Toast ref={ref} />
    </>;
}
