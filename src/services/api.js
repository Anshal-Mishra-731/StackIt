const API_BASE_URL = 'http://localhost:8000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Something went wrong');
  }
  return response.json();
};

// Auth API calls
export const authAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Question API calls
export const questionAPI = {
  createQuestion: async (questionData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': token,
      },
      body: JSON.stringify(questionData),
    });
    return handleResponse(response);
  },

  getQuestions: async (page = 1, recordPerPage = 10) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/questions?page=${page}&recordPerPage=${recordPerPage}`, {
      method: 'GET',
      headers: {
        'token': token,
      },
    });
    return handleResponse(response);
  },

  getQuestionById: async (questionId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'GET',
      headers: {
        'token': token,
      },
    });
    return handleResponse(response);
  },

  getQuestionsByUser: async (userId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/questions/user/${userId}`, {
      method: 'GET',
      headers: {
        'token': token,
      },
    });
    return handleResponse(response);
  },

  upvoteQuestion: async (questionId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'token': token,
      },
    });
    return handleResponse(response);
  }
};

// User API calls
export const userAPI = {
  getUsers: async (page = 1, recordPerPage = 10) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users?page=${page}&recordPerPage=${recordPerPage}`, {
      method: 'GET',
      headers: {
        'token': token,
      },
    });
    return handleResponse(response);
  },

  getUser: async (userId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'token': token,
      },
    });
    return handleResponse(response);
  }
};