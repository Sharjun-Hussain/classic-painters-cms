import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
    try {
        let hero = await prisma.heroSection.findFirst();

        // Create default hero if none exists
        if (!hero) {
            hero = await prisma.heroSection.create({
                data: {
                    title: 'Premium House Painters',
                    subtitle: '& Commercial Decorators.',
                    subtitle2: '',
                    description: 'Transform your property with NZ\'s most trusted experts in Interior, Exterior, and Roof Painting.',
                    bgImageUrl: '',
                    primaryBtnText: 'Get Your Free Quote',
                    primaryBtnLink: '#contact',
                    secondaryBtnText: 'Call 0800 PAINTER',
                    secondaryBtnLink: 'tel:0800PAINTER',
                },
            });
        }

        return NextResponse.json(hero, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Hero GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();

        console.log('Updating hero with data:', data);

        // Update or create hero section
        const previousHero = await prisma.heroSection.findFirst({ where: { id: data.id || 1 } });

        const hero = await prisma.heroSection.upsert({
            where: { id: data.id || 1 },
            update: {
                title: data.title,
                subtitle: data.subtitle || null,
                description: data.description || null,
                bgImageUrl: data.bgImageUrl || null,
                primaryBtnText: data.primaryBtnText || null,
                primaryBtnLink: data.primaryBtnLink || null,
                secondaryBtnText: data.secondaryBtnText || null,
                secondaryBtnLink: data.secondaryBtnLink || null,
            },
            create: {
                title: data.title,
                subtitle: data.subtitle || null,
                description: data.description || null,
                bgImageUrl: data.bgImageUrl || null,
                primaryBtnText: data.primaryBtnText || null,
                primaryBtnLink: data.primaryBtnLink || null,
                secondaryBtnText: data.secondaryBtnText || null,
                secondaryBtnLink: data.secondaryBtnLink || null,
            },
        });

        await createAuditLog('UPDATE', 'Hero', hero.id, { previous: previousHero, new: hero }, 1);

        console.log('Hero updated successfully:', hero.id);

        return NextResponse.json(hero, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Hero POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
