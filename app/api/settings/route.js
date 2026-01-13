import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

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
        const {
            navbarLinks, footerText, socialLinks, contactEmail, contactPhone, contactAddress, quickLinks,
            logo, favicon,
            headerLogo, headerLogoWidth, headerLogoHeight,
            footerLogo, footerLogoWidth, footerLogoHeight
        } = body;

        // Upsert: Update if exists, create if not (using id: 1 as singleton)
        const previousSettings = await prisma.siteSettings.findFirst({ where: { id: 1 } });

        const settings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: {
                navbarLinks: JSON.stringify(navbarLinks),
                footerText,
                socialLinks: JSON.stringify(socialLinks),
                contactEmail,
                contactPhone,
                contactAddress,
                quickLinks: JSON.stringify(quickLinks),
                logo,
                favicon,
                headerLogo, headerLogoWidth, headerLogoHeight,
                footerLogo, footerLogoWidth, footerLogoHeight
            },
            create: {
                id: 1,
                navbarLinks: JSON.stringify(navbarLinks),
                footerText,
                socialLinks: JSON.stringify(socialLinks),
                contactEmail,
                contactPhone,
                contactAddress,
                quickLinks: JSON.stringify(quickLinks),
                logo,
                favicon,
                headerLogo, headerLogoWidth, headerLogoHeight,
                footerLogo, footerLogoWidth, footerLogoHeight
            },
        });

        await createAuditLog('UPDATE', 'Settings', 1, { previous: previousSettings, new: settings }, 1);

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
