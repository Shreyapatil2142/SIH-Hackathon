# MetroDocs Frontend Setup Guide

## 🎯 Quick Start (Recommended)

### Step 1: Create React Frontend
```bash
# Navigate to parent directory
cd ..

# Create React app with Vite
npm create vite@latest metro-docs-frontend -- --template react
cd metro-docs-frontend

# Install dependencies
npm install
npm install axios react-router-dom @headlessui/react @heroicons/react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configure Tailwind CSS
Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

### Step 3: Create API Service
Create `src/services/api.js`:
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const documentsAPI = {
  getDocuments: (params) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  uploadDocument: (data) => api.post('/documents', data),
  processDocument: (id) => api.post(`/documents/${id}/process`),
  getSummary: (id) => api.get(`/documents/${id}/summary`),
  getAllSummaries: (params) => api.get('/documents/summaries/all', { params }),
};

export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
};

export default api;
```

### Step 4: Create Main Components

#### Authentication Context (`src/contexts/AuthContext.js`)
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authAPI.getProfile()
        .then(response => {
          setUser(response.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data.data;
      
      localStorage.setItem('authToken', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Login Component (`src/components/Login.jsx`)
```javascript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MetroDocs Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

#### Dashboard Component (`src/components/Dashboard.jsx`)
```javascript
import React, { useState, useEffect } from 'react';
import { documentsAPI } from '../services/api';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docsResponse, summariesResponse] = await Promise.all([
        documentsAPI.getDocuments(),
        documentsAPI.getAllSummaries()
      ]);
      
      setDocuments(docsResponse.data.data.documents);
      setSummaries(summariesResponse.data.data.summaries);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDocument = async (documentId) => {
    try {
      await documentsAPI.processDocument(documentId);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error processing document:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900">MetroDocs Dashboard</h1>
        
        {/* Documents Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-500">Created: {new Date(doc.created_at).toLocaleDateString()}</p>
                <button
                  onClick={() => handleProcessDocument(doc.id)}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Process Document
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summaries Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summaries</h2>
          <div className="grid gap-4">
            {summaries.map((summary) => (
              <div key={summary.id} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">{summary.document_title}</h3>
                <p className="text-sm text-gray-500 mb-2">Created: {new Date(summary.created_at).toLocaleDateString()}</p>
                <p className="text-gray-700">{summary.summary_preview}...</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

### Step 5: Main App Component (`src/App.jsx`)
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
```

## 🚀 Alternative: Use a UI Framework

### Option A: Material-UI
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

### Option B: Chakra UI
```bash
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

### Option C: Ant Design
```bash
npm install antd
```

## 📱 Mobile-First Approach

Since MetroDocs might be used on mobile devices in the field:

```bash
# Install mobile-friendly libraries
npm install react-responsive
npm install @headlessui/react @heroicons/react
```

## 🔧 Development Setup

### Backend CORS Configuration
Update your backend to allow frontend requests:

```javascript
// In your backend index.js
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
```

### Environment Variables
Create `.env` in frontend:
```
VITE_API_BASE_URL=http://localhost:3000
```

## 🎯 Next Steps

1. **Start with Option 1** (Separate React Frontend)
2. **Implement core features first**: Login, Dashboard, Document List
3. **Add summarization features**: Process documents, view summaries
4. **Enhance UI**: Add charts, better styling, mobile responsiveness
5. **Add advanced features**: Real-time updates, file uploads, task management

Would you like me to help you implement any specific part of this frontend setup?
