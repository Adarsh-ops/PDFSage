'use server'

import {PDFParse} from 'pdf-parse'
import { db } from '@/lib/db-config'
import { documents } from '@/lib/db-schema'
import { getEmbeddings } from '@/lib/embedding'
import { chunkText } from '@/lib/chunking'

export async function processPdf(formData:FormData){
    try {
        const file=formData.get('pdf') as File

        const bytes=await file.arrayBuffer()
        const buffer=Buffer.from(bytes)
        
        const parser=new PDFParse({data:buffer})
        const result=await parser.getText()

        if(result.text.trim().length===0 || !result.text){
            return {
                success:false,
                error:'Pdf empty!'
            }
        }

        const chunks=await chunkText(result.text)
        const embeddings=await getEmbeddings(chunks)

        const dataToInsert=chunks.map((chunk,index)=>({
            content:chunk,
            embedding:embeddings[index]
        }))

        await db.insert(documents).values(dataToInsert)
        
        return {
            success:true,
            message:`Pdf processed and data inserted with ${dataToInsert.length} searchable chunks!`
        }        
    } catch (error) {
        console.error(error)
        return {
            success:false,
            error: error instanceof Error? error.message : 'Unknown error!'
        }
    }
}