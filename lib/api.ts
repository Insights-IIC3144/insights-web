/**
 * Cliente API Centralizado para el Frontend (Client Components).
 * 
 * En lugar de usar fetch() directamente, los componentes importarán este archivo.
 * Todas las peticiones de este cliente viajan a través de nuestro túnel seguro (/api/proxy)
 * donde el servidor de Next.js les inyecta el token de Auth0 antes de mandarlas a Java.
 */

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private basePath = '/api/proxy';

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...customOptions } = options;
    
    // Construir la URL con parámetros de consulta si existen
    let url = `${this.basePath}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...customOptions.headers,
    };

    const config: RequestInit = {
      ...customOptions,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Si el proxy nos devuelve un 401, significa que la sesión de Auth0 expiró
      if (response.status === 401) {
        window.location.href = '/api/auth/logout';
        throw new Error('Sesión expirada');
      }

      // Intentar parsear el JSON
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `Error HTTP: ${response.status}`);
      }

      return data as T;
    } catch (error) {
      throw error;
    }
  }

  // --- Métodos de Conveniencia ---

  async get<T>(endpoint: string, params?: Record<string, string>, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  async post<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
