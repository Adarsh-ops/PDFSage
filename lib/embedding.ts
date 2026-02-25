import { embed, embedMany } from "ai";
import { google } from '@ai-sdk/google';

const embeddingModel = google.embeddingModel('gemini-embedding-001');

export async function getEmbedding(text: string) {
    const input = text.replace(/\n/g, ' ');

    const { embedding } = await embed({
        model: embeddingModel,
        value: input,
        providerOptions:{
            google:{
                outputDimensionality:768
            }
        }
    });

    return embedding;
}

export async function getEmbeddings(texts: string[]) {
    const inputs = texts.map((text) => text.replace(/\n/g, ' '));

    const { embeddings } = await embedMany({
        model: embeddingModel,
        values: inputs,
        providerOptions: {
            google: {
                outputDimensionality: 768
            }
        }
    });

    return embeddings;
}
