import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  verifyAccessToken,
  authenticateUser,
  getCurrentUser,
  excludePassword,
} from '@/lib/auth'

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@/lib/db'

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)

      expect(hashed).not.toBe(password)
      expect(hashed).toMatch(/^\$2[aby]?\$/) // bcrypt hash format
    })

    it('should produce different hashes for same password (salt)', async () => {
      const password = 'testpassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)

      const result = await verifyPassword(password, hashed)
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)

      const result = await verifyPassword('wrongpassword', hashed)
      expect(result).toBe(false)
    })
  })

  describe('createAccessToken', () => {
    it('should create a valid JWT token', () => {
      const token = createAccessToken('user-id-123', 'test@example.com')

      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT format: header.payload.signature
    })

    it('should include user id and email in payload', () => {
      const token = createAccessToken('user-id-123', 'test@example.com')
      const payload = verifyAccessToken(token)

      expect(payload).not.toBeNull()
      expect(payload?.sub).toBe('user-id-123')
      expect(payload?.email).toBe('test@example.com')
    })
  })

  describe('verifyAccessToken', () => {
    it('should verify a valid token and return payload', () => {
      const token = createAccessToken('user-id-123', 'test@example.com')
      const payload = verifyAccessToken(token)

      expect(payload).not.toBeNull()
      expect(payload?.sub).toBe('user-id-123')
      expect(payload?.email).toBe('test@example.com')
      expect(payload?.iat).toBeDefined()
      expect(payload?.exp).toBeDefined()
    })

    it('should return null for invalid token', () => {
      const payload = verifyAccessToken('invalid-token')
      expect(payload).toBeNull()
    })

    it('should return null for tampered token', () => {
      const token = createAccessToken('user-id-123', 'test@example.com')
      const tamperedToken = token.slice(0, -5) + 'xxxxx'
      const payload = verifyAccessToken(tamperedToken)

      expect(payload).toBeNull()
    })

    it('should return null for empty token', () => {
      const payload = verifyAccessToken('')
      expect(payload).toBeNull()
    })
  })

  describe('authenticateUser', () => {
    it('should return null if user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const result = await authenticateUser('notfound@example.com', 'password')
      expect(result).toBeNull()
    })

    it('should return null if user is inactive', async () => {
      const hashedPassword = await hashPassword('correctpassword')
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        hashedPassword,
        isActive: false,
        isSuperuser: false,
        fullName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await authenticateUser('test@example.com', 'correctpassword')
      expect(result).toBeNull()
    })

    it('should return null if password is incorrect', async () => {
      const hashedPassword = await hashPassword('correctpassword')
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        hashedPassword,
        isActive: true,
        isSuperuser: false,
        fullName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await authenticateUser('test@example.com', 'wrongpassword')
      expect(result).toBeNull()
    })

    it('should return user if credentials are valid', async () => {
      const hashedPassword = await hashPassword('correctpassword')
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        hashedPassword,
        isActive: true,
        isSuperuser: false,
        fullName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

      const result = await authenticateUser('test@example.com', 'correctpassword')
      expect(result).toEqual(mockUser)
    })
  })

  describe('getCurrentUser', () => {
    it('should return null for invalid token', async () => {
      const result = await getCurrentUser('invalid-token')
      expect(result).toBeNull()
    })

    it('should return null if user not found', async () => {
      const token = createAccessToken('user-id-123', 'test@example.com')
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const result = await getCurrentUser(token)
      expect(result).toBeNull()
    })

    it('should return null if user is inactive', async () => {
      const token = createAccessToken('user-id-123', 'test@example.com')
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'user-id-123',
        email: 'test@example.com',
        hashedPassword: 'hashed',
        isActive: false,
        isSuperuser: false,
        fullName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await getCurrentUser(token)
      expect(result).toBeNull()
    })

    it('should return user for valid token and active user', async () => {
      const token = createAccessToken('user-id-123', 'test@example.com')
      const mockUser = {
        id: 'user-id-123',
        email: 'test@example.com',
        hashedPassword: 'hashed',
        isActive: true,
        isSuperuser: false,
        fullName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)

      const result = await getCurrentUser(token)
      expect(result).toEqual(mockUser)
    })
  })

  describe('excludePassword', () => {
    it('should remove hashedPassword from user object', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        hashedPassword: 'secret-hash',
        fullName: 'Test User',
        isActive: true,
        isSuperuser: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = excludePassword(user)

      expect(result).not.toHaveProperty('hashedPassword')
      expect(result.id).toBe('1')
      expect(result.email).toBe('test@example.com')
      expect(result.fullName).toBe('Test User')
    })

    it('should preserve all other properties', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        hashedPassword: 'secret-hash',
        fullName: 'Test User',
        isActive: true,
        isSuperuser: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        extraField: 'extra',
      }

      const result = excludePassword(user)

      expect(result.id).toBe('1')
      expect(result.email).toBe('test@example.com')
      expect(result.fullName).toBe('Test User')
      expect(result.isActive).toBe(true)
      expect(result.isSuperuser).toBe(true)
      expect(result.extraField).toBe('extra')
    })
  })
})
