import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    const images = await prisma.galleryImage.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(images, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const category = formData.get('category');
        const title = formData.get('title') || '';

        console.log('Upload request received:', {
            fileName: file?.name,
            fileType: file?.type,
            fileSize: file?.size,
            category
        });

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bucketName = process.env.SUPABASE_BUCKET_NAME || 'gallery';
        console.log('Using bucket:', bucketName);

        // Upload to Supabase
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        console.log('Attempting upload:', fileName);

        // Use admin client to bypass RLS policies
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({
                error: `Upload failed: ${uploadError.message}`,
                details: uploadError
            }, { status: 500 });
        }

        console.log('Upload successful:', uploadData);

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        console.log('Public URL:', publicUrl);

        // Save to Database
        const image = await prisma.galleryImage.create({
            data: {
                src: publicUrl,
                category: category || 'Uncategorized',
                title,
            },
        });

        console.log('Database record created:', image.id);

        return NextResponse.json(image, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (e) {
        console.error('Gallery upload error:', e);
        console.error('Error stack:', e.stack);
        return NextResponse.json({
            error: `Internal Server Error: ${e.message}`,
            stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
        }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        console.log('Delete request for image ID:', id);

        // Get image from database to get the file path
        const image = await prisma.galleryImage.findUnique({
            where: { id: Number.parseInt(id) },
        });

        if (!image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        console.log('Image found:', image.src);

        // Extract filename from URL
        const bucketName = process.env.SUPABASE_BUCKET_NAME || 'gallery';
        const fileName = image.src.split('/').pop();

        console.log('Deleting from bucket:', bucketName, 'file:', fileName);

        // Delete from Supabase Storage using admin client
        const { error: storageError } = await supabaseAdmin.storage
            .from(bucketName)
            .remove([fileName]);

        if (storageError) {
            console.error('Storage deletion error:', storageError);
            // Continue anyway to delete from database
        }

        // Delete from Database
        await prisma.galleryImage.delete({
            where: { id: Number.parseInt(id) },
        });

        console.log('Image deleted successfully');

        return NextResponse.json({ success: true }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (e) {
        console.error('Delete error:', e);
        return NextResponse.json({ error: e.message }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}
