const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5036/api'

const defaultHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: defaultHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP ${response.status}`)
  }
  return response.status === 204 ? null : response.json()
}

// Auth
export async function login({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } })
}

// Read endpoints (GET publics)
export async function fetchStudents() {
  return request('/students')
}

export async function createStudent(student, token) {
  return request('/students', { method: 'POST', body: student, token })
}

export async function updateStudent(id, student, token) {
  return request(`/students/${id}`, { method: 'PUT', body: student, token })
}

export async function deleteStudent(id, token) {
  return request(`/students/${id}`, { method: 'DELETE', token })
}

export async function fetchTeachers() {
  return request('/teachers')
}

export async function createTeacher(teacher, token) {
  return request('/teachers', { method: 'POST', body: teacher, token })
}

export async function updateTeacher(id, teacher, token) {
  return request(`/teachers/${id}`, { method: 'PUT', body: teacher, token })
}

export async function deleteTeacher(id, token) {
  return request(`/teachers/${id}`, { method: 'DELETE', token })
}

export async function fetchCourses() {
  return request('/courses')
}

export async function createCourse(course, token) {
  return request('/courses', { method: 'POST', body: course, token })
}

export async function updateCourse(id, course, token) {
  return request(`/courses/${id}`, { method: 'PUT', body: course, token })
}

export async function deleteCourse(id, token) {
  return request(`/courses/${id}`, { method: 'DELETE', token })
}

export async function fetchGrades() {
  return request('/grades')
}

export async function createGrade(grade, token) {
  return request('/grades', { method: 'POST', body: grade, token })
}

export async function updateGrade(id, grade, token) {
  return request(`/grades/${id}`, { method: 'PUT', body: grade, token })
}

export async function deleteGrade(id, token) {
  return request(`/grades/${id}`, { method: 'DELETE', token })
}

export async function fetchSettings() {
  return request('/settings')
}

