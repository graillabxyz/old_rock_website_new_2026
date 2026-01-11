import { NextRequest, NextResponse } from 'next/server';

// Proxy requests to the Amplify API to avoid CORS issues
const AMPLIFY_API_URL = process.env.AMPLIFY_API_URL || 'https://amplify-api.oldrocknft.com';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');
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
