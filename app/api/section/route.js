import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: 'Key required' }, { status: 400 });
    }

    try {
        const section = await prisma.sectionContent.findUnique({
            where: { key },
        });
        return NextResponse.json(section || {}, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { key, title, content } = body;

        const section = await prisma.sectionContent.upsert({
            where: { key },
            update: { title, content: JSON.stringify(content) },
            create: { key, title, content: JSON.stringify(content) },
        });

        return NextResponse.json(section, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save section' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
