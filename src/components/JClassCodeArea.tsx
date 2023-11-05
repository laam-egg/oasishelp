'use client';

/*
Sample Java code:

public class Main {
                    public static void main(
                        String[] args
                    ) {
                            System.out.println("HELLO");
                        System.out.println("SECOND HELLO");
                    }
                }

*/

import { RefObject, useEffect, useState, useContext } from "react";

import CodeEditor from '@uiw/react-textarea-code-editor';
import { Button } from "primereact/button";
import JClassPropertyTable from "./partial/JClassPropertyTable";
import { JClass, JProperty } from "@/lib/jdocgen/jdocgen";
import { prettify } from "@/lib/jdocgen/prettier";
import AccessModifierInput from "./partial/AccessModifierInput";
import IdentifierInput from "./partial/IdentifierInput";
import { useRouter, useSearchParams } from "next/navigation";
import { loadJClass, saveJClass } from "@/lib/storage/storage";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { GlobalToastContext } from "@/contexts/GlobalToastContext";

export default function JClassCodeArea() {
    const router = useRouter();

    const searchParams = useSearchParams(); 

    const [jclassOldName, setJClassOldName] = useState('');

    const [jclassAccessModifier, setJClassAccessModifier] = useState(undefined as string|undefined);

    const [jclassName, setJClassName] = useState('');

    const [jproperties, setJProperties] = useState([] as JProperty[]);

    const [code, setCode] = useState('');

    const [codeGenerationSuccessful, setCodeGenerationSuccessful] = useState(false);

    // dirty is true if the form (here it is the class editor)
    // has been modified since last save, and false if not.
    // Currently it is not used.
    const [dirty, setDirty] = useState(false);

    const [saveErrorDialog, setSaveErrorDialog] = useState(false);

    const [saveErrorDialogMessage, setSaveErrorDialogMessage] = useState('');

    const [displayExitButtonInSaveErrorDialog, setDisplayExitButtonInSaveErrorDialog] = useState(true);

    const globalToastRef = useContext(GlobalToastContext);

    useEffect(() => {
        const oldName = searchParams.get('identifier')
        if (oldName) {
            setJClassOldName(oldName);
        }
    }, []);

    useEffect(() => {
        setDirty(false);
        if (!jclassOldName) return;
        loadJClass(jclassOldName).then((jclass: JClass) => {
            setJClassAccessModifier(jclass.accessModifier);
            setJClassName(jclass.identifier);
            setJProperties(jclass.properties);
            setCode('');
            setCodeGenerationSuccessful(false);
        }).catch((e) => {
            alert(`Java class not found: ${jclassOldName}`);
        });
    }, [jclassOldName]);

    const save = async (forceReset: boolean): Promise<JClass|undefined> => {
        if (forceReset) setDirty(true);
        else {
            if (!dirty) return undefined;
        }
        if (jclassAccessModifier === undefined) {
            throw new Error('You have to select your class\' access modifier !');
        }
        let c;
        try {
            c = new JClass(
                jclassAccessModifier,
                jclassName,
                undefined, undefined
            );
        } catch (e: any) {
            if (!jclassName) {
                throw new Error('Class name cannot be empty.');
            }
            throw e;
        }
        for (const p of jproperties) {
            c.addProperty(p);
        }
        
        await saveJClass(c, jclassOldName);
        setJClassOldName(c.identifier);
        setDirty(false);
        (
            (globalToastRef as RefObject<Toast>)
            .current as Toast
        ).show({
            severity: 'success',
            summary: `Saved "${c.identifier}"`,
            detail: `Your Java class "${c.identifier}" has been saved successfully.`,
            life: 2000
        });
        return c;
    };

    const generateCode = async () => {
        try {
            const c: JClass = (await save(true)) as JClass;
            console.log(c.toString());
            const newCode = await prettify(c.toString());
            setCodeGenerationSuccessful(true);
            setCode(newCode);
        } catch (e: any) {
            setCodeGenerationSuccessful(false);
            setCode('');
            alert("ERROR: " + e?.message);
        }
    };

    const forceBackToClassList = () => {
        router.push('/');
    }

    return <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button label="Back" severity="secondary" onClick={async () => {
                try {
                    await save(false);
                    forceBackToClassList();
                } catch (e: any) {
                    setSaveErrorDialogMessage(e?.message);
                    setDisplayExitButtonInSaveErrorDialog(true);
                    setSaveErrorDialog(true);
                }
            }} />

            <Button label="Save" onClick={async () => {
                try {
                    await save(true);
                } catch (e: any) {
                    setSaveErrorDialogMessage(e?.message);
                    setDisplayExitButtonInSaveErrorDialog(false);
                    setSaveErrorDialog(true);
                }
            }} />
            
            {dirty
            ? <span style={{ color: 'red' }}>{'(Not saved)'}</span>
            : <span>{'(Saved)'}</span>
            }
        </div>
        <div style={{ display: 'inline-block', padding: '5px' }}>
            <AccessModifierInput id='jclassAccessModifierInput' accessModifier={jclassAccessModifier} setAccessModifier={setJClassAccessModifier} setDirty={setDirty} />
            <span style={{ padding: '5px', fontSize: 'large' }}>class</span>
            <IdentifierInput id='jclassNameInput' identifier={jclassName} setIdentifier={setJClassName} setDirty={setDirty} />
        </div>

        <h2>Properties</h2>
        <JClassPropertyTable jproperties={jproperties} setJProperties={setJProperties} setDirty={setDirty} />

        <h2>Output</h2>
        <div>
            <Button label='Generate Code !' severity='success' onClick={generateCode} />
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                width: '100%'
            }}>
            
            <p style={{
                display: (codeGenerationSuccessful ? 'block' : 'none'),
            }}>
                Your code has been successfully generated !<br />
                You can edit your below code directly, then copy and paste it to IntelliJ.
            </p>

            <CodeEditor
                value={code}
                language="java"
                padding={5}
                style={{
                    fontSize: 14,
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                }}
                placeholder="Your code will show up here."
                onChange={(event) => {
                    setCode(event.target.value);
                }}
            />
            </div>
        </div>

        <Dialog
        header='Error while saving your class'
        visible={saveErrorDialog}
        style={{ width: '50vw' }}
        onHide={() => setSaveErrorDialog(false)}
        >
            <div style={{ color: 'red' }}>{saveErrorDialogMessage}</div>
            <br />
            <Button label="Continue editing your class" onClick={() => setSaveErrorDialog(false)} />
            {
                displayExitButtonInSaveErrorDialog
                ? <Button
                    label="Exit without saving"
                    severity="danger"
                    onClick={() => {
                        setSaveErrorDialog(false);
                        forceBackToClassList();
                    }} />
                : <></>
            }
        </Dialog>
    </div>;
}
