# Implementation Plan: Dashboard Stats

## Overview
Implement dashboard statistics widgets displaying total contacts count and recent contacts list.

## Tasks

### 1. Update Dashboard Page Component
**File:** `app/(dashboard)/page.tsx`

- [ ] Add React Query imports and useQuery hook
- [ ] Import ContactsApi for data fetching
- [ ] Add Stat and Card components from Chakra UI
- [ ] Create Total Contacts stat widget
- [ ] Create Recent Contacts list widget
- [ ] Implement loading states with Skeleton components
- [ ] Handle empty states gracefully

### 2. Write Tests
**File:** `__tests__/pages/DashboardPage.test.tsx`

- [ ] Test total contacts count displays correctly
- [ ] Test recent contacts list renders (limited to 5)
- [ ] Test loading skeletons appear during fetch
- [ ] Test empty state when no contacts exist
- [ ] Mock ContactsApi similar to ContactsPage tests

### 3. Verification
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run build` - no type errors
- [ ] Manual verification in browser (optional)

## Implementation Details

### Chakra UI Components to Use
- `Stat`, `StatLabel`, `StatNumber`, `StatHelpText` - for metrics
- `Card`, `CardHeader`, `CardBody` - for widget containers
- `Skeleton`, `SkeletonText` - for loading states
- `Box`, `Stack`, `Flex`, `Heading`, `Text` - for layout

### Query Pattern
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["contacts"],
  queryFn: () => ContactsApi.list(0, 1000),
});
```

### Recent Contacts Logic
- Sort contacts by `createdAt` descending
- Take first 5 entries
- Format dates using `toLocaleDateString()`

## Done Criteria
- All acceptance criteria from user story met
- Tests passing
- Build succeeds
- Code follows existing patterns
