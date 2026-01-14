import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthApi, UsersApi, ContactsApi } from '@/lib/client/api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('Client API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('AuthApi', () => {
    describe('login', () => {
      it('should send form-urlencoded data to login endpoint', async () => {
        const mockResponse = {
          access_token: 'test-token',
          token_type: 'bearer',
          user: { id: '1', email: 'test@example.com' },
        }
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })

        const result = await AuthApi.login('test@example.com', 'password123')

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/login/access-token',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
        )
        expect(result).toEqual(mockResponse)
      })

      it('should throw error on failed login', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({ detail: 'Invalid credentials' }),
        })

        await expect(AuthApi.login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
      })
    })

    describe('testToken', () => {
      it('should include auth header when token exists', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: '1', email: 'test@example.com' }),
        })

        await AuthApi.testToken()

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/login/test-token',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        )
      })
    })
  })

  describe('UsersApi', () => {
    describe('getMe', () => {
      it('should fetch current user', async () => {
        const mockUser = { id: '1', email: 'test@example.com', fullName: 'Test' }
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockUser),
        })

        const result = await UsersApi.getMe()

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users/me',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        )
        expect(result).toEqual(mockUser)
      })
    })

    describe('updateMe', () => {
      it('should send PATCH request with data', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: '1', email: 'new@example.com' }),
        })

        await UsersApi.updateMe({ email: 'new@example.com' })

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users/me',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ email: 'new@example.com' }),
          })
        )
      })
    })

    describe('changePassword', () => {
      it('should send password change request', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(undefined),
        })

        await UsersApi.changePassword({
          current_password: 'old',
          new_password: 'new12345',
        })

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users/me/password',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({
              current_password: 'old',
              new_password: 'new12345',
            }),
          })
        )
      })
    })

    describe('signup', () => {
      it('should create new user without auth header', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: '1', email: 'new@example.com' }),
        })

        await UsersApi.signup({
          email: 'new@example.com',
          password: 'password123',
          full_name: 'New User',
        })

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users/signup',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'new@example.com',
              password: 'password123',
              full_name: 'New User',
            }),
          })
        )
      })
    })

    describe('list', () => {
      it('should fetch users with pagination', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [], count: 0 }),
        })

        await UsersApi.list(10, 25)

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users?skip=10&limit=25',
          expect.any(Object)
        )
      })

      it('should use default pagination values', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [], count: 0 }),
        })

        await UsersApi.list()

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users?skip=0&limit=100',
          expect.any(Object)
        )
      })
    })

    describe('create', () => {
      it('should create user with provided data', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: '1', email: 'admin@example.com' }),
        })

        await UsersApi.create({
          email: 'admin@example.com',
          password: 'password123',
          is_superuser: true,
        })

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'admin@example.com',
              password: 'password123',
              is_superuser: true,
            }),
          })
        )
      })
    })

    describe('get', () => {
      it('should fetch user by id', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'user-123', email: 'test@example.com' }),
        })

        await UsersApi.get('user-123')

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users/user-123',
          expect.any(Object)
        )
      })
    })

    describe('update', () => {
      it('should update user by id', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'user-123', email: 'updated@example.com' }),
        })

        await UsersApi.update('user-123', { email: 'updated@example.com' })

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users/user-123',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ email: 'updated@example.com' }),
          })
        )
      })
    })

    describe('delete', () => {
      it('should delete user by id', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(undefined),
        })

        await UsersApi.delete('user-123')

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/users/user-123',
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })
  })

  describe('ContactsApi', () => {
    describe('list', () => {
      it('should fetch contacts with pagination', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ data: [], count: 0 }),
        })

        await ContactsApi.list(5, 10)

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/contacts?skip=5&limit=10',
          expect.any(Object)
        )
      })
    })

    describe('create', () => {
      it('should create contact', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        const mockContact = { id: '1', organisation: 'Acme Corp', description: 'Test' }
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockContact),
        })

        const result = await ContactsApi.create({
          organisation: 'Acme Corp',
          description: 'Test',
        })

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/contacts',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ organisation: 'Acme Corp', description: 'Test' }),
          })
        )
        expect(result).toEqual(mockContact)
      })
    })

    describe('get', () => {
      it('should fetch contact by id', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'contact-123', organisation: 'Test Corp' }),
        })

        await ContactsApi.get('contact-123')

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/contacts/contact-123',
          expect.any(Object)
        )
      })
    })

    describe('update', () => {
      it('should update contact', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'contact-123', organisation: 'Updated Corp' }),
        })

        await ContactsApi.update('contact-123', { organisation: 'Updated Corp' })

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/contacts/contact-123',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ organisation: 'Updated Corp' }),
          })
        )
      })
    })

    describe('delete', () => {
      it('should delete contact', async () => {
        mockLocalStorage.getItem.mockReturnValue('test-token')
        mockFetch.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(undefined),
        })

        await ContactsApi.delete('contact-123')

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/contacts/contact-123',
          expect.objectContaining({
            method: 'DELETE',
          })
        )
      })
    })
  })

  describe('Error handling', () => {
    it('should throw error with detail message from response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ detail: 'Custom error message' }),
      })

      await expect(UsersApi.getMe()).rejects.toThrow('Custom error message')
    })

    it('should throw generic error when response has no detail', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({}),
      })

      await expect(UsersApi.getMe()).rejects.toThrow('An error occurred')
    })

    it('should handle JSON parse failure gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })

      await expect(UsersApi.getMe()).rejects.toThrow('An error occurred')
    })
  })
})
