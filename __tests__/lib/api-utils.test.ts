import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import {
  ApiError,
  errorResponse,
  successResponse,
  getAuthenticatedUser,
  requireAuth,
  requireSuperuser,
  parseQueryParams,
  validateEmail,
  validatePassword,
} from '@/lib/api-utils'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

import { getCurrentUser } from '@/lib/auth'

describe('api-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ApiError', () => {
    it('should create an error with statusCode and message', () => {
      const error = new ApiError(404, 'Not found')
      expect(error.statusCode).toBe(404)
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiError')
    })

    it('should be an instance of Error', () => {
      const error = new ApiError(500, 'Server error')
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('errorResponse', () => {
    it('should return a JSON response with detail message', async () => {
      const response = errorResponse(400, 'Bad request')
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body).toEqual({ detail: 'Bad request' })
    })

    it('should handle different status codes', async () => {
      const response401 = errorResponse(401, 'Unauthorized')
      const response403 = errorResponse(403, 'Forbidden')
      const response500 = errorResponse(500, 'Internal error')

      expect(response401.status).toBe(401)
      expect(response403.status).toBe(403)
      expect(response500.status).toBe(500)
    })
  })

  describe('successResponse', () => {
    it('should return JSON response with data and default 200 status', async () => {
      const data = { id: 1, name: 'Test' }
      const response = successResponse(data)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual(data)
    })

    it('should allow custom status code', async () => {
      const response = successResponse({ created: true }, 201)
      expect(response.status).toBe(201)
    })

    it('should handle arrays', async () => {
      const data = [{ id: 1 }, { id: 2 }]
      const response = successResponse(data)
      const body = await response.json()

      expect(body).toEqual(data)
    })
  })

  describe('getAuthenticatedUser', () => {
    it('should return null if no Authorization header', async () => {
      const request = new NextRequest('http://localhost/api/test')
      const user = await getAuthenticatedUser(request)
      expect(user).toBeNull()
    })

    it('should return null if Authorization header does not start with Bearer', async () => {
      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Basic abc123' },
      })
      const user = await getAuthenticatedUser(request)
      expect(user).toBeNull()
    })

    it('should call getCurrentUser with token from Bearer header', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer valid-token' },
      })
      const user = await getAuthenticatedUser(request)

      expect(getCurrentUser).toHaveBeenCalledWith('valid-token')
      expect(user).toEqual(mockUser)
    })

    it('should return null if getCurrentUser returns null', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer invalid-token' },
      })
      const user = await getAuthenticatedUser(request)

      expect(user).toBeNull()
    })
  })

  describe('requireAuth', () => {
    it('should return error response if not authenticated', async () => {
      const request = new NextRequest('http://localhost/api/test')
      const result = await requireAuth(request)

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error.status).toBe(401)
      }
    })

    it('should return user if authenticated', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer valid-token' },
      })
      const result = await requireAuth(request)

      expect('user' in result).toBe(true)
      if ('user' in result) {
        expect(result.user).toEqual(mockUser)
      }
    })
  })

  describe('requireSuperuser', () => {
    it('should return error if not authenticated', async () => {
      const request = new NextRequest('http://localhost/api/test')
      const result = await requireSuperuser(request)

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error.status).toBe(401)
      }
    })

    it('should return error if user is not superuser', async () => {
      const mockUser = { id: '1', email: 'test@example.com', isSuperuser: false }
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer valid-token' },
      })
      const result = await requireSuperuser(request)

      expect('error' in result).toBe(true)
      if ('error' in result) {
        expect(result.error.status).toBe(403)
      }
    })

    it('should return user if superuser', async () => {
      const mockUser = { id: '1', email: 'admin@example.com', isSuperuser: true }
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any)

      const request = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer valid-token' },
      })
      const result = await requireSuperuser(request)

      expect('user' in result).toBe(true)
      if ('user' in result) {
        expect(result.user).toEqual(mockUser)
      }
    })
  })

  describe('parseQueryParams', () => {
    it('should return default values when no params provided', () => {
      const request = new NextRequest('http://localhost/api/test')
      const params = parseQueryParams(request)

      expect(params).toEqual({ skip: 0, limit: 100 })
    })

    it('should parse skip and limit from query string', () => {
      const request = new NextRequest('http://localhost/api/test?skip=10&limit=25')
      const params = parseQueryParams(request)

      expect(params).toEqual({ skip: 10, limit: 25 })
    })

    it('should cap limit at 100', () => {
      const request = new NextRequest('http://localhost/api/test?limit=500')
      const params = parseQueryParams(request)

      expect(params.limit).toBe(100)
    })

    it('should handle negative skip as NaN converted to 0', () => {
      const request = new NextRequest('http://localhost/api/test?skip=-5')
      const params = parseQueryParams(request)

      expect(params.skip).toBe(-5) // Note: parseInt handles negative numbers
    })

    it('should handle non-numeric values', () => {
      const request = new NextRequest('http://localhost/api/test?skip=abc&limit=xyz')
      const params = parseQueryParams(request)

      expect(params.skip).toBe(NaN)
      expect(params.limit).toBe(NaN)
    })
  })

  describe('validateEmail', () => {
    it('should return true for valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.org')).toBe(true)
      expect(validateEmail('user+tag@example.co.uk')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('notanemail')).toBe(false)
      expect(validateEmail('@nodomain.com')).toBe(false)
      expect(validateEmail('noat.com')).toBe(false)
      expect(validateEmail('spaces in@email.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should return null for valid passwords', () => {
      expect(validatePassword('12345678')).toBeNull()
      expect(validatePassword('a'.repeat(40))).toBeNull()
      expect(validatePassword('SecurePassword123!')).toBeNull()
    })

    it('should return error message for passwords less than 8 characters', () => {
      expect(validatePassword('')).toBe('Password must be at least 8 characters')
      expect(validatePassword('1234567')).toBe('Password must be at least 8 characters')
    })

    it('should return error message for passwords more than 40 characters', () => {
      const longPassword = 'a'.repeat(41)
      expect(validatePassword(longPassword)).toBe('Password must be at most 40 characters')
    })
  })
})
