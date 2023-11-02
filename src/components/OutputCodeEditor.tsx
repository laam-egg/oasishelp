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

import { useState } from "react";

import CodeEditor from '@uiw/react-textarea-code-editor';
import { Button } from "primereact/button";
import ClassPropertyTable, { AccessModifierInput, IdentifierInput } from "./ClassPropertyTable";
import { JClass, JProperty } from "@/lib/jdocgen";

export default function OutputCodeEditor() {
    const [jclassAccessModifier, setJClassAccessModifier] = useState(undefined as string|undefined);

    const [jclassName, setJClassName] = useState('');

    const [jproperties, setJProperties] = useState([] as JProperty[]);

    const [code, setCode] = useState('');

    const [codeGenerationSuccessful, setCodeGenerationSuccessful] = useState(false);

    const generateCode = () => {
        if (jclassAccessModifier === undefined) {
            return alert('You have to select your class\' access modifier !');
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
                return alert(`Error: Class name cannot be empty.`);
            }
            return alert(`Error: ${e?.message}`)
        }
        for (const p of jproperties) {
            c.addProperty(p);
        }

        fetch('/api/prettify/java', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            },
            body: JSON.stringify({
                code: c.toString(),
            }),
        })
        .then((res) => res.json())
        .then(({ success, code, message }) => {
            if (success) {
                setCodeGenerationSuccessful(true);
                setCode(code);
            } else {
                setCodeGenerationSuccessful(false);
                setCode('');
                alert("ERROR: " + message);
            }
        })
        .catch((err: any) => {
            setCodeGenerationSuccessful(false);
            alert(`HTTP ERROR:  ${err?.message}`);
            console.log(err);
        });
    };

    return <div>
        <h1>Generate your Java class with Javadoc autofill</h1>
        <div style={{ display: 'inline-block', padding: '5px' }}>
            <AccessModifierInput id='jclassAccessModifierInput' accessModifier={jclassAccessModifier} setAccessModifier={setJClassAccessModifier} />
            <span style={{ padding: '5px', fontSize: 'large' }}>class</span>
            <IdentifierInput id='jclassNameInput' identifier={jclassName} setIdentifier={setJClassName} />
        </div>

        <h2>Properties</h2>
        <ClassPropertyTable jproperties={jproperties} setJProperties={setJProperties} />

        <h2>Output</h2>
        <div>
            <Button severity='success' onClick={generateCode}>Generate Code !</Button>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                width: '100%'
            }}>
            
            <p style={{
                display: codeGenerationSuccessful ? 'block' : 'none',
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
    </div>;
}
