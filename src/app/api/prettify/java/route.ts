import * as prettier from 'prettier';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        return NextResponse.json({
            code: await prettier.format(code, {
                parser: 'java',
                plugins: [ 'prettier-plugin-java' ],
                tabWidth: 4,
                useTabs: false,
            }),
            success: true,
        }, {
            status: 200
        });
    } catch (e: any) {
        return NextResponse.json({
            success: false,
            message: e?.message,
        }, {
            status: 400
        });
    }
}
