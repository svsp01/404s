"use server"

import clientPromise from '@/lib/db';
import { generate404Page } from '@/lib/gemini';
import { ObjectId } from "mongodb";

// Interface for client-side usage
export interface Page404 {
  _id?: string;
  prompt: string;
  htmlVersion: string;
  nextjsVersion: string;
  createdAt: Date;
}

// Interface for MongoDB document
interface MongoPage404 {
  _id?: ObjectId;
  prompt: string;
  htmlVersion: string;
  nextjsVersion: string;
  createdAt: Date;
}

export async function createNew404Page(prompt: string): Promise<Page404> {
  console.log('Starting createNew404Page with prompt:', prompt);
  
  const client = await clientPromise;
  console.log('MongoDB client connected:', !!client);

  const db = client.db("404forge");
  console.log('Database selected: 404forge');

  try {
    console.log('Generating 404 page content with prompt:', prompt);
    const generatedContent = await generate404Page(prompt);
    console.log('Generated content:', {
      htmlVersionLength: generatedContent.htmlVersion?.length,
      nextjsVersionLength: generatedContent.nextjsVersion?.length
    });

    console.log('Preparing document for MongoDB insertion');
    const page404: MongoPage404 = {
      prompt,
      htmlVersion: generatedContent.htmlVersion,
      nextjsVersion: generatedContent.nextjsVersion,
      createdAt: new Date(),
    };
    console.log('Prepared document:', page404);

    console.log('Inserting document into MongoDB collection "pages"');
    const result = await db.collection("pages").insertOne(page404);
    console.log('Insert result:', {
      acknowledged: result.acknowledged,
      insertedId: result.insertedId.toString()
    });

    console.log('Returning formatted document for client');
    const returnValue = {
      _id: result.insertedId.toString(),
      prompt: page404.prompt,
      htmlVersion: page404.htmlVersion,
      nextjsVersion: page404.nextjsVersion,
      createdAt: page404.createdAt
    };
    console.log('Return value:', returnValue);
    
    return returnValue;
  } catch (error) {
    console.error('Error creating 404 page:', error);
    throw error;
  }
}

export async function getAll404Pages(): Promise<Page404[]> {
  const client = await clientPromise;
  const db = client.db("404forge");

  try {
    // Get all 404 pages, sorted by creation date (newest first)
    const pages = await db
      .collection("pages")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convert MongoDB documents to plain objects with string IDs
    return pages.map(page => ({
      _id: page._id.toString(),
      prompt: page.prompt,
      htmlVersion: page.htmlVersion,
      nextjsVersion: page.nextjsVersion,
      createdAt: page.createdAt,
    }));
  } catch (error) {
    console.error("Error getting 404 pages:", error);
    throw error;
  }
}