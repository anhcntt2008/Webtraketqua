import axios from 'axios';

// API_BASE: 
// - In development with React proxy (package.json "proxy"): use '/api'
// - In production (SPA served from .NET): use '/api'
// - Override via REACT_APP_API_URL env var if needed (e.g. "https://myserver:7120/api")
const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 (token expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Only auto-logout if we had a token (not during login)
      const hadToken = !!sessionStorage.getItem('token');
      if (hadToken) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.reload();
      }
    }
    return Promise.reject(err);
  }
);

// ========== AUTH ==========
export const AuthService = {
  login: async (DienThoai, MatKhau) => {
    const { data } = await api.post('/auth/login', { DienThoai, MatKhau });
    if (data.token) {
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getUser: () => {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn: () => !!sessionStorage.getItem('token'),
};

// ========== VISITS (danh sách lượt khám) ==========
export const VisitService = {
  getVisits: async (idBenhNhan) => {
    const { data } = await api.get(`/results/visits/${idBenhNhan}`);
    return data;
  },
};

// ========== RESULTS (kết quả 1 lượt khám) ==========
export const ResultService = {
  getResults: async (maLuotKham) => {
    const { data } = await api.get(`/results/${maLuotKham}`);
    return data;
  },

  downloadFile: async (maLuotKham, fileId, fileName) => {
    const response = await api.get(`/results/${maLuotKham}/files/${fileId}`, {
      responseType: 'blob',
    });
     
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url; 
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;
