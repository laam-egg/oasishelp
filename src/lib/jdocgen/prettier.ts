// Previously I imported prettier like this:
//     import * as prettier from 'prettier';
// and it did not work on browser. Just on
// the server.
// 
// It turns out that to run prettier in browser
// I have to import it like the following (huge
// thanks to https://stackoverflow.com/a/61100914/13680015)
import * as prettier from 'prettier/standalone';
import * as prettierPluginJava from '@/lib/jdocgen/prettierPluginJava';

/**
 * Formats Java code with prettier and prettier-plugin-java
 * JS libraries.
 * 
 * @param code The Java code snippet to prettify.
 * @returns {Promise<string>} a promise that resolves to
 * formatted code.
 */
export function prettify(code: string): Promise<string> {
    return prettier.format(code, {
        parser: 'java',
        plugins: [ prettierPluginJava ],
        tabWidth: 4,
        useTabs: false,
    });
}
