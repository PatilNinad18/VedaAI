// Mock MongoDB for development when MongoDB is not available
import mongoose from "mongoose";

interface MockDocument {
  _id: string;
  save(): Promise<MockDocument>;
  toJSON(): any;
}

export class MockModel {
  private data: Map<string, any> = new Map();
  private counter = 1;

  async create(doc: any): Promise<MockDocument> {
    const id = `mock_${this.counter++}`;
    const document = {
      _id: id,
      ...doc,
      save: async () => document,
      toJSON: () => ({ _id: id, ...doc })
    };
    this.data.set(id, document);
    return document;
  }

  async findById(id: string): Promise<MockDocument | null> {
    return this.data.get(id) || null;
  }

  async findOne(filter: any): Promise<MockDocument | null> {
    for (const doc of this.data.values()) {
      if (this.matchesFilter(doc, filter)) {
        return doc;
      }
    }
    return null;
  }

  async find(filter: any = {}): Promise<MockDocument[]> {
    const results: MockDocument[] = [];
    for (const doc of this.data.values()) {
      if (this.matchesFilter(doc, filter)) {
        results.push(doc);
      }
    }
    return results;
  }

  async findByIdAndUpdate(id: string, update: any): Promise<MockDocument | null> {
    const doc = this.data.get(id);
    if (doc) {
      Object.assign(doc, update);
      return doc;
    }
    return null;
  }

  async deleteOne(filter: any): Promise<any> {
    for (const [id, doc] of this.data.entries()) {
      if (this.matchesFilter(doc, filter)) {
        this.data.delete(id);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  private matchesFilter(doc: any, filter: any): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const [key, value] of Object.entries(filter)) {
      if (doc[key] !== value) return false;
    }
    return true;
  }
}

export const connectDatabase = async () => {
  console.log("[MongoDB] Using mock database for development");
};

export const Assignment = new MockModel();
export const Result = new MockModel();
