# User Story: Search Contacts

## Story
**As a** user
**I want to** search and filter my contacts by name or organization
**So that** I can quickly find specific contacts without scrolling through the list

## Acceptance Criteria
- [ ] Search input field visible on contacts page
- [ ] Filter contacts as user types (debounced)
- [ ] Search matches against `organisation` and `description` fields
- [ ] Show "no results" message when search yields nothing
- [ ] Clear search button to reset filter
- [ ] Search state preserved during session

## Technical Notes
- Contacts model has: `organisation`, `description` fields
- Current API: `GET /api/v1/contacts?skip=0&limit=100`
- Approach: Client-side filtering (simpler, data already loaded)

## Out of Scope
- Server-side search (for large datasets)
- Advanced filters (date range, owner, etc.)
- Saved searches / search history

## Done When
1. User can type in search box and see filtered results instantly
2. Works for both admin (all contacts) and regular users (own contacts)
3. Visually verified via Chrome plugin with test credentials
