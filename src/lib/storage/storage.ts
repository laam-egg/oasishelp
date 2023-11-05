import { JClass } from "../jdocgen/jdocgen";

// Source: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#feature-detecting_localstorage
function storageAvailable(type: 'sessionStorage'|'localStorage'): boolean {
    let storage;
    try {
        storage = window[type];
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return Boolean(
            e instanceof DOMException &&
            // everything except Firefox
            (e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === "QuotaExceededError" ||
                // Firefox
                e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}

function assertStorageUsable(): void {
    while (!storageAvailable('localStorage')) {
        alert('This web app needs to use your local storage to save your Java classes\' information.\nPlease enable cookies or local storage for this website, then click OK.');
    }
}

export async function getAllJClasses(): Promise<JClass[]> {
    assertStorageUsable();

    const raw = localStorage.getItem('jclasses');
    if (!raw) return [];
    
    const jclasses = (JSON.parse(raw) as any[]).map((c: any) => JClass.fromSerializable(c));
    return jclasses;
}

async function setAllJClasses(jclasses: JClass[]): Promise<void> {
    assertStorageUsable();

    const raw = JSON.stringify(jclasses.map((c: JClass) => c.toSerializable()));
    localStorage.setItem('jclasses', raw);
}

/**
 * No need for parameters: to update JClass objects,
 * just call getAllJClasses() again !
 */
export type OnJClassChangeCallback = () => void;

export class OnJClassChangeCallbackRegistry {
    private static instance: ReturnType<typeof OnJClassChangeCallbackRegistry._create>|undefined = undefined;

    private static _create() {
        const callbacks: Map<number, OnJClassChangeCallback>
            = new Map<number, OnJClassChangeCallback>();
        
        let lastInsertId: number = 0;
        
        window.addEventListener('storage', (event: StorageEvent) => {
            if ( ! ['jclasses', null].includes(event.key)) return;
            for (const [, callback] of callbacks) {
                callback();
            }
        });

        return {
            register(c: OnJClassChangeCallback): number {
                callbacks.set(++lastInsertId, c);
                return lastInsertId;
            },

            deregister(id: number): void {
                callbacks.delete(id);
            }
        };
    }

    /**
     * Registers a callback that gets called whenever the JClass list
     * changed by other tabs with same URL, not this tab.
     * 
     * @param callback The callback.
     * @returns the ID of the callback, which can be used to later
     *          deregister the callback with static method
     *          `OnJClassChangeCallbackRegistry.deregister`.
     */
    public static register(c: OnJClassChangeCallback): number {
        if (!OnJClassChangeCallbackRegistry.instance) {
            OnJClassChangeCallbackRegistry.instance = OnJClassChangeCallbackRegistry._create();
        }
        return OnJClassChangeCallbackRegistry.instance.register(c);
    }

    public static deregister(id: number): void {
        if (!OnJClassChangeCallbackRegistry.instance) {
            OnJClassChangeCallbackRegistry.instance = OnJClassChangeCallbackRegistry._create();
        }
        return OnJClassChangeCallbackRegistry.instance.deregister(id);
    }
}

export async function addJClass(newJClass: JClass): Promise<void> {
    // assertStorageUsable();
    const allJClasses: JClass[] = await getAllJClasses();
    for (const jclass of allJClasses) {
        if (jclass.identifier == newJClass.identifier) {
            throw new Error(`A Java class with name ${newJClass.identifier} already exists.`);
        }
    }
    allJClasses.push(newJClass);
    await setAllJClasses(allJClasses);
}

export async function removeJClass(identifier: string): Promise<void> {
    // assertStorageUsable();
    const allJClasses: JClass[] = await getAllJClasses();
    await setAllJClasses(allJClasses.filter((jclass) => jclass.identifier != identifier));
}

/**
 * Adds or modifies a JClass in storage.
 * 
 * @param newJClass A JClass instance to be saved.
 * @param oldIdentifier Must be an empty string if adding a new JClass.
 *                      If modifying an existing one, this is the old
 *                      identifier of the class.
 */
export async function saveJClass(newJClass: JClass, oldIdentifier: string): Promise<void> {
    // assertStorageUsable();
    if (!oldIdentifier) {
        await addJClass(newJClass);
    } else {
        const allJClasses: JClass[] = await getAllJClasses();
        setAllJClasses(allJClasses.map((jclass: JClass) => {
            if (jclass.identifier == oldIdentifier) {
                return newJClass;
            }
            if (jclass.identifier == newJClass.identifier) {
                throw new Error(`A Java class named ${newJClass.identifier} already exists.`);
            }
            return jclass;
        }));
    }
}

export async function loadJClass(identifier: string): Promise<JClass> {
    // assertStorageUsable();
    const allJClasses: JClass[] = await getAllJClasses();
    for (const jclass of allJClasses) {
        if (jclass.identifier == identifier) {
            return jclass;
        }
    }
    throw new Error(`Cannot find Java class named ${identifier}`);
}
