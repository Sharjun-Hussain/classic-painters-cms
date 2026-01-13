import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import bcrypt from 'bcryptjs';

// Helper to get current user ID (Mocked for now, replace with actual auth logic)
// In a real app, you'd extract this from the session/token
const getCurrentUserId = () => 1;

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            where: {
                isSuperAdmin: false,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                // Exclude password
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        await createAuditLog('CREATE', 'User', newUser.id, { name, email }, getCurrentUserId());

        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const userId = Number(id);

        const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
        if (!userToDelete) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (userToDelete.isSuperAdmin) {
            return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 403 });
        }

        const deletedUser = await prisma.user.delete({
            where: { id: userId },
        });

        await createAuditLog('DELETE', 'User', userId, { name: deletedUser.name, email: deletedUser.email }, getCurrentUserId());

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
