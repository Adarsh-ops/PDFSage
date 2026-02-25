import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters'

export const getChunks=new RecursiveCharacterTextSplitter({
    chunkSize:1000,
    chunkOverlap:200,
    separators:['\n\n','\n',',',' ']
})

export async function chunkText(text:string){
    return await getChunks.splitText(text.trim())
}