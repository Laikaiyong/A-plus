import { NextRequest, NextResponse } from 'next/server';
import OSS from 'ali-oss';

// Initialize OSS client
const getOssClient = () => {
  return new OSS({
    region: process.env.OSS_ENDPOINT?.split('.')[0] || '',
    accessKeyId: process.env.YH_ALI_ACCESS_KEY || '',
    accessKeySecret: process.env.YH_ALI_ACCESS_SECRET || '',
    bucket: process.env.OSS_BUKCET_NAME || '',
    endpoint: process.env.OSS_ENDPOINT || '',
  });
};

/**
 * GET handler - Download a file from OSS
 */
export async function GET(request: NextRequest) {
  try {
    // Get the file path from the URL parameter
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('filePath');
    const bucketPath = searchParams.get('bucketPath') || '';
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    const ossClient = getOssClient();
    const fullPath = bucketPath ? `${bucketPath}/${filePath}` : filePath;
    
    // Get file from OSS
    const result = await ossClient.get(fullPath);
    
    // Return file data with appropriate content type
    const headers = new Headers();
    if (result.res.headers['content-type']) {
      headers.set('Content-Type', result.res.headers['content-type']);
    }
    
    return new NextResponse(result.content, { 
      status: 200, 
      headers 
    });
  } catch (error: any) {
    console.error('Error getting file from OSS:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST handler - Store a new file to OSS
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customPath = formData.get('path') as string || '';
    const bucketPath = formData.get('bucketPath') as string || '';
    
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Create a buffer from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate file path
    const fileName = file.name;
    const fullPath = bucketPath 
      ? `${bucketPath}/${customPath ? customPath + '/' : ''}${fileName}`
      : `${customPath ? customPath + '/' : ''}${fileName}`;
    
    // Upload to OSS
    const ossClient = getOssClient();
    const result = await ossClient.put(fullPath, buffer, {
      mime: file.type,
    });
    
    return NextResponse.json({ 
      success: true, 
      url: result.url,
      path: fullPath
    });
  } catch (error: any) {
    console.error('Error uploading file to OSS:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT handler - Update an existing file in OSS
 */
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filePath = formData.get('filePath') as string;
    const bucketPath = formData.get('bucketPath') as string || '';
    
    if (!file || !filePath) {
      return NextResponse.json({ 
        error: 'Both file and filePath are required' 
      }, { status: 400 });
    }

    // Create a buffer from the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate full path
    const fullPath = bucketPath ? `${bucketPath}/${filePath}` : filePath;
    
    // Update file in OSS
    const ossClient = getOssClient();
    const result = await ossClient.put(fullPath, buffer, {
      mime: file.type,
    });
    
    return NextResponse.json({ 
      success: true, 
      url: result.url,
      path: fullPath
    });
  } catch (error: any) {
    console.error('Error updating file in OSS:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE handler - Delete a file from OSS
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the file path from the URL parameter
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('filePath');
    const bucketPath = searchParams.get('bucketPath') || '';
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }

    const ossClient = getOssClient();
    const fullPath = bucketPath ? `${bucketPath}/${filePath}` : filePath;
    
    // Delete file from OSS
    await ossClient.delete(fullPath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting file from OSS:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}