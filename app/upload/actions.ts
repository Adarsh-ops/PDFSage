'use server'

import { CanvasFactory } from 'pdf-parse/worker';   // ← MUST BE FIRST (fixes DOMMatrix)
import { PDFParse } from 'pdf-parse';

import { db } from '@/lib/db-config'
import { documents } from '@/lib/db-schema'
import { getEmbeddings } from '@/lib/embedding'
import { chunkText } from '@/lib/chunking'

export async function processPdf(formData: FormData) {
    let parser: PDFParse | null = null;

    try {
        const file = formData.get('pdf') as File;
        if (!file) {
            return { success: false, error: 'No file uploaded!' };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Correct v2 usage with CanvasFactory
        parser = new PDFParse({
            data: buffer,
            CanvasFactory
        });

        const result = await parser.getText();

        if (!result?.text?.trim().length) {
            return {
                success: false,
                error: 'Pdf empty or no extractable text!'
            };
        }

        const chunks = await chunkText(result.text);
        const embeddings = await getEmbeddings(chunks);

        const dataToInsert = chunks.map((chunk, index) => ({
            content: chunk,
            embedding: embeddings[index]
        }));

        await db.insert(documents).values(dataToInsert);

        return {
            success: true,
            message: `Pdf processed and data inserted with ${dataToInsert.length} searchable chunks!`
        };
    } catch (error) {
        console.error('PDF Processing Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error!'
        };
    } finally {
        // Clean up memory (critical for serverless)
        if (parser) {
            await parser.destroy().catch(e => console.error('Destroy failed:', e));
        }
    }
}