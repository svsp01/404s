import clientPromise from '@/lib/db';
import { generate404Page } from '@/lib/gemini';
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from 'next/server';

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

// POST handler to create a new 404 page
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt must be a non-empty string' }, { status: 400 });
    }

    console.log('Starting createNew404Page with prompt:', prompt);
    const client = await clientPromise.catch(error => {
      throw new Error('Database connection failed');
    });
    console.log('MongoDB client connected:', !!client);

    const db = client.db("404forge");
    console.log('Database selected: 404forge');

    console.log('Generating 404 page content with prompt:', prompt);
    const generatedContent = await generate404Page(prompt).catch(error => {
      throw new Error('Failed to generate 404 page content');
    });
    console.log('Generated content:', {
      htmlVersionLength: generatedContent.htmlVersion?.length,
      nextjsVersionLength: generatedContent.nextjsVersion?.length
    });

    if (!generatedContent.htmlVersion || !generatedContent.nextjsVersion) {
      throw new Error('Generated content is incomplete');
    }

    console.log('Preparing document for MongoDB insertion');
    const page404: MongoPage404 = {
      prompt,
      htmlVersion: generatedContent.htmlVersion,
      nextjsVersion: generatedContent.nextjsVersion,
      createdAt: new Date(),
    };
    console.log('Prepared document:', page404);

    console.log('Inserting document into MongoDB collection "pages"');
    const result = await db.collection("pages").insertOne(page404).catch(error => {
      throw new Error('Failed to insert document into database');
    });
    console.log('Insert result:', {
      acknowledged: result.acknowledged,
      insertedId: result.insertedId.toString()
    });

    console.log('Returning formatted document for client');
    const returnValue: Page404 = {
      _id: result.insertedId.toString(),
      prompt: page404.prompt,
      htmlVersion: page404.htmlVersion,
      nextjsVersion: page404.nextjsVersion,
      createdAt: page404.createdAt
    };
    console.log('Return value:', returnValue);

    return NextResponse.json(returnValue, { status: 201 });
  } catch (error: any) {
    console.error('Error creating 404 page:', error);

    // Handle specific error cases
    if (error.message.includes('Database connection failed')) {
      return NextResponse.json(
        { error: 'Unable to connect to the database. Please try again later.' },
        { status: 503 } // Service Unavailable
      );
    }
    if (error.message.includes('Failed to generate 404 page content')) {
      return NextResponse.json(
        { error: 'Failed to generate the 404 page content. Please check your prompt and try again.' },
        { status: 500 }
      );
    }
    if (error.message.includes('Generated content is incomplete')) {
      return NextResponse.json(
        { error: 'Generated 404 page content is incomplete. Please try again.' },
        { status: 500 }
      );
    }
    if (error.message.includes('Failed to insert document')) {
      return NextResponse.json(
        { error: 'Failed to save the 404 page to the database. Please try again.' },
        { status: 500 }
      );
    }
    if (error.name === 'MongoServerSelectionError') {
      return NextResponse.json(
        { error: 'Database server selection timed out. Please try again later.' },
        { status: 503 } // Service Unavailable
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the 404 page.' },
      { status: 500 }
    );
  }
}
// GET handler to retrieve all 404 pages
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("404forge");

    console.log('Fetching all 404 pages');
    const pages = await db
      .collection("pages")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log('Converting MongoDB documents to client format');
    const formattedPages: Page404[] = pages.map(page => ({
      _id: page._id.toString(),
      prompt: page.prompt,
      htmlVersion: page.htmlVersion,
      nextjsVersion: page.nextjsVersion,
      createdAt: page.createdAt,
    }));

    console.log('Returning pages:', formattedPages.length);
    return NextResponse.json(formattedPages, { status: 200 });
  } catch (error) {
    console.error("Error getting 404 pages:", error);
    return NextResponse.json({ error: 'Failed to fetch 404 pages' }, { status: 500 });
  }
}