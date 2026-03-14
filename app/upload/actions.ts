'use server'
import { CanvasFactory } from 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';
import { db } from '@/lib/db-config'
import { documents } from '@/lib/db-schema'
import { getEmbeddings } from '@/lib/embedding'
import { chunkText } from '@/lib/chunking'
import { auth } from '@clerk/nextjs/server'

export async function processPdf(formData: FormData) {
    const { userId } = await auth()  
    if (!userId) return { success: false, error: 'Unauthorized' }  

    const MAX_SIZE = 10 * 1024 * 1024 
    
    let parser: PDFParse | null = null;
    try {
        const file = formData.get('pdf') as File;
        if (!file) return { success: false, error: 'No file uploaded!' }
        
        if (file.size > MAX_SIZE) return { success: false, error: 'File too large. Max 10MB.' }  // add this

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        parser = new PDFParse({ data: buffer, CanvasFactory });
        const result = await parser.getText();

        if (!result?.text?.trim().length) {
            return { success: false, error: 'PDF empty or no extractable text!' }
        }

        const chunks = await chunkText(result.text);
        const embeddings = await getEmbeddings(chunks);

        const dataToInsert = chunks.map((chunk, index) => ({
            content: chunk,
            embedding: embeddings[index],
            userId  
        }));

        await db.insert(documents).values(dataToInsert);

        return {
            success: true,
            message: `PDF processed with ${dataToInsert.length} searchable chunks!`
        };
    } catch (error) {
        console.error('PDF Processing Error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error!' }
    } finally {
        if (parser) {
            await parser.destroy().catch(e => console.error('Destroy failed:', e));
        }
    }
}