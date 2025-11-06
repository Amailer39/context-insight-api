import { getAuthHeaders } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/contextiq` : 'http://localhost:8000/api/v1/contextiq';

export interface Document {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  content?: string;
}

export interface QueryResult {
  content: string;
  metadata: {
    document_id: string;
    title: string;
  };
}

export const api = {
  // Get all documents
  async getDocuments(query?: string): Promise<Document[]> {
    const url = query 
      ? `${API_BASE_URL}/documents/?q=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/documents/`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  // Upload document
  async uploadDocument(file: File, title?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    const response = await fetch(`${API_BASE_URL}/documents/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload document');
    return response.json();
  },

  // Create document with text content
  async createDocument(title: string, content: string): Promise<Document> {
    const response = await fetch(`${API_BASE_URL}/documents/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ title, parse_content: content }),
    });
    
    if (!response.ok) throw new Error('Failed to create document');
    return response.json();
  },

  // Delete document
  async deleteDocument(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Failed to delete document');
  },

  // Query specific document
  async queryDocument(documentId: string, query: string): Promise<QueryResult[]> {
    const response = await fetch(`${API_BASE_URL}/query/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ document_id: documentId, query }),
    });
    
    if (!response.ok) throw new Error('Failed to query document');
    const data = await response.json();
    return data.results;
  },
};
