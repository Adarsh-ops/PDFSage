import { db } from "./db-config";
import { documents } from "./db-schema";
import { getEmbedding } from "./embedding";
import { desc, gt, cosineDistance, sql, eq, and } from "drizzle-orm";

export async function searchDocs(query: string, userId: string, threshold = 0.5, limit = 5) {
    const embedding = await getEmbedding(query)

    const similarity = sql<number>`1-(${cosineDistance(
        documents.embedding,
        embedding
    )})`

    const similarDocs = await db.select({
        id: documents.id,
        content: documents.content,
        similarity
    })
    .from(documents)
    .where(and(
        gt(similarity, threshold),
        eq(documents.userId, userId) 
    ))
    .limit(limit)
    .orderBy(desc(similarity))

    return similarDocs
}