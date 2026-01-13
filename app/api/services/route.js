import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
    try {
        const services = await prisma.service.findMany();
        return NextResponse.json(services, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, description, icon, bgImage } = body;

        const service = await prisma.service.create({
            data: { title, description, icon, bgImage },
        });

        await createAuditLog('CREATE', 'Service', service.id, service, 1);

        return NextResponse.json(service, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, title, description, icon, bgImage } = body;

        const updateData = { title, description, icon };
        if (bgImage) {
            updateData.bgImage = bgImage;
        }

        const previousService = await prisma.service.findUnique({ where: { id: parseInt(id) } });

        const service = await prisma.service.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        await createAuditLog('UPDATE', 'Service', service.id, { previous: previousService, new: service }, 1);

        return NextResponse.json(service, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const previousService = await prisma.service.findUnique({ where: { id: parseInt(id) } });

        await prisma.service.delete({
            where: { id: parseInt(id) },
        });

        await createAuditLog('DELETE', 'Service', id, previousService, 1);

        return NextResponse.json({ success: true }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
