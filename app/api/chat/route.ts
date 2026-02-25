import { convertToModelMessages, InferUITools, stepCountIs, streamText, tool, UIDataTypes, UIMessage } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { groq } from '@ai-sdk/groq'
import z from "zod";
import { searchDocs } from "@/lib/search";

const tools = {
    searchKnowledgeBase: tool({
        description: 'Search the knowledge base for relevant information',
        inputSchema: z.object({
            query: z.string().describe('The query to search knowledge base with')
        }),
        execute: async ({ query }) => {
            try {
                const results = await searchDocs(query, 0.5, 3)

                if (results.length == 0) {
                    return 'No relevant info found in knowledge base.'
                }

                const formattedResults = results.map((result, i) => `Result ${i + 1} ${result.content}`).join('\n\n')

                return formattedResults
            } catch (error) {
                return `Error searching knowledge base: ${(error as Error).message}`
            }
        }
    }),
    webSearchTool: tool({
        description: 'Search the web for up-to-date information',
        inputSchema: z.object({
            query: z.string().describe('The query to search the web with')
        }),
        execute: async ({ query }) => {
            try {
                const response = await fetch('https://api.tavily.com/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        api_key: process.env.TAVILY_API_KEY,
                        query,
                        max_results: 3,
                    }),
                });

                const data = await response.json();

                if (!data.results || data.results.length === 0) {
                    return "No search results found.";
                }

                return data.results
                    .map((r: any) => `Source: ${r.url}\nContent: ${r.content}`)
                    .join('\n\n');

            } catch (error) {
                return `Web search failed: ${(error as Error).message}`;
            }
        }
    }),
}

export type ChatTools = InferUITools<typeof tools>
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>

export async function POST(req: NextRequest) {
    const { messages }: { messages: ChatMessage[] } = await req.json()

    try {
        const result = streamText({
            model: groq('openai/gpt-oss-20b'),
            messages: await convertToModelMessages(messages),
            tools,
            stopWhen: stepCountIs(10),
            system: `You are a helpful assistant. 
            Use 'searchKnowledgeBase' for internal queries. 
            Use 'webSearchTool' for weather, news, or general real-time info.
            If a tool fails, inform the user honestly.You are a specialized assistant that uses tools. When a tool is required, output the tool call immediately. Do not provide any conversational preamble, 'Sure!', or analysis before the tool call. Output ONLY the tool call structure.`,
            temperature:0
        })

        return result.toUIMessageStreamResponse()
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: (error as Error).message }, { status: 500 })
    }
}