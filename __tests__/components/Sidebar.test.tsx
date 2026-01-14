import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '../test-utils'
import { Sidebar } from '@/components/layout/Sidebar'

// Mock Next.js navigation
const mockUsePathname = vi.fn(() => '/')
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('@/lib/client/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock for regular user
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        isSuperuser: false,
      },
      isLoadingUser: false,
      logout: vi.fn(),
    })
    mockUsePathname.mockReturnValue('/')
  })

  it('renders correctly for regular user', () => {
    const { container } = render(<Sidebar />)
    expect(container).toMatchSnapshot()
  })

  it('renders correctly for admin user', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        fullName: 'Admin User',
        isSuperuser: true,
        isActive: true,
      },
      isLoadingUser: false,
      logout: vi.fn(),
    })

    const { container } = render(<Sidebar />)
    expect(container).toMatchSnapshot()
  })

  it('highlights active route correctly', () => {
    mockUsePathname.mockReturnValue('/contacts')

    const { container } = render(<Sidebar />)
    expect(container).toMatchSnapshot()
  })

  it('shows Dashboard, Contacts, and Settings for regular user', () => {
    const { getByText, queryByText } = render(<Sidebar />)

    expect(getByText('Dashboard')).toBeTruthy()
    expect(getByText('Contacts')).toBeTruthy()
    expect(getByText('Settings')).toBeTruthy()
    expect(queryByText('Admin')).toBeNull()
  })

  it('shows Admin link for superuser', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@example.com',
        isSuperuser: true,
      },
      isLoadingUser: false,
      logout: vi.fn(),
    })

    const { getByText } = render(<Sidebar />)
    expect(getByText('Admin')).toBeTruthy()
  })
})
