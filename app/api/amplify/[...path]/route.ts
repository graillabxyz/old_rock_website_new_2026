import { NextRequest, NextResponse } from 'next/server';

// Proxy requests to the Amplify API to avoid CORS issues
const AMPLIFY_API_URL = process.env.AMPLIFY_API_URL || 'https://amplify-api.oldrocknft.com';

/**
 * SECURITY: Allowlist of safe path prefixes that can be proxied.
 * This prevents SSRF attacks where attackers could use this proxy
 * to access internal endpoints or other services.
 */
const ALLOWED_PATH_PREFIXES = [
    'nfts',
    'density',
    'link',
    'verify',
    'achievements',
    'airdrop',
    'user',
];

function isAllowedPath(path: string): boolean {
    const firstSegment = path.split('/')[0].toLowerCase();
    return ALLOWED_PATH_PREFIXES.includes(firstSegment);
}

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');

    // SECURITY: Block requests to non-allowlisted paths
    if (!isAllowedPath(path)) {
        console.warn(`🚫 Blocked proxy request to non-allowlisted path: ${path}`);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${AMPLIFY_API_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Amplify API proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch from Amplify API' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');

    // SECURITY: Block requests to non-allowlisted paths
    if (!isAllowedPath(path)) {
        console.warn(`🚫 Blocked proxy POST request to non-allowlisted path: ${path}`);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${AMPLIFY_API_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    // Get signature from request headers
    const signature = request.headers.get('signature') || '';

    let body;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Amplify API proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch from Amplify API' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');

    // SECURITY: Block requests to non-allowlisted paths
    if (!isAllowedPath(path)) {
        console.warn(`🚫 Blocked proxy PUT request to non-allowlisted path: ${path}`);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${AMPLIFY_API_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const signature = request.headers.get('signature') || '';

    let body;
    try {
        body = await request.json();
    } catch {
        body = {};
    }

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Amplify API proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch from Amplify API' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');

    // SECURITY: Block requests to non-allowlisted paths
    if (!isAllowedPath(path)) {
        console.warn(`🚫 Blocked proxy DELETE request to non-allowlisted path: ${path}`);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${AMPLIFY_API_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const signature = request.headers.get('signature') || '';

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Amplify API proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch from Amplify API' },
            { status: 500 }
        );
    }
}
