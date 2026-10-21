import api from './axios'

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  logout:         ()     => api.post('/auth/logout'),
  me:             ()     => api.get('/auth/me'),
}

// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
  charts:  () => api.get('/dashboard/charts'),
  alerts:  () => api.get('/dashboard/alerts'),
}

// ─── Categories ───────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll:  ()         => api.get('/categories'),
  create:  (data)     => api.post('/categories', data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  delete:  (id)       => api.delete(`/categories/${id}`),
}

// ─── Products ─────────────────────────────────────────────────────────────
export const productAPI = {
  getAll:  (params)   => api.get('/products', { params }),
  getOne:  (id)       => api.get(`/products/${id}`),
  create:  (data)     => api.post('/products', data),
  update:  (id, data) => api.put(`/products/${id}`, data),
  delete:  (id)       => api.delete(`/products/${id}`),
}

// ─── Inventory (Batch) ────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll:  (params)   => api.get('/inventory', { params }),
  getOne:  (id)       => api.get(`/inventory/${id}`),
  create:  (data)     => api.post('/inventory', data),
  update:  (id, data) => api.put(`/inventory/${id}`, data),
  delete:  (id)       => api.delete(`/inventory/${id}`),
}

// ─── Stock Out ────────────────────────────────────────────────────────────
export const stockOutAPI = {
  fefo:      (productId) => api.get(`/stock-out/fefo/${productId}`),
  create:    (data)      => api.post('/stock-out', data),
  getLogs:   (params)    => api.get('/stock-out/logs', { params }),
  printData: (id)        => api.get(`/stock-out/${id}/print`),
}

// ─── Stock Opname ─────────────────────────────────────────────────────────
export const stockOpnameAPI = {
  getAll: (params)    => api.get('/stock-opname', { params }),
  create: (data)      => api.post('/stock-opname', data),
  verify: (id, data)  => api.put(`/stock-opname/${id}/verify`, data),
}

// ─── User Management ─────────────────────────────────────────────────────
export const userAPI = {
  getAll:       (params)    => api.get('/admin/users', { params }),
  update:       (id, data)  => api.put(`/admin/users/${id}`, data),
  updateStatus: (id, data)  => api.put(`/admin/users/${id}/status`, data),
  delete:       (id)        => api.delete(`/admin/users/${id}`),
}
