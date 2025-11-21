const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Make API request
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Try to parse JSON, but handle cases where response might not be JSON
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || 'Something went wrong' };
      }
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    // If error is already an Error object with message, rethrow it
    if (error instanceof Error) {
      throw error;
    }
    // Otherwise, wrap it in an Error
    throw new Error(error.message || 'Network error occurred');
  }
};

// Auth API
export const authAPI = {
  signup: async (name, email, password) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },
};

// Boards API
export const boardsAPI = {
  getBoards: async () => {
    return apiRequest('/boards', { method: 'GET' });
  },

  getBoard: async (boardId) => {
    return apiRequest(`/boards/${boardId}`, { method: 'GET' });
  },

  createBoard: async (name, description, color) => {
    return apiRequest('/boards', {
      method: 'POST',
      body: JSON.stringify({ name, description, color }),
    });
  },

  updateBoard: async (boardId, data) => {
    return apiRequest(`/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBoard: async (boardId) => {
    return apiRequest(`/boards/${boardId}`, { method: 'DELETE' });
  },
};

// Lists API
export const listsAPI = {
  createList: async (boardId, title) => {
    return apiRequest(`/lists/${boardId}`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  updateList: async (listId, data) => {
    return apiRequest(`/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteList: async (listId) => {
    return apiRequest(`/lists/${listId}`, { method: 'DELETE' });
  },
};

// Cards API
export const cardsAPI = {
  createCard: async (listId, title, description, dueDate) => {
    return apiRequest(`/cards/${listId}`, {
      method: 'POST',
      body: JSON.stringify({ title, description, dueDate }),
    });
  },

  updateCard: async (cardId, data) => {
    return apiRequest(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCard: async (cardId) => {
    return apiRequest(`/cards/${cardId}`, { method: 'DELETE' });
  },
};

// Invites API
export const invitesAPI = {
  sendInvite: async (boardId, email) => {
    return apiRequest(`/invites/${boardId}`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  acceptInvite: async (token) => {
    return apiRequest(`/invites/accept/${token}`, { method: 'GET' });
  },

  getBoardMembers: async (boardId) => {
    return apiRequest(`/invites/${boardId}/members`, { method: 'GET' });
  },

  getMyPendingInvites: async () => {
    return apiRequest('/invites/my-invites', { method: 'GET' });
  },
};

// Recommendations API
export const recommendationsAPI = {
  getRecommendations: async (boardId) => {
    return apiRequest(`/recommendations/${boardId}`, { method: 'GET' });
  },
};

export default apiRequest;

