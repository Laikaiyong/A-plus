import { Embeddings } from "@langchain/core/embeddings";
import axios from "axios";
import { AsyncCaller } from "@langchain/core/utils/async_caller";

interface AlibabaCloudEmbeddingsParams {
  apiKey: string;
  modelName?: string;
  dimensions?: number;
}

export class AlibabaCloudEmbeddings implements Embeddings {
  caller: AsyncCaller = new AsyncCaller({});
  private apiKey: string;
  private modelName: string;
  private dimensions: number;
  private endpoint: string = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/embeddings";

  constructor(params: AlibabaCloudEmbeddingsParams) {
    this.apiKey = params.apiKey;
    this.modelName = params.modelName || "text-embedding-v3";
    this.dimensions = params.dimensions || 1024;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // Process in batches of 20 as a reasonable limit
    for (let i = 0; i < texts.length; i += 20) {
      const batch = texts.slice(i, i + 20);
      const batchEmbeddings = await this.getEmbeddings(batch);
      embeddings.push(...batchEmbeddings);
    }
    
    return embeddings;
  }

  async embedQuery(text: string): Promise<number[]> {
    const embeddings = await this.getEmbeddings([text]);
    return embeddings[0];
  }

  async getEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.modelName,
          input: texts,
          dimension: this.dimensions.toString(),
          encoding_format: "float"
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.data) {
        // Extract embeddings from response
        return response.data.data.map((item: { embedding: number[] }) => item.embedding);
      } else {
        throw new Error('Invalid response format from Alibaba Cloud Embedding service');
      }
    } catch (error: unknown) {
      console.error("Error calling Alibaba Cloud Embedding API:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Alibaba Cloud Embedding API error: ${errorMessage}`);
    }
  }
}