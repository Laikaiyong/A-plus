import { NextRequest, NextResponse } from 'next/server';
import { AnalyticDBVectorStore } from "@langchain/community/vectorstores/analyticdb";
import { Document } from "@langchain/core/documents";
import { AlibabaCloudEmbeddings } from "@/utils/embedding";

// Initialize database connection options
const getConnectionOptions = () => {
  return {
    host: process.env.ANALYTICS_DB_HOST || "localhost",
    port: Number(process.env.ANALYTICS_DB_PORT) || 5432,
    database: process.env.ANALYTICS_DB_DATABASE || "analytics",
    user: process.env.ANALYTICS_DB_USERNAME || "username",
    password: process.env.ANALYTICS_DB_PASSWORD || "password",
  };
};

// Initialize vector store
const getVectorStore = async (
  tableName: string = 'langchain_vectors'
) => {
  const embeddings = new AlibabaCloudEmbeddings({
    apiKey: process.env.DASHSCOPE_API_KEY || '',
  });
  
  return new AnalyticDBVectorStore(embeddings, {
    connectionOptions: getConnectionOptions(),
    tableName // Using shorthand property notation
  });
};

/**
 * POST handler - Add documents to vector store
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texts, metadatas, table } = body;
    
    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json({ 
        error: 'Texts array is required' 
      }, { status: 400 });
    }
    
    // Initialize vector store with optional custom table name
    const vectorStore = await getVectorStore(table);
    
    // Prepare documents
    let documents: Document[];
    if (metadatas && Array.isArray(metadatas)) {
      if (metadatas.length !== texts.length) {
        return NextResponse.json({
          error: 'Metadatas array length must match texts array length'
        }, { status: 400 });
      }
      documents = texts.map((text, i) => new Document({
        pageContent: text,
        metadata: metadatas[i]
      }));
    } else {
      documents = texts.map(text => new Document({ pageContent: text }));
    }
    
    // Add documents to vector store
    await vectorStore.addDocuments(documents);
    
    // Close connection
    await vectorStore.end();
    
    return NextResponse.json({ 
      success: true, 
      message: `Added ${documents.length} documents to vector store` 
    });
  } catch (error: unknown) {
    console.error('Error adding documents to vector store:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET handler - Search for similar documents
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const k = parseInt(searchParams.get('k') || '4');
    const table = searchParams.get('table') || undefined;
    const filter = searchParams.get('filter');
    const includeScore = searchParams.get('includeScore') === 'true';
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // Initialize vector store
    const vectorStore = await getVectorStore(table);
    
    // Parse filter if provided
    let filterObj = undefined;
    if (filter) {
      try {
        filterObj = JSON.parse(filter);
      } catch (parseError) {
        return NextResponse.json({ error: 'Invalid filter format' }, { status: 400 });
      }
    }
    
    // Search for similar documents
    let results;
    if (includeScore) {
      results = await vectorStore.similaritySearchWithScore(query, k, filterObj);
    } else {
      results = await vectorStore.similaritySearch(query, k, filterObj);
    }
    
    // Close connection
    await vectorStore.end();
    
    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error('Error searching vector store:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE handler - Delete documents from vector store
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');
    const table = searchParams.get('table') || undefined;
    
    if (!filter) {
      return NextResponse.json({ 
        error: 'Filter is required for DELETE operations' 
      }, { status: 400 });
    }
    
    // Initialize vector store
    const vectorStore = await getVectorStore(table);
    
    // Parse filter
    let filterObj;
    try {
      filterObj = JSON.parse(filter);
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid filter format' }, { status: 400 });
    }
    
    // Use the delete method instead of accessing private properties
    await vectorStore.delete({ filter: filterObj });
    
    // Close connection
    await vectorStore.end();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Documents deleted successfully' 
    });
  } catch (error: unknown) {
    console.error('Error deleting documents from vector store:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}