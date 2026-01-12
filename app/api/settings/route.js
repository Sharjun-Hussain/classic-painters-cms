import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findFirst();
        return NextResponse.json(settings || {}, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { navbarLinks, footerText, socialLinks } = body;

        // Upsert: Update if exists, create if not (using id: 1 as singleton)
        const settings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: {
                navbarLinks: JSON.stringify(navbarLinks),
                footerText,
                socialLinks: JSON.stringify(socialLinks)
            },
            create: {
                id: 1,
                navbarLinks: JSON.stringify(navbarLinks),
                footerText,
                socialLinks: JSON.stringify(socialLinks)
            },
        });

        return NextResponse.json(settings, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
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
