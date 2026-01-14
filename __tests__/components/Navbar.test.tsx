import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '../test-utils'
import { Navbar } from '@/components/layout/Navbar'

// Mock useAuth hook
const mockUseAuth = vi.fn()
vi.mock('@/lib/client/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock
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
  })

  it('renders correctly with user fullName', () => {
    const { container } = render(<Navbar />)
    expect(container).toMatchSnapshot()
  })

  it('renders correctly with email when no fullName', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        fullName: null,
        isSuperuser: false,
      },
      isLoadingUser: false,
      logout: vi.fn(),
    })

    const { container } = render(<Navbar />)
    expect(container).toMatchSnapshot()
  })

  it('displays user name in button', () => {
    const { getByText } = render(<Navbar />)
    expect(getByText('Test User')).toBeTruthy()
  })

  it('displays email when no fullName', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        fullName: null,
      },
      isLoadingUser: false,
      logout: vi.fn(),
    })

    const { getByText } = render(<Navbar />)
    expect(getByText('user@example.com')).toBeTruthy()
  })

  it('displays "User" when no user data', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoadingUser: false,
      logout: vi.fn(),
    })

    const { getByText } = render(<Navbar />)
    expect(getByText('User')).toBeTruthy()
  })

  it('displays Contact Management title', () => {
    const { getByText } = render(<Navbar />)
    expect(getByText('Contact Management')).toBeTruthy()
  })
})
