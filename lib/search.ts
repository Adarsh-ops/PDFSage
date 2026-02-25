import { db } from "./db-config";
import { documents } from "./db-schema";
import { getEmbedding } from "./embedding";
import { desc,gt,cosineDistance,sql } from "drizzle-orm";

export async function searchDocs(query:string, threshold=0.5, limit=5){
    const embedding=await getEmbedding(query)

    const similarity=sql<number>`1-(${cosineDistance(
        documents.embedding,
        embedding
    )})`

    const similarDocs=await db.select({
        id:documents.id,
        content:documents.content,
        similarity
    })
    .from(documents)
    .where(gt(similarity,threshold))
    .limit(limit)
    .orderBy(desc(similarity))

    return similarDocs
}