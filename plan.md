# Plan: Search Contacts

## Overview
Add client-side search filtering to the contacts page. Users can type to filter contacts by organisation or description.

## Technical Approach
- Load all contacts (increase limit) to enable client-side filtering
- Add search input with debounce (300ms)
- Filter contacts array before rendering
- Paginate filtered results

## Tasks

### Task 1: Add search state and input
- [ ] Add `searchQuery` state to ContactsPage
- [ ] Add Input component with search icon in header (between title and Add button)
- [ ] Add clear button (X) when search has value

### Task 2: Implement filtering logic
- [ ] Create `filteredContacts` computed from contacts array
- [ ] Filter by `organisation` and `description` (case-insensitive)
- [ ] Add debounce to search input (300ms delay)

### Task 3: Update pagination for filtered results
- [ ] Update `totalCount` to use filtered length
- [ ] Reset to page 0 when search changes
- [ ] Paginate filtered results instead of raw data

### Task 4: Add empty search state
- [ ] Show "No contacts match your search" when filter yields 0 results
- [ ] Different from "No contacts yet" (empty database)

### Task 5: Visual verification
- [ ] Start dev server (`npm run dev`)
- [ ] Login via Chrome plugin as `dev@example.com` / `DevPassword`
- [ ] Test search with existing contacts
- [ ] Test clear button
- [ ] Test empty state

## Done Criteria
- [x] Search input visible on contacts page
- [ ] Typing filters contacts in real-time
- [ ] Clear button resets filter
- [ ] "No results" message shows appropriately
- [ ] Works for admin and regular users
