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

    console.log('Starting createNew404Page with prompt:', prompt);
    const client = await clientPromise;
    console.log('MongoDB client connected:', !!client);

    const db = client.db("404forge");
    console.log('Database selected: 404forge');

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
    const returnValue: Page404 = {
      _id: result.insertedId.toString(),
      prompt: page404.prompt,
      htmlVersion: page404.htmlVersion,
      nextjsVersion: page404.nextjsVersion,
      createdAt: page404.createdAt
    };
    console.log('Return value:', returnValue);

    return NextResponse.json(returnValue, { status: 201 });
  } catch (error) {
    console.error('Error creating 404 page:', error);
    return NextResponse.json({ error: 'Failed to create 404 page' }, { status: 500 });
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