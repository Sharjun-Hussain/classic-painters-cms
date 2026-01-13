import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await prisma.$transaction([
            prisma.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true },
                    },
                },
            }),
            prisma.auditLog.count(),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
