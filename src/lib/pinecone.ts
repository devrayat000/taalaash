import { Pinecone } from '@pinecone-database/pinecone';
import { fetchWithEvent } from '@tanstack/react-start/server'

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
    fetchApi: fetchWithEvent,
})

export const pineconeIndex = pinecone.Index('taalaash');