import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
        return NextResponse.next();
    }

    const user = process.env.BASIC_AUTH_USER;
    const pass = process.env.BASIC_AUTH_PASS;

    if (!user || !pass) {
        return  NextResponse.next();
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader) {
        const [type, credentials] = authHeader.split(' ');
        if (type === 'Basic' && credentials) {
            const decoded = Buffer.from(credentials, 'base64').toString();
            const [enteredUser, enteredPass] = decoded.split(':');

            if (enteredUser === user && enteredPass === pass) {
                return NextResponse.next();
            }
        }
    }

    return new NextResponse('Authentication required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Protected"',
        },
    });
}

export const config = {
    matcher: ['/((?!_next/static|_next/image).*)'],
};