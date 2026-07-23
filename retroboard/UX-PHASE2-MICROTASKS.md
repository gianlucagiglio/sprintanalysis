# Phase 2 - Micro Tasks Breakdown

## Overview
Phase 2 remaining work split into atomic 5-15 minute tasks for faster iteration and easier testing.

Total estimated: 4.5 ore → 18 micro-tasks × 15 min each

---

## Batch A: Empty States (45 min = 3 tasks)

### Task 2.1: Dashboard Empty State - Icon Enhancement (15 min)
**File**: `src/components/dashboard/Dashboard.tsx` (lines 314-326)
**Changes**:
- Change icon size from 28 to 36
- Add gradient background `bg-gradient-to-br from-retro-primary-400 to-indigo-600`
- Add `animate-pulse-glow` class
- Change rounded from `2xl` to `3xl`

**Before**:
```tsx
<div className="w-16 h-16 rounded-2xl bg-retro-primary-light flex items-center justify-center mx-auto mb-4">
  <FolderOpen size={28} className="text-retro-primary" />
</div>
```

**After**:
```tsx
<div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-retro-primary-400 to-indigo-600
  flex items-center justify-center mx-auto mb-6 shadow-primary animate-pulse-glow">
  <FolderOpen size={36} className="text-white" />
</div>
```

**Test**: Logout → login → dashboard shows enhanced empty state

---

### Task 2.2: Dashboard Empty State - Copy Enhancement (15 min)
**File**: `src/components/dashboard/Dashboard.tsx` (lines 318-319)
**Changes**:
- Improve title: "Nessuna retrospettiva" → "Nessuna retrospettiva trovata"
- Expand description with benefits
- Wrap in `max-w-sm mx-auto` for readability

**Before**:
```tsx
<p className="text-lg font-semibold text-retro-text mb-1">Nessuna retrospettiva</p>
<p className="text-sm text-retro-text-secondary mb-6">Crea una nuova sessione o unisciti a una esistente</p>
```

**After**:
```tsx
<p className="text-xl font-bold text-retro-text-DEFAULT mb-2">
  Nessuna retrospettiva trovata
</p>
<p className="text-sm text-retro-text-secondary mb-8 max-w-sm mx-auto">
  Crea la tua prima sessione per iniziare a raccogliere feedback dal team,
  oppure unisciti a una retrospettiva esistente.
</p>
```

**Test**: Text reads naturally, width constrained on desktop

---

### Task 2.3: Dashboard Empty State - Dual CTA (15 min)
**File**: `src/components/dashboard/Dashboard.tsx` (lines 320-325)
**Changes**:
- Add flex container with gap-3
- Add secondary button "Ho un codice"
- Increase button size to `lg`

**Before**:
```tsx
{canCreate(user?.email) && (
  <Button onClick={() => setShowCreate(true)}>
    <Plus size={16} />
    Crea la prima sessione
  </Button>
)}
```

**After**:
```tsx
{canCreate(user?.email) && (
  <div className="flex items-center justify-center gap-3">
    <Button onClick={() => setShowCreate(true)} size="lg">
      <Plus size={18} />
      Crea la prima sessione
    </Button>
    <Button variant="secondary" size="lg" onClick={() => document.querySelector('input[placeholder*="ID sessione"]')?.focus()}>
      <LinkIcon size={18} />
      Ho un codice
    </Button>
  </div>
)}
```

**Test**: Click "Ho un codice" → focus jumps to join input

---

## Batch B: SessionCard Hover (30 min = 2 tasks)

### Task 2.4: SessionCard Hover - Add Entrance Animation (15 min)
**File**: `src/components/dashboard/SessionCard.tsx`
**Changes**:
- Import stagger animation
- Add `animate-slide-up` to main card
- Calculate stagger delay based on index (need to pass index prop)

**Change**:
Add to SessionCard component:
```tsx
interface SessionCardProps {
  // ... existing props
  index?: number  // NEW
}

// In card className:
className={`... animate-slide-up ${index !== undefined ? `stagger-${(index % 5) + 1}` : ''}`}
```

**Parent change** (Dashboard.tsx):
```tsx
{teamSessions.map((s, idx) => (
  <SessionCard
    key={s.id}
    session={s}
    participantCount={s.participant_count}
    index={idx}  // NEW
    onDelete={handleDelete}
  />
))}
```

**Test**: Refresh dashboard → cards slide up in stagger sequence

---

### Task 2.5: SessionCard Hover - Enhanced Scale (15 min)
**File**: `src/components/dashboard/SessionCard.tsx`
**Changes**:
- Card already uses `hover` prop, verify scale-102 is applied
- Add transition-transform if missing
- Verify shadow-card-hover triggers

**Verify/Add**:
```tsx
<Card
  hover
  className="transition-all duration-300 ease-out"  // Ensure smooth transform
>
```

**Test**: Hover over card → subtle scale + shadow lift

---

## Batch C: Dashboard Tabs Stagger (30 min = 2 tasks)

