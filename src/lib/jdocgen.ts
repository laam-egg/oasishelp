export class JdocGenError extends Error {};

export class JFormatEngine {
    public readonly tab: string;

    public readonly maxCharsPerLine: number;

    private nestLevel: number;

    private currentLine: string;

    private buf: string;

    private inJdoc: boolean;

    constructor(tab: string = '    ', maxCharsPerLine: number = 100) {
        this.tab = tab;
        this.maxCharsPerLine = maxCharsPerLine;
        this.nestLevel = 0;
        this.currentLine = '';
        this.buf = '';
        this.inJdoc = false;
    }

    toString() {
        return this.buf;
    }

    getCurrentLineIndentation() {
        let buf = '';
        if (this.inJdoc) {
            for (let i = 0; i < this.nestLevel; ++i) {
                buf += this.tab;
            }
            if (this.currentLine.match(/\/\*\*/) === null) {
                // Skip the jdoc prologue /**
                buf += ' *';
                if (this.currentLine) {
                    buf += ' ';
                }
            }
        } else {
            if (this.currentLine) {
                for (let i = 0; i < this.nestLevel; ++i) {
                    buf += this.tab;
                }
            }
            if (this.currentLine.match(/\*\//) !== null) {
                // Encountering jdoc epilogue */ => add one space before it
                buf += ' ';
            }
        }
        return buf;
    }

    flushCurrentLine() {
        // Strip off leading and trailing redundant space
        let currentLine = this.currentLine.replace(/^\s*/, '').replace(/\s*$/, '');

        let indentation = this.getCurrentLineIndentation();
        let maxLineLength = this.maxCharsPerLine - indentation.length;
        if (currentLine.length > maxLineLength) {
            // Find cut point
            let cutPoint: number = -1;
            const m = currentLine.substring(0, maxLineLength).match(/\s[^\s]*$/);
            if (!m) {
                // Cannot found a reasonable cut point. Cut randomly.
                cutPoint = maxLineLength * 0.75;
            } else {
                cutPoint = m['index'] as number;
            }
            const nextLine = currentLine.substring(cutPoint);
            this.currentLine = currentLine.substring(0, cutPoint);
            this.flushCurrentLine();
            this.currentLine = nextLine;
            this.flushCurrentLine();
        } else {
            const newNestLevel = this.nestCheck(this.currentLine);
            // Reread indentation after nest check
            indentation = this.getCurrentLineIndentation();
            this.buf += indentation + this.currentLine + '\n';
            console.log(`nestLevel=${this.nestLevel} inJdoc=${this.inJdoc} - ${this.currentLine}`)
            this.nestLevel = newNestLevel;
            this.currentLine = '';
        }
    }

    write(str: string) {
        const lines = str.replace('\r\n', '\n').replace('\r', '\n').split('\n');
        if (lines.length > 0) {
            const lastIncompleteLine = lines.pop() as string;
            lines.map((line) => {
                this.currentLine += line;
                this.flushCurrentLine();
            });
            this.currentLine += lastIncompleteLine;
        }
    }

    /**
     * Checks the indentation of the given line.
     * 
     * @param str A line to test.
     * @returns the new nest level after this line is added.
     * This function also changes current indentation so that
     * the given line can be added to buf, if necessary.
     */
    nestCheck(str: string): number {
        // First, check if jdoc is open or not.
        let inJdoc = this.inJdoc;
        let sub = str;
        while (sub) {
            let m;
            if (inJdoc) {
                m = sub.match(/\*\//);
                if (m == null) break;
                inJdoc = false;
            } else {
                m = sub.match(/\/\*\*/);
                if (m == null) break;
                inJdoc = true;
            }
            const M = (m as RegExpMatchArray);
            sub = M[0];
        }
        this.inJdoc = inJdoc;

        let bracketParity = 0;
        for (const c of str) {
            switch (c) {
                case '{':
                case '[':
                case '(':
                    ++bracketParity;
                    break;
                
                case '}':
                case ']':
                case ')':
                    --bracketParity;
                    break;
            }
        }
        if (bracketParity > 0) {
            return this.nestLevel + 1;
        } else if (bracketParity < 0) {
            return this.nestLevel == 0 ? this.nestLevel : (--this.nestLevel);
        } else {
            return this.nestLevel;
        }
    }
}

export class JValidator {
    /**
     * Checks whether the given name is a valid Java identifier.
     * 
     * An identifier is the valid name of any function, variable,
     * class etc.
     * 
     * @param {string} name Any name to check.
     * @returns {boolean} Whether this name is a valid Java identifier.
     */
    static checkIdentifier(name: string): boolean {
        return name.match(/^[A-Za-z_$][A-Za-z_$0-9]*$/) !== undefined;
    }

    static validateIdentifier(name: string) {
        if (!this.checkIdentifier(name)) {
            throw new JdocGenError("Invalid Java identifier: " + name);
        }
        return name;
    }

    /**
     * Checks whether the given name is a valid Java data type name.
     * 
     * Currently, this function just checks whether the name is a valid
     * identifier, but this behavior may be changed in the future.
     * 
     * @param {string} name Any name to check.
     * @returns {boolean} Whether this name is a valid Java data type name.
     */
    static checkDataType(name: string): boolean {
        return this.checkIdentifier(name);
    }

    static validateDataType(name: string) {
        if (!this.checkDataType(name)) {
            throw new JdocGenError("Invalid Java data type: " + name);
        }
        return name;
    }

    /**
     * Checks whether the given name is a valid Java access modifier.
     * 
     * It can be either `private`, `protected`, `public` or `` (empty,
     * which is the **default** access modifier in Java).
     * 
     * @param {string} name Any name to check.
     * @returns {boolean} Whether this name is a valid Java access modifier.
     */
    static checkAccessModifier(name: string): boolean {
        return ['private', 'protected', 'public', ''].includes(name);
    }
    
    static validateAccessModifier(name: string) {
        if (!this.checkAccessModifier(name)) {
            throw new JdocGenError("Invalid access modifier: " + name);
        }
        return name;
    }
}

export interface JVariableAttrInput {
    dataType: string;
    identifier: string;
}

export class JVariable implements JVariableAttrInput {
    public readonly dataType: string;

    public readonly identifier: string;

    /**
     * 
     * @param {string} dataType The data type of the variable. Can be Java's available data type as well as any user-defined type - this function won't check that !
     * @param {string} identifier The variable name.
     * 
     * For instance, the Java variable `float f` could be represented as the below example.
     * 
     * @example new JVariable('float', 'f');
     */
    constructor(dataType: string, identifier: string) {
        this.dataType = JValidator.validateDataType(dataType);
        this.identifier = JValidator.validateIdentifier(identifier);
    }

    /**
     * Converts this variable object to a Java code segment
     * of the form:
     * `<dataType> <identifier>`
     * 
     * @example Date date
     * 
     * Note that there is no trailing semicolon !
     * 
     * @returns {string} the segment.
     */
    toString(): string {
        return this.dataType + " " + this.identifier;
    }
}

/**
 * Represents a function parameter.
 */
export class JParameter extends JVariable {
    /**
     * 
     * @param {string} dataType The data type of the parameter.
     * @param {string} identifier The name of the parameter.
     */
    constructor(dataType: string, identifier: string) {
        super(dataType, identifier);
    }
}

export class JFunction {
    public readonly accessModifier: string;
    public readonly returnType: string;
    public readonly identifier: string;
    public readonly parameters: JParameter[];
    public readonly body: string;
    public readonly jdoc: string;

    /**
     * 
     * @param {string} accessModifier The Java access modifier. Same as in the JProperty class's constructor docs.
     * @param {string} returnType The return type of the function.
     * @param {string} identifier The name of the function.
     * @param {JParameter[]} parameters A list of JParameter objects representing this function's parameters.
     * @param {string} body The function body, which is the code inside the outermost curly brace pair of the function's definition.
     * @param {string|undefined} jdoc The Javadoc for the function, or `undefined` if you want the engine to automatically write it out.
     */
    constructor(accessModifier: string, returnType: string, identifier: string, parameters: JParameter[], body: string, jdoc: string|undefined = undefined) {
        this.accessModifier = JValidator.validateAccessModifier(accessModifier);
        this.returnType = JValidator.validateDataType(returnType);
        this.identifier = JValidator.validateIdentifier(identifier);

        this.parameters = [...parameters];

        this.body = body;

        this.jdoc = jdoc ?? this.generateDefaultJdoc();
    }

    /**
     * Converts this function object to a Java code segment
     * of the form:
     * `// Javadoc...\n
     * <accessModifier-optional> <returnType> <identifier>(<parameters>...) {\nbody\n}`
     * 
     * Note that indentation is not taken into consideration !
     * 
     * @returns {string} the segment.
     * 
     * @example
     * (new JFunction(
     *     'public', 'void', 'setData', [
     *         new JParameter('int', 'data'),
     *     ], 'this.data = data;'
     * )).toString();
     * // The JS code above will produce the following Java code output:
     * 
     * // Javadoc, which begins with a slash and two stars, then ends with a star and a slash.
     * public void setData(int data) {
     * this.data = data;
     * }
     */
    toString(): string {
        let buf = `/**\n${this.jdoc.replace('\n', '\n')}\n*/\n`;
        if (this.accessModifier) {
            buf += this.accessModifier + " ";
        }

        buf += this.returnType + " ";
        buf += this.identifier + "(";

        buf += this.parameters.map((param) => param.toString()).join(', ');
        buf += `) {\n${this.body}\n}`;

        return buf;
    }

    /**
     * Generates default Javadoc for the function.
     * 
     * Currently, the engine dumps simple Javadoc based on the function identifier, for example, default Javadoc
     * for function `getTheNameOfTheLord` is `Use this function to get the name of the lord.`
     * 
     * Be aware that this function only works in case the given identifier is camelCased. It will not work
     * otherwise. For example, `getAPIURL` would produce `Use this function to get a p i u r l`. Function names
     * not strictly camel-cased (e.g. `GetAPIURL`) will be considered invalid, and an exception will be raised.
     * 
     * @returns {string} The generated Javadoc.
     */
    generateDefaultJdoc(): string {
        // Brief description
        const doSomething = JFunction._breakIdentifierIntoLowerCasedTokens(this.identifier, 'camel').join(' ');
        let jdoc = `Use this function to ${doSomething}.\n\n`;

        // List parameters
        this.parameters.map((p) => {
            const paramDescription = JFunction._breakIdentifierIntoLowerCasedTokens(p.identifier, 'camel').join(' ');
            jdoc += `@param ${p.identifier} - The ${paramDescription}\n`;
        });

        if (this.returnType !== 'void') {
            jdoc += `@return the result.\n`;
        }
        return jdoc;
    }

    /**
     * Breaks an identifier into tokens as words, assuming a given case.
     * 
     * @param {string} identifier An identifier.
     * @param {string} cas The case to enforce. Possible values are `camel` and `title`. If the identifier
     * is not cased as such, an exception will be thrown.
     * 
     * @returns {string[]} The individual words. For example, if `identifier` is `breakIndentifierIntoLowerCasedTokens`
     * and `cas` is `camel`, then return value is `[break, identifier, into, lower, cased, tokens]`.
     */
    static _breakIdentifierIntoLowerCasedTokens(identifier: string, cas: string): string[] {
        const lowerCaseRegex = /[a-z0-9_$]+/;
        const titleCaseRegex = /[A-Z0-9_$][a-z0-9_$]*/;
        const words = [];
        let firstWordLoaded = false;
        let newStartPos = 0;
        while (newStartPos < identifier.length) {
            let m;
            const substr = identifier.substring(newStartPos);
            if (!firstWordLoaded) {
                // First word: CAMEL: all lowercase ; TITLE: title case
                if (cas === 'camel') {
                    m = substr.match(lowerCaseRegex);
                } else if (cas === 'title') {
                    m = substr.match(titleCaseRegex);
                } else {
                    throw new JdocGenError("Invalid case: " + cas);
                }
                firstWordLoaded = true;
            } else {
                // Following words: title case
                m = substr.match(titleCaseRegex);
            }
            if (m === null || m['index'] !== 0) {
                throw new JdocGenError(`Function name ${identifier} not in camelCase hasn't been supported yet. Please write Javadoc yourself, or change the function name so that it is camel-cased.`);
            }

            let word = m[0];
            // Transform each token to lower case: [get, The, Name, Of, The, Lord] => [get, the, name, of, the, lord].
            word = word.toLowerCase();
            words.push(word);

            newStartPos += m['index'] + m[0].length;
        }

        return words;
    }
}

export interface JPropertyAttrInput extends JVariableAttrInput {
    accessModifier: string|undefined;
    getterAccessModifier: string|undefined;
    setterAccessModifier: string|undefined;
}

export class JProperty extends JVariable implements JPropertyAttrInput {
    public accessModifier: string;
    private functions: JFunction[];
    public readonly getterAccessModifier: string|undefined;
    public readonly setterAccessModifier: string|undefined;

    /**
     * 
     * @param {string} accessModifier The property's access modifier.
     * @param {string} dataType - The data type of the property.
     * @param {string} identifier The property name.
     * @param {string|undefined} getterAccessModifier The access modifier of this property's getter function, or `undefined` to disable generating this function.
     * @param {string|undefined} setterAccessModifier The access modifier of this property's setter function, or `undefined` to disable generating this function.
     * 
     * For instance, the Java property `private double value` could be represented as in the below example.
     * @example new JProperty('private', 'double', 'value', undefined, undefined);
     */
    constructor(accessModifier: string, dataType: string, identifier: string, getterAccessModifier: string | undefined, setterAccessModifier: string | undefined) {
        super(dataType, identifier);
        this.accessModifier = JValidator.validateAccessModifier(accessModifier);

        this.functions = [];
        let capName = identifier[0].toUpperCase() + identifier.substring(1);
        if (getterAccessModifier !== undefined) {
            this.functions.push(new JFunction(
                getterAccessModifier, dataType, `get${capName}`, [],
                `return this.${identifier};`
            ));
        }
        if (setterAccessModifier !== undefined) {
            this.functions.push(new JFunction(
                setterAccessModifier, 'void', `set${capName}`, [
                    new JParameter(dataType, identifier)
                ], `this.${identifier} = ${identifier};`
            ));
        }
        this.getterAccessModifier = getterAccessModifier;
        this.setterAccessModifier = setterAccessModifier;
    }

    /**
     * Converts this property object to a Java code segment
     * of the form:
     * `<accessModifier-optional> <dataType> <identifier>`
     * 
     * For example:
     * `public Date date`
     * 
     * Note that there is no trailing semicolon !
     * 
     * @returns {string} the segment.
     */
    toString(): string {
        let buf = '';
        if (this.accessModifier) {
            buf += this.accessModifier + " ";
        }

        buf += super.toString();
        return buf;
    }

    /**
     * @returns {JFunction[]} A list of this property's getter/setter functions, if any.
     */
    getFunctions(): JFunction[] {
        return [...this.functions];
    }
}

export class JClass {
    public readonly accessModifier: string;
    public readonly identifier: string;
    public readonly extendsWhat: string|undefined;
    public readonly implementsWhat: string|undefined;
    public readonly properties: JProperty[];
    public readonly functions: JFunction[];

    /**
     * 
     * @param {string} accessModifier The access modifier of the class.
     * @param {string} identifier The name of the class.
     * @param {string|undefined} extendsWhat The name of the (base) class which this class extends, or `undefined`.
     * @param {string|undefined} implementsWhat The name of the interface which this class implements, or `undefined`.
     */
    constructor(accessModifier: string, identifier: string, extendsWhat: string|undefined = undefined, implementsWhat: string|undefined = undefined) {
        this.accessModifier = JValidator.validateAccessModifier(accessModifier);
        this.identifier = JValidator.validateIdentifier(identifier);

        this.extendsWhat = this.implementsWhat = undefined;
        if (extendsWhat !== undefined) {
            this.extendsWhat = JValidator.validateIdentifier(extendsWhat);
        }

        if (implementsWhat !== undefined) {
            this.implementsWhat = JValidator.validateIdentifier(implementsWhat);
        }

        /**
         * @type {JProperty[]}
         */
        this.properties = [];

        /**
         * @type {JFunction[]}
         */
        this.functions = [];
    }

    /**
     * Adds a new property to this class.
     * 
     * @param {JProperty} prop The property to be added.
     */
    addProperty(prop: JProperty) {
        this.properties.push(prop);
    }

    /**
     * Adds a new function (method) to this class.
     * 
     * @param {JFunction} func The function to be added.
     */
    addFunction(func: JFunction) {
        this.functions.push(func);
    }

    /**
     * Converts this class object to a Java code segment,
     * with Javadocs (enough for OASIS) as in the following
     * example.
     * 
     * @example
     * // Javadoc here
     * 
     * public class ImageFile {
     *     private String fileName;
     * 
     *     private ImageRawData data;
     * 
     *     // Javadoc here also
     *     public String getFileName() {
     *         return this.fileName;
     *     }
     * 
     *     // Another Javadoc
     *     public void setFileName(String fileName) {
     *         this.fileName = fileName;
     *     }
     * 
     *     // Yet another Javadoc here
     *     public ImageRawData getData() {
     *         return this.data;
     *     }
     * 
     *     // and maybe more functions, properties, getters and setters...
     * }
     */
    toString() {
        let buf = new JFormatEngine();

        ///////////////////////////
        ///// CLASS PROLOGUE //////
        ///////////////////////////

        buf.write(this.accessModifier ? (this.accessModifier + " ") : "");
        buf.write(`class ${this.identifier}` + " ");
        if (this.extendsWhat) {
            buf.write(`extends ${this.extendsWhat} `);
        }
        if (this.implementsWhat) {
            buf.write(`implements ${this.implementsWhat} `);
        }
        buf.write('{\n');

        let firstMemberDefined = false;
        const insertNecessaryNewlinesBeforeMemberDefinition = () => {
            if (firstMemberDefined) {
                buf.write('\n\n');
            } else {
                firstMemberDefined = true;
            }
        };

        ////////////////////////////
        ///// THE PROPERTIES ///////
        ////////////////////////////

        /**
         * @type {JFunction[]}
         */
        let functions: JFunction[] = [];

        for (let p of this.properties) {
            insertNecessaryNewlinesBeforeMemberDefinition();
            buf.write(p.toString() + ';');
            functions.push(...p.getFunctions());
        }

        ////////////////////////////
        ////// THE FUNCTIONS ///////
        ////////////////////////////

        functions.push(...this.functions);
        for (let f of functions) {
            insertNecessaryNewlinesBeforeMemberDefinition();
            buf.write(f.toString());
        }

        ///////////////////////////
        ///// CLASS EPILOGUE //////
        ///////////////////////////

        if (firstMemberDefined) {
            buf.write('\n');
        }
        buf.write('}\n');
        buf.flushCurrentLine();

        return buf.toString();
    }
}
