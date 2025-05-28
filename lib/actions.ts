"use server"

import { withMongoOperation, getMongoClient } from '@/lib/db';
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
  
  try {
    // Step 1: Generate content first (this might take time)
    console.log('Generating 404 page content with prompt:', prompt);
    const generatedContent = await generate404Page(prompt);
    console.log('Generated content:', {
      htmlVersionLength: generatedContent.htmlVersion?.length,
      nextjsVersionLength: generatedContent.nextjsVersion?.length
    });

    // Step 2: Use withMongoOperation for database operations with timeout
    const result = await withMongoOperation(async (client) => {
      console.log('MongoDB client connected:', !!client);
      
      const db = client.db("404forge");
      console.log('Database selected: 404forge');

      console.log('Preparing document for MongoDB insertion');
      const page404: MongoPage404 = {
        prompt,
        htmlVersion: generatedContent.htmlVersion,
        nextjsVersion: generatedContent.nextjsVersion,
        createdAt: new Date(),
      };
      console.log('Prepared document:', page404);

      console.log('Inserting document into MongoDB collection "pages"');
      const insertResult = await db.collection("pages").insertOne(page404);
      console.log('Insert result:', {
        acknowledged: insertResult.acknowledged,
        insertedId: insertResult.insertedId.toString()
      });

      return {
        insertedId: insertResult.insertedId,
        document: page404
      };
    }, 5000); // 5 second timeout for database operations

    console.log('Returning formatted document for client');
    const returnValue = {
      _id: result.insertedId.toString(),
      prompt: result.document.prompt,
      htmlVersion: result.document.htmlVersion,
      nextjsVersion: result.document.nextjsVersion,
      createdAt: result.document.createdAt
    };
    console.log('Return value:', returnValue);
    
    return returnValue;
  } catch (error) {
    console.error('Error creating 404 page:', error);
    // More specific error handling
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('Database operation timed out. Please try again.');
    }
    if (error instanceof Error && error.message.includes('MongoDB')) {
      throw new Error('Database connection failed. Please try again.');
    }
    throw error;
  }
}

export async function getAll404Pages(): Promise<Page404[]> {
  try {
    console.log('Starting getAll404Pages');
    
    const pages = await withMongoOperation(async (client) => {
      const db = client.db("404forge");
      console.log('Fetching all pages from database');

      // Get all 404 pages, sorted by creation date (newest first)
      const result = await db
        .collection("pages")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      console.log(`Found ${result.length} pages`);
      return result;
    }, 4000); // 4 second timeout for read operations

    // Convert MongoDB documents to plain objects with string IDs
    const formattedPages = pages.map(page => ({
      _id: page._id.toString(),
      prompt: page.prompt,
      htmlVersion: page.htmlVersion,
      nextjsVersion: page.nextjsVersion,
      createdAt: page.createdAt,
    }));

    console.log('Successfully formatted pages for client');
    return formattedPages;
  } catch (error) {
    console.error("Error getting 404 pages:", error);
    
    // Specific error handling
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Failed to fetch pages: Database timeout. Please try again.');
      }
      if (error.message.includes('MongoDB')) {
        throw new Error('Failed to fetch pages: Database connection error.');
      }
    }
    throw new Error('Failed to fetch pages. Please try again.');
  }
}

// Additional helper function for getting a single page by ID
export async function get404PageById(id: string): Promise<Page404 | null> {
  try {
    console.log('Getting page by ID:', id);
    
    const page = await withMongoOperation(async (client) => {
      const db = client.db("404forge");
      
      const result = await db
        .collection("pages")
        .findOne({ _id: new ObjectId(id) });

      return result;
    }, 3000); // 3 second timeout for single document read

    if (!page) {
      return null;
    }

    return {
      _id: page._id.toString(),
      prompt: page.prompt,
      htmlVersion: page.htmlVersion,
      nextjsVersion: page.nextjsVersion,
      createdAt: page.createdAt,
    };
  } catch (error) {
    console.error("Error getting 404 page by ID:", error);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('Failed to fetch page: Database timeout.');
    }
    throw new Error('Failed to fetch page.');
  }
}

// Helper function to delete a page (useful for cleanup)
export async function delete404Page(id: string): Promise<boolean> {
  try {
    console.log('Deleting page by ID:', id);
    
    const result = await withMongoOperation(async (client) => {
      const db = client.db("404forge");
      
      const deleteResult = await db
        .collection("pages")
        .deleteOne({ _id: new ObjectId(id) });

      return deleteResult;
    }, 3000); // 3 second timeout

    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting 404 page:", error);
    throw new Error('Failed to delete page.');
  }
}

// Health check function for monitoring
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    
    await withMongoOperation(async (client) => {
      const db = client.db("404forge");
      await db.command({ ping: 1 });
      return true;
    }, 2000); // 2 second timeout for health check

    return {
      connected: true,
      responseTime: Date.now() - startTime
    };
  } catch (error) {
    return {
      connected: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}