### Task 2.6: Dashboard Tabs - Add Stagger Animation (15 min)
**File**: `src/components/dashboard/Dashboard.tsx` (lines 282-306)
**Changes**:
- Add `animate-slide-right` to each tab button
- Add `stagger-{idx+1}` class

**Before**:
```tsx
<button
  key={tab.key}
  onClick={() => setFilter(tab.key)}
  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
    transition-all duration-200
    ${isActive ? '...' : '...'}
  `}
>
```

**After**:
```tsx
{filterTabs.map((tab, idx) => {
  const Icon = tab.icon
  const isActive = filter === tab.key
  return (
    <button
      key={tab.key}
      onClick={() => setFilter(tab.key)}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        animate-slide-right stagger-${idx + 1}
        ${isActive ? '...' : '...'}
      `}
    >
```

**Test**: Refresh dashboard → tabs slide in from left sequentially

---

### Task 2.7: Dashboard Tabs - Active State Scale (15 min)
**File**: `src/components/dashboard/Dashboard.tsx` (lines 282-306)
**Changes**:
- Add `scale-105` to active tab button
- Add `scale-110` to count badge when active

**Change**:
```tsx
className={`...
  ${isActive
    ? 'bg-white shadow-soft text-retro-text-DEFAULT scale-105'  // ADD scale-105
    : 'text-retro-text-secondary hover:text-retro-text-DEFAULT'
  }
`}

// Count badge:
<span className={`...
  ${isActive
    ? 'bg-retro-primary-50 text-retro-primary-600 scale-110'  // ADD scale-110
    : 'bg-slate-200 text-retro-text-secondary'
  }
`}>
```

**Test**: Click different tabs → active tab scales up slightly

---

## Batch D: Sidebar Progress (45 min = 3 tasks)

### Task 2.8: Sidebar - Read Current Progress Bar (15 min)
**File**: `src/components/layout/Sidebar.tsx`
**Action**: READ ONLY - locate progress bar implementation
**Goal**: Find where progress percentage is rendered (likely around participant status)

**Search for**: `progress`, `percentage`, `width:`, `participant`, `done`

**Document**: Current implementation location and structure

---

### Task 2.9: Sidebar - Add Shine Animation CSS (15 min)
**File**: `src/index.css`
**Changes**: Add shine keyframe animation

**Add after existing animations**:
```css
@keyframes shine {
  0% {
    background-position: -100%;
  }
  100% {
    background-position: 200%;
  }
}

.animate-shine {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shine 2s ease-in-out infinite;
}
```

**Test**: Apply `.animate-shine` to any element → see shine effect

---

### Task 2.10: Sidebar - Apply Shine to Progress (15 min)
**File**: `src/components/layout/Sidebar.tsx`
**Changes**: Add shine overlay to progress bar

**Pattern**:
```tsx
<div className="relative overflow-hidden">
  <div className="h-2 bg-retro-surface rounded-full">
    <div
      className="h-full bg-gradient-to-r from-retro-primary-600 to-retro-primary-400 rounded-full transition-all duration-500"
      style={{ width: `${progressPercent}%` }}
    />
  </div>
  {progressPercent > 0 && progressPercent < 100 && (
    <div className="absolute inset-0 animate-shine" />
  )}
</div>
```

**Test**: Open session with partial progress → bar shines

---

## Batch E: Loading States (60 min = 4 tasks)

### Task 2.11: LoginForm - Add Loading State (15 min)
**File**: `src/components/auth/LoginForm.tsx`
**Changes**: Use Button loading prop

**Find submit button** (around line 59-62):
```tsx
<Button
  type="submit"
  className="w-full"
  disabled={loading}
  loading={loading}  // ADD THIS
>
```

**Test**: Click login → button shows spinner during auth

---

### Task 2.12: RegisterForm - Add Loading State (15 min)
**File**: `src/components/auth/RegisterForm.tsx`
**Changes**: Same as LoginForm

**Pattern**: Add `loading={loading}` prop to submit button

**Test**: Register new account → spinner shows

---

### Task 2.13: CreateSessionModal - Add Loading State (15 min)
**File**: `src/components/dashboard/CreateSessionModal.tsx`
**Changes**: Add loading to create button

**Pattern**:
```tsx
<Button
  onClick={handleCreate}
  loading={isCreating}  // ADD THIS
  disabled={!title.trim() || isCreating}
>
  {isCreating ? 'Creazione...' : 'Crea sessione'}
</Button>
```

**Test**: Create session → button shows loading

---

### Task 2.14: SessionCard - Add Loading on Delete (15 min)
**File**: `src/components/dashboard/SessionCard.tsx`
**Changes**: Show loading state when deleting

**Pattern**:
```tsx
const [isDeleting, setIsDeleting] = useState(false)

const handleDelete = async () => {
  if (!confirm('...')) return
  setIsDeleting(true)
  await onDelete(session.id)
  // setIsDeleting(false) not needed - component unmounts
}

// Button:
<Button
  variant="danger"
  size="sm"
  loading={isDeleting}
  onClick={handleDelete}
>
```

**Test**: Delete session → button shows spinner briefly

---

## Batch F: Additional Polish (60 min = 4 tasks)

### Task 2.15: Add Skeleton to ActionsPage (15 min)
**File**: `src/pages/ActionsPage.tsx`
**Changes**: Import and use ListSkeleton

**Pattern**:
```tsx
import { ListSkeleton } from '@/components/ui/Skeleton'

// In loading state:
{loading ? (
  <ListSkeleton count={5} />
) : (
  // ... kanban board
)}
```

**Test**: Navigate to /actions → skeleton shows while loading

---

### Task 2.16: Add Skeleton to LeaderboardPage (15 min)
**File**: `src/pages/LeaderboardPage.tsx`
**Changes**: Add skeleton for leaderboard table

**Pattern**:
```tsx
{loading ? (
  <div className="space-y-2">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg">
        <Skeleton variant="text" width={30} />
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="40%" className="flex-1" />
        <Skeleton variant="text" width={60} />
      </div>
    ))}
  </div>
) : (
  // ... leaderboard
)}
```

**Test**: Navigate to /leaderboard → skeleton table

---

### Task 2.17: Add Skeleton to ProfilePage (15 min)
**File**: `src/pages/ProfilePage.tsx`
**Changes**: Add skeleton for profile stats

**Pattern**:
```tsx
{loading ? (
  <div className="grid gap-4 sm:grid-cols-3">
    <CardSkeleton />
    <CardSkeleton />
    <CardSkeleton />
  </div>
) : (
  // ... profile stats
)}
```

**Test**: Navigate to /profilo → skeleton cards

---

### Task 2.18: Add Card Entrance Animation (15 min)
**File**: Multiple card components
**Changes**: Add `animate-slide-up` to main cards across pages

**Locations**:
- `src/pages/MetricsPage.tsx` - stats cards
- `src/pages/TeamsPage.tsx` - team cards
- `src/pages/ProfilePage.tsx` - badge showcase

**Pattern**: Add `className="animate-slide-up"` to Card wrapper

**Test**: Navigate to each page → cards slide up on entry

---

## Summary

| Batch | Tasks | Time | Focus |
|-------|-------|------|-------|
| A | 3 | 45 min | Empty States |
| B | 2 | 30 min | SessionCard Hover |
| C | 2 | 30 min | Dashboard Tabs |
| D | 3 | 45 min | Sidebar Progress |
| E | 4 | 60 min | Loading States |
| F | 4 | 60 min | Additional Polish |
| **Total** | **18** | **4.5h** | **Phase 2 Complete** |

---

## Execution Strategy

### Sequential (Recommended)
Do batches in order A→B→C→D→E→F. Each batch is independent and can be committed.

**Commit after each batch**:
```bash
git add .
git commit -m "feat(ux): Phase 2 Batch A - Empty States"
git push
```

### Parallel (Advanced)
If multiple people, assign batches independently:
- Person 1: Batches A, B, C
- Person 2: Batches D, E, F

### Cherry-Pick (Flexible)
Pick high-impact tasks first:
1. Task 2.1-2.3 (Empty states - high visibility)
2. Task 2.11-2.14 (Loading states - UX critical)
3. Task 2.4-2.7 (Animations - delight factor)
4. Task 2.8-2.10 (Sidebar - nice to have)
5. Task 2.15-2.18 (Additional - optional)

---

## Testing Checklist

After each task:
- [ ] HMR compiles without errors
- [ ] Visual change is visible in browser
- [ ] No console errors
- [ ] Animation timing feels natural (not too fast/slow)
- [ ] Works on mobile (responsive)

After each batch:
- [ ] All tasks in batch tested individually
- [ ] Cross-browser check (Chrome, Firefox, Safari)
- [ ] Commit with clear message
- [ ] Push to remote

---

## Quick Reference

**Animation Classes**:
- `animate-slide-up` - Entrance from bottom (0.4s)
- `animate-slide-right` - Entrance from left (0.3s)
- `animate-pulse-glow` - Glow effect (2s infinite)
- `animate-shine` - Shine effect (2s infinite)
- `stagger-1` to `stagger-5` - Delays (0-200ms)

**Scale Classes**:
- `scale-98` - Active press
- `scale-102` - Subtle hover
- `scale-105` - Prominent hover
- `scale-110` - Badge emphasis

**Colors**:
- `retro-primary-{50,100,400,500,600,700}` - Primary scale
- `retro-text-{DEFAULT,secondary,tertiary}` - Text hierarchy
- `retro-border-{DEFAULT,strong}` - Borders

**Shadows**:
- `shadow-soft` - Minimal elevation
- `shadow-card` - Card elevation
- `shadow-card-hover` - Lifted card
- `shadow-primary` - Colored primary shadow
- `shadow-glad/mad` - Colored feedback shadows
