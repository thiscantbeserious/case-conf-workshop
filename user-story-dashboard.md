# User Story: Dashboard Stats

## Story
**As a** CRM user
**I want to** see key statistics on my dashboard
**So that** I can quickly understand the state of my contacts at a glance

## Acceptance Criteria

1. **Total Contacts Count Widget**
   - Display the total number of contacts in the system
   - Show a loading skeleton while data is being fetched
   - Update automatically when contacts are added or removed

2. **Recent Contacts Widget**
   - Display the 5 most recently added contacts
   - Show organisation name and description for each contact
   - Show creation date in a human-readable format
   - Display "No contacts yet" message when empty
   - Show loading skeletons while data is being fetched

3. **Visual Design**
   - Use Chakra UI Stat components for metrics display
   - Use Card components for widget containers
   - Match existing application styling (white backgrounds, rounded corners, subtle shadows)
   - Responsive layout that works on different screen sizes

4. **Data Fetching**
   - Use existing ContactsApi from lib/client/api.ts
   - Leverage React Query for caching and state management
   - Reuse the "contacts" query key for cache consistency

## Technical Notes
- Reference: `app/(dashboard)/contacts/page.tsx` for React Query patterns
- Reference: `components/layout/Sidebar.tsx` for Chakra UI styling
- The dashboard page is at `app/(dashboard)/page.tsx`

## Definition of Done
- [ ] Total contacts count displays correctly
- [ ] Recent contacts list shows last 5 contacts
- [ ] Loading states work properly
- [ ] Empty states display appropriate messages
- [ ] Tests written and passing
- [ ] Build passes with no type errors
- [ ] Code follows existing patterns and conventions
