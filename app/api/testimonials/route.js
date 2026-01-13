import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET() {
    try {
        const testimonials = await prisma.testimonial.findMany();
        return NextResponse.json(testimonials, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, role, content, avatar } = body;

        const testimonial = await prisma.testimonial.create({
            data: { name, role, content, avatar },
        });

        await createAuditLog('CREATE', 'Testimonial', testimonial.id, testimonial, 1);

        return NextResponse.json(testimonial, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
    }
}


export async function PUT(request) {
    try {
        const body = await request.json();
        const { id, name, role, content, avatar } = body;

        const previousTestimonial = await prisma.testimonial.findUnique({ where: { id: parseInt(id) } });

        const testimonial = await prisma.testimonial.update({
            where: { id: parseInt(id) },
            data: { name, role, content, avatar },
        });

        await createAuditLog('UPDATE', 'Testimonial', testimonial.id, { previous: previousTestimonial, new: testimonial }, 1);

        return NextResponse.json(testimonial, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const previousTestimonial = await prisma.testimonial.findUnique({ where: { id: parseInt(id) } });

        await prisma.testimonial.delete({
            where: { id: parseInt(id) },
        });

        await createAuditLog('DELETE', 'Testimonial', id, previousTestimonial, 1);

        return NextResponse.json({ success: true }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
