const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Book methods
  async getBooks(search?: string) {
    const endpoint = search ? `/books?search=${encodeURIComponent(search)}` : '/books';
    return this.request(endpoint);
  }

  async getBook(id: string) {
    return this.request(`/books/${id}`);
  }

  async createBook(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  async updateBook(id: string, book: Partial<Book>) {
    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
  }

  async deleteBook(id: string) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Logs methods
  async getLogs(limit?: number) {
    const endpoint = limit ? `/logs?limit=${limit}` : '/logs';
    return this.request(endpoint);
  }

  // Health check
  async healthCheck() {
    return this.request('/health', {
      headers: {},
    });
  }
}

export const apiService = new ApiService();