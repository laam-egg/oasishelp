'use client';

import style from '@/components/common.module.css';
import { JClass } from '@/lib/jdocgen/jdocgen';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useState, useEffect } from 'react';
import { accessModifierDisplayWithFieldName } from './AccessModifierDisplayTemplate';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { OnJClassChangeCallbackRegistry, getAllJClasses, removeJClass } from '@/lib/storage/storage';

export default function JClassList() {
    const router = useRouter();

    const [jclasses, setJClasses] = useState([] as JClass[]);

    useEffect(() => {
        const reloadAllJClasses = async () => {
            setJClasses(await getAllJClasses());
        };
        reloadAllJClasses();

        const id = OnJClassChangeCallbackRegistry.register(reloadAllJClasses);
        return () => {
            OnJClassChangeCallbackRegistry.deregister(id);
        };
    }, []);

    const JClassInfoTemplate = (rowData: any) => {
        const c = rowData as JClass;
        return <>
        <div>{c.properties.length} properties, {c.functions.length} custom methods</div>
        </>;
    }
    
    const onAdd = () => {
        router.push(`/jclass/edit`);
    };

    const JClassActionTemplate = (rowData: any) => {
        const onEdit = () => {
            const c = rowData as JClass;
            router.push(`/jclass/edit?identifier=${c.identifier}`);
        };

        const onDelete = async () => {
            const c = rowData as JClass;
            if (!confirm(`Delete class ${c.identifier} ?\n\n${c.toString()}`)) return;
            await removeJClass(c.identifier);
            setJClasses(await getAllJClasses());
        }

        return <>
        <Button label='Edit' severity='secondary' onClick={onEdit} />
        <Button label='Delete' severity='danger' onClick={onDelete} />
        </>;
    };

    return <>
    <DataTable
    value={jclasses}
    emptyMessage="No classes added yet."
    >
        <Column field="accessModifier" header="Access Modifier" body={accessModifierDisplayWithFieldName('accessModifier')} />
        <Column body={<b>{'class'}</b>} exportable={false} />
        <Column field="identifier" header="Name" />
        <Column body={JClassInfoTemplate} exportable={false} />
        <Column body={JClassActionTemplate} exportable={false} />
    </DataTable>
    <Button label='Add class' onClick={onAdd} />
    </>;
}
