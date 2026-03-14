import { pgTable, text, vector, serial, index } from "drizzle-orm/pg-core";

export const documents = pgTable('documents', {
    id: serial('id').primaryKey(),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 768 }),
    userId: text('user_id') 
}, (table) => [
    index('embeddingIndex').using(
        'hnsw',
        table.embedding.op('vector_cosine_ops')
    )
])