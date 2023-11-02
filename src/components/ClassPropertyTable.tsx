'use client';

import style from './ClassPropertyTable.module.css';

import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

import { JProperty, JPropertyAttrInput } from "@/lib/jdocgen";
import { Dialog } from "primereact/dialog";
import { Dropdown } from 'primereact/dropdown';
import { AutoComplete } from 'primereact/autocomplete';
import { InputText } from 'primereact/inputtext';

function AccessModifierDisplayTemplate(accessModifier: string|undefined) {
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

export function AccessModifierInput({ id, accessModifier, setAccessModifier }
: {
    id: string,
    accessModifier: string|undefined,
    setAccessModifier: Dispatch<SetStateAction<string|undefined>>,
}) {
    return <>
    <Dropdown
    id={id}
    value={accessModifier === '' ? '(default)' : accessModifier}
    onChange={(event) => {
        const newAccessModifier = event.target.value;
        setAccessModifier(newAccessModifier === '(default)' ? '' : newAccessModifier);
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

function DataTypeInput({ id, dataType, setDataType }
: {
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

export function IdentifierInput({ id, identifier, setIdentifier }
: {
    id: string,
    identifier: string,
    setIdentifier: Dispatch<SetStateAction<string>>,
}) {
    return <>
    <InputText
    value={identifier}
    onChange={(event) => setIdentifier(event.target.value)}
    />
    </>;
}

function JPropertyDialogButtons({
    addNew, pAttrs, setJProperty, setDialogVisible
}: {
    addNew: boolean,
    pAttrs: JPropertyAttrInput,
    setJProperty: Dispatch<SetStateAction<JProperty|undefined>>,
    setDialogVisible: Dispatch<SetStateAction<boolean>>,
}) {
    const err = (msg: string, exception: any) => {
        alert(msg);
        console.log(msg);
        console.log(exception);
    }
    const onAddOrUpdate = () => {
        if (pAttrs.accessModifier === undefined) {
            return err('Please select the property\'s access modifier !', undefined);
        }
        let p: JProperty|undefined = undefined;
        try {
            p = new JProperty(
                pAttrs.accessModifier,
                pAttrs.dataType,
                pAttrs.identifier,
                pAttrs.getterAccessModifier,
                pAttrs.setterAccessModifier
            );
        } catch (e: any) {
            return err(`Error: ${e?.message}`, e);
        }
        setJProperty(p);
        setDialogVisible(false);
        if (dialogCallback) dialogCallback();
        dialogCallback = undefined;
    };

    const onCancel = () => {
        setJProperty(undefined);
        setDialogVisible(false);
    }

    return <div className={style.propertyDialogButtons}>
        <Button label={addNew ? 'Add' : 'Update'} severity='success' onClick={onAddOrUpdate} />
        <Button label='Cancel' severity='danger' onClick={onCancel} />
    </div>;
}

function JPropertyDialog(
    { visible, setVisible, jproperty, setJProperty }
    : {
        visible: boolean,
        setVisible: Dispatch<SetStateAction<boolean>>,
        jproperty: JProperty|undefined,
        setJProperty: Dispatch<SetStateAction<JProperty|undefined>>,
    }
) {
    const addNew: boolean = (jproperty === undefined);

    const [accessModifier, setAccessModifier] = useState(addNew ? undefined : (jproperty as JProperty).accessModifier);
    const [dataType, setDataType] = useState(addNew ? '' : (jproperty as JProperty).dataType);
    const [identifier, setIdentifier] = useState(addNew ? '' : (jproperty as JProperty).identifier);
    const [getterAccessModifier, setGetterAccessModifier] = useState(addNew ? undefined : (jproperty as JProperty).getterAccessModifier);
    const [setterAccessModifier, setSetterAccessModifier] = useState(addNew ? undefined : (jproperty as JProperty).setterAccessModifier);

    useEffect(() => {
        setAccessModifier(addNew ? undefined : (jproperty as JProperty).accessModifier);
        setDataType(addNew ? '' : (jproperty as JProperty).dataType);
        setIdentifier(addNew ? '' : (jproperty as JProperty).identifier);
        setGetterAccessModifier(addNew ? undefined : (jproperty as JProperty).getterAccessModifier);
        setSetterAccessModifier(addNew ? undefined : (jproperty as JProperty).setterAccessModifier);
    }, [jproperty, visible]);

    return <>
    <Dialog
        header={addNew ? 'Add new property' : 'Edit property'}
        visible={visible}
        style={{ width: '50vw' }}
        onHide={() => setVisible(false)}
    >
        <div className={style.propertyDialogFields}>
            <label htmlFor='accessModifierInput'>Access Modifier</label>
            <AccessModifierInput id='accessModifierInput' accessModifier={accessModifier} setAccessModifier={setAccessModifier} />
            <label htmlFor='dataTypeInput'>Data Type</label>
            <DataTypeInput id='dataTypeInput' dataType={dataType} setDataType={setDataType} />
            <label htmlFor='identifierInput'>Property Name</label>
            <IdentifierInput id='identifierInput' identifier={identifier} setIdentifier={setIdentifier} />
            <label htmlFor='getterAccessModifierInput'>Getter's Access Modifier</label>
            <AccessModifierInput id='getterAccessModifierInput' accessModifier={getterAccessModifier} setAccessModifier={setGetterAccessModifier} />
            <label htmlFor='setterAccessModifierInput'>Setter's Access Modifier</label>
            <AccessModifierInput id='setterAccessModifierInput' accessModifier={setterAccessModifier} setAccessModifier={setSetterAccessModifier} />
        </div>

        <JPropertyDialogButtons
        addNew={addNew}
        pAttrs={{ accessModifier, dataType, identifier, getterAccessModifier, setterAccessModifier }}
        setJProperty={setJProperty}
        setDialogVisible={setVisible}
        />
    </Dialog>
    </>;
}

function accessModifierDisplayWithFieldName(fieldName: string) {
    return (rowData: any) => AccessModifierDisplayTemplate(rowData[fieldName]);
}

let dialogCallback: Function | undefined = undefined;

export default ({
    jproperties,
    setJProperties
}: {
    jproperties: JProperty[],
    setJProperties: Dispatch<SetStateAction<JProperty[]>>,
}) => {
    const [dialogJPropertyInput, setDialogJPropertyInput] = useState(undefined as JProperty|undefined);

    const [dialogJPropertyOutput, setDialogJPropertyOutput] = useState(undefined as JProperty|undefined);

    const [dialog, setDialog] = useState(false);

    const ActionTemplate = (rowData: any) => {
        const onEdit = () => {
            const oldJP = (rowData as JProperty);
            setDialogJPropertyInput(oldJP);
            setDialog(true);
        };

        const onDelete = () => {
            const deletedJP = rowData as JProperty;
            const wantDelete = confirm(`Delete property ${deletedJP.identifier} ?\n\n${deletedJP.toString()}`);
            if (!wantDelete) return;
            const newJProperties = [];
            for (const jp of jproperties) {
                if (jp.identifier !== deletedJP.identifier) {
                    newJProperties.push(jp);
                }
            }
            setJProperties(newJProperties);
        }

        return <>
        <Button label='Edit' severity='secondary' onClick={onEdit} />
        <Button label='Delete' severity='danger' onClick={onDelete} />
        </>;
    };

    useEffect(() => {
        const oldJP = dialogJPropertyInput;
        const newJP = dialogJPropertyOutput;
        if (newJP === undefined) return;

        if (oldJP === undefined) {
            // Add new
            if (undefined !== jproperties.find((jp) => jp.identifier === newJP?.identifier)) {
                alert(`Duplicate property: There was already a property named ${newJP?.identifier}.`);
            } else {
                setJProperties([...jproperties, newJP]);
            }
        } else {
            // Edit
            let replaced = false;
            try {
                setJProperties(
                    jproperties.map((jp) => {
                        if (jp.identifier === newJP.identifier) {
                            if (replaced) {
                                throw new Error('duplicate');
                            }
                        }
                        if (jp.identifier === oldJP.identifier) {
                            replaced = true;
                            return newJP;
                        }
                        return jp;
                    })
                );
            } catch (e: any) {
                if (e?.message === 'duplicate') {
                    alert(`Duplicate property: There was already a property named ${newJP.identifier}`)
                } else {
                    throw e;
                }
            }
        }
    }, [dialogJPropertyOutput]);

    return <div>
    <DataTable
    value={jproperties}
    emptyMessage="No properties added yet."
    >
        <Column field="accessModifier" header="Access Modifier" body={accessModifierDisplayWithFieldName('accessModifier')}></Column>
        <Column field="dataType" header="Data Type"></Column>
        <Column field="identifier" header="Name"></Column>
        <Column field="getterAccessModifier" header="Getter's Access Modifier" body={accessModifierDisplayWithFieldName('getterAccessModifier')}></Column>
        <Column field="setterAccessModifier" header="Setter's Access Modifier" body={accessModifierDisplayWithFieldName('setterAccessModifier')}></Column>
        <Column body={ActionTemplate} exportable={false} />
    </DataTable>

    <Button onClick={() => {
        setDialogJPropertyInput(undefined);
        setDialog(true);
    }}>Add property</Button>

    <JPropertyDialog
    visible={dialog}
    setVisible={setDialog}
    jproperty={dialogJPropertyInput}
    setJProperty={setDialogJPropertyOutput}
    ></JPropertyDialog>
    </div>;
}
