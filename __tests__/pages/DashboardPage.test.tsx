import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../test-utils'
import DashboardPage from '@/app/(dashboard)/page'

// Mock the useAuth hook
vi.mock('@/lib/client/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'user-1', fullName: 'John Doe', email: 'john@example.com' },
    isLoading: false,
  }),
}))

// Mock the ContactsApi - data must be inline due to hoisting
vi.mock('@/lib/client/api', () => ({
  ContactsApi: {
    list: vi.fn().mockResolvedValue({
      data: [
        {
          id: '1',
          organisation: 'Acme Corp',
          description: 'Manufacturing company',
          ownerId: 'user-1',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
        },
        {
          id: '2',
          organisation: 'Tech Solutions',
          description: 'Software development',
          ownerId: 'user-1',
          createdAt: '2025-01-14T10:00:00Z',
          updatedAt: '2025-01-14T10:00:00Z',
        },
        {
          id: '3',
          organisation: 'Global Industries',
          description: 'Manufacturing and logistics',
          ownerId: 'user-1',
          createdAt: '2025-01-13T10:00:00Z',
          updatedAt: '2025-01-13T10:00:00Z',
        },
        {
          id: '4',
          organisation: 'StartupXYZ',
          description: null,
          ownerId: 'user-1',
          createdAt: '2025-01-12T10:00:00Z',
          updatedAt: '2025-01-12T10:00:00Z',
        },
        {
          id: '5',
          organisation: 'Enterprise Co',
          description: 'Enterprise solutions',
          ownerId: 'user-1',
          createdAt: '2025-01-11T10:00:00Z',
          updatedAt: '2025-01-11T10:00:00Z',
        },
        {
          id: '6',
          organisation: 'Old Company',
          description: 'Should not appear in recent',
          ownerId: 'user-1',
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
      ],
      count: 6,
    }),
  },
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders welcome message with user name', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, John Doe!/)).toBeTruthy()
      })
    })

    it('renders dashboard description', async () => {
      render(<DashboardPage />)

      expect(screen.getByText(/Manage your contacts and settings/)).toBeTruthy()
    })
  })

  describe('Total Contacts Widget', () => {
    it('displays total contacts count', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('6')).toBeTruthy()
      })
    })

    it('shows loading skeleton while fetching', () => {
      render(<DashboardPage />)

      // Should show skeleton rows during loading
      const skeletons = document.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('displays "Total Contacts" label', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Total Contacts')).toBeTruthy()
      })
    })
  })

  describe('Recent Contacts Widget', () => {
    it('renders Recent Contacts heading', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Recent Contacts')).toBeTruthy()
      })
    })

    it('displays most recent 5 contacts', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        // Should show the 5 most recent contacts
        expect(screen.getByText('Acme Corp')).toBeTruthy()
        expect(screen.getByText('Tech Solutions')).toBeTruthy()
        expect(screen.getByText('Global Industries')).toBeTruthy()
        expect(screen.getByText('StartupXYZ')).toBeTruthy()
        expect(screen.getByText('Enterprise Co')).toBeTruthy()
        // Should NOT show the 6th oldest contact
        expect(screen.queryByText('Old Company')).toBeNull()
      })
    })

    it('shows contact descriptions', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Manufacturing company')).toBeTruthy()
        expect(screen.getByText('Software development')).toBeTruthy()
      })
    })

    it('shows "No description" for contacts without description', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('No description')).toBeTruthy()
      })
    })

    it('displays contacts in descending order by creation date', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        const contactElements = screen.getAllByText(/Corp|Solutions|Industries|XYZ|Enterprise/)
        // First contact should be Acme Corp (most recent)
        expect(contactElements[0].textContent).toContain('Acme Corp')
      })
    })
  })

  describe('Recent Activity Widget', () => {
    it('displays recent activity label', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeTruthy()
      })
    })

    it('displays last contact added date', async () => {
      render(<DashboardPage />)

      await waitFor(() => {
        // The date should appear twice - once in the Recent Activity widget (large text)
        // and once in the recent contacts list. We check the getAllByText to ensure it exists.
        const dateElements = screen.getAllByText('Jan 15, 2025')
        // At least 2 instances: one in Recent Activity widget, one in the first contact
        expect(dateElements.length).toBeGreaterThanOrEqual(2)
      })
    })
  })
})
