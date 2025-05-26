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
  const client = await clientPromise;
  const db = client.db("404forge");

  try {
    // Generate the 404 page content using Gemini
    const generatedContent = await generate404Page(prompt);

    // Prepare the document to insert
    const page404: MongoPage404 = {
      prompt,
      htmlVersion: generatedContent.htmlVersion,
      nextjsVersion: generatedContent.nextjsVersion,
      createdAt: new Date(),
    };

    // Insert the document into MongoDB
    const result = await db.collection("pages").insertOne(page404);
    
    // Return the document with string ID for client usage
    return {
      _id: result.insertedId.toString(),
      prompt: page404.prompt,
      htmlVersion: page404.htmlVersion,
      nextjsVersion: page404.nextjsVersion,
      createdAt: page404.createdAt
    };
  } catch (error) {
    console.error("Error creating 404 page:", error);
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