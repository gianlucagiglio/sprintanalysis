# Phase 3 - Premium Polish Micro Tasks

## Overview
Phase 3 work split into atomic 10-20 minute tasks for premium visual polish.

Total estimated: 8 ore → 24 micro-tasks × 20 min each

---

## Batch A: Typography Refinement (60 min = 3 tasks)

### Task 3.1: Add JetBrains Mono for Numbers (20 min)
**Files**: `src/index.css`, `tailwind.config.js`
**Goal**: Tabular figures for numbers/stats

**Step 1 - Install font**:
```bash
npm install @fontsource/jetbrains-mono
```

**Step 2 - Import in index.css**:
```css
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/600.css';
```

**Step 3 - Add to Tailwind**:
```js
// tailwind.config.js
fontFamily: {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],  // ADD
}
```

**Test**: Apply `font-mono` to any number → monospace

---

### Task 3.2: Apply Mono to Point Values (20 min)
**Files**: Multiple components with point displays
**Changes**: Add `font-mono` to number spans

**Locations**:
- `src/components/gamification/PointsWidget.tsx` - Points display
- `src/components/gamification/Leaderboard.tsx` - Score column
- `src/pages/ProfilePage.tsx` - Stats numbers

**Pattern**:
```tsx
// Before:
<span className="text-2xl font-bold">{points}</span>

// After:
<span className="text-2xl font-bold font-mono">{points}</span>
```

**Test**: Points don't shift width when value changes (tabular)

---

### Task 3.3: Display Tracking Adjustment (20 min)
**File**: `src/index.css`
**Goal**: Tighten letter-spacing for display text

**Add utility class**:
```css
.tracking-display {
  letter-spacing: -0.02em;  /* -2% tracking */
}
```

**Apply to**:
- Page titles (h1, text-2xl+)
- Hero headlines
- Dashboard "Le tue retrospettive" title

**Pattern**:
```tsx
<h1 className="text-2xl font-bold tracking-display">
  Le tue retrospettive
</h1>
```

**Test**: Headlines look tighter, more premium

---

## Batch B: Colored Shadows (80 min = 4 tasks)

### Task 3.4: Primary Button Colored Shadow (20 min)
**File**: Already done in Phase 1! ✅
**Verify**: Primary buttons have `shadow-primary` on hover

**If missing**, add to Button.tsx:
```tsx
primary: '... shadow-primary hover:shadow-primary ...'
```

**Test**: Hover primary button → indigo glow

---

### Task 3.5: Success Button Colored Shadow (20 min)
**File**: `src/components/ui/Button.tsx`
**Goal**: Add success variant with green shadow

**Add variant**:
```tsx
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'  // ADD success

const variantStyles = {
  // ...
  success: 'bg-gradient-to-r from-retro-glad to-emerald-400 text-white shadow-glad hover:shadow-glad hover:scale-105 active:scale-98',
}
```

**Usage**:
```tsx
<Button variant="success">Conferma</Button>
```

**Test**: Hover → green glow

---

### Task 3.6: Badge Glow on Unlock (20 min)
**File**: `src/components/gamification/BadgeUnlockModal.tsx`
**Changes**: Add glow prop to badge display

**Pattern**:
```tsx
<Badge
  variant="primary"
  glow  // ADD THIS
  className="text-lg px-6 py-3"
>
  {badgeName}
</Badge>
```

**Test**: Unlock badge → badge glows in modal

---

### Task 3.7: PointsWidget Glow on Update (20 min)
**File**: `src/components/gamification/PointsWidget.tsx`
**Changes**: Flash glow when points increase

**Add state**:
```tsx
const [showGlow, setShowGlow] = useState(false)

useEffect(() => {
  if (points > 0) {
    setShowGlow(true)
    setTimeout(() => setShowGlow(false), 2000)
  }
}, [points])
```

**Apply glow**:
```tsx
<div className={`font-mono text-3xl font-bold ${showGlow ? 'animate-pulse-glow' : ''}`}>
  {points}
</div>
```

**Test**: Earn points → number glows briefly

---

## Batch C: Glow Effects (60 min = 3 tasks)

### Task 3.8: Achievement Banner Glow (20 min)
**File**: `src/components/gamification/BadgeUnlockedToast.tsx`
**Changes**: Add glow animation to achievement toast

**Pattern**:
```tsx
<div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 rounded-xl p-4 shadow-float animate-pulse-glow">
  {/* content */}
</div>
```

**Test**: Unlock badge → toast has pulsing glow

---

### Task 3.9: Progress Bar Glow at 100% (20 min)
**File**: Wherever progress bars are (Sidebar, SessionWizard)
**Changes**: Add glow when progress reaches 100%

**Pattern**:
```tsx
<div
  className={`h-full bg-gradient-to-r from-retro-primary-600 to-retro-primary-400 rounded-full
    transition-all duration-500
    ${progressPercent === 100 ? 'shadow-primary animate-pulse-glow' : ''}
  `}
  style={{ width: `${progressPercent}%` }}
/>
```

**Test**: Complete all steps → progress bar glows

---

### Task 3.10: Session Complete Confetti Prep (20 min)
**File**: `src/components/session/SessionWizard.tsx`
**Goal**: Add glow to "Chiudi sessione" button

**Changes**:
```tsx
<Button
  onClick={closeSession}
  size="lg"
  className="shadow-primary hover:shadow-primary animate-pulse-glow"
>
  <PartyPopper size={20} />
  Chiudi sessione
</Button>
```

**Test**: Reach final step → button glows invitingly

---

## Batch D: Dark Mode Preparation (80 min = 4 tasks)

### Task 3.11: CSS Variables Setup (20 min)
**File**: `src/index.css`
**Goal**: Convert colors to CSS variables

**Add**:
```css
:root {
  --color-bg: #F9FAFB;
  --color-card: #FFFFFF;
  --color-text: #111827;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;
  --color-primary: #6366F1;
  --color-primary-light: #EEF2FF;
}

[data-theme="dark"] {
  --color-bg: #0F172A;
  --color-card: #1E293B;
  --color-text: #F1F5F9;
  --color-text-secondary: #94A3B8;
  --color-border: #334155;
  --color-primary: #818CF8;
  --color-primary-light: #312E81;
}
```

**Test**: Apply `data-theme="dark"` to html → manual dark mode works

---

### Task 3.12: Update Tailwind to Use Variables (20 min)
**File**: `tailwind.config.js`
**Changes**: Point colors to CSS variables

**Pattern**:
```js
colors: {
  retro: {
    bg: 'var(--color-bg)',
    card: 'var(--color-card)',
    text: {
      DEFAULT: 'var(--color-text)',
      secondary: 'var(--color-text-secondary)',
    },
    // ... rest
  }
}
```

**Test**: CSS changes propagate to components

---

### Task 3.13: Dark Mode Toggle Component (20 min)
**File**: `src/components/ui/ThemeToggle.tsx` (NEW)
**Goal**: Create moon/sun toggle button

**Create**:
```tsx
import { Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-retro-sidebar hover:bg-retro-surface transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}
```

**Test**: Click → theme switches (if variables set up)

---

### Task 3.14: Add Toggle to Navbar (20 min)
**File**: `src/components/layout/Navbar.tsx`
**Changes**: Add ThemeToggle to navbar

**Import and add**:
```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// In navbar (after other buttons):
<ThemeToggle />
```

**Test**: Toggle visible in navbar, clickable

---

## Batch E: Advanced Animations (100 min = 5 tasks)

### Task 3.15: Card Flip Animation (20 min)
**File**: `src/index.css`
**Goal**: Add flip animation for special cards

**Add keyframe**:
```css
@keyframes flip {
  0% {
    transform: perspective(400px) rotateY(0);
  }
  100% {
    transform: perspective(400px) rotateY(360deg);
  }
}

.animate-flip {
  animation: flip 0.6s ease-in-out;
}
```

**Usage**: Apply to badge cards when unlocked

**Test**: Add class → element flips

---

### Task 3.16: Bounce Animation (20 min)
**File**: `src/index.css`
**Goal**: Add bounce for CTAs

**Add**:
```css
@keyframes bounce-gentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}
```

**Usage**: Apply to primary CTAs on empty states

**Test**: Element bounces gently

---

### Task 3.17: Fade In Animation (20 min)
**File**: `src/index.css`
**Goal**: Simple fade for modals

**Add**:
```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

**Usage**: Apply to modal backdrops

**Test**: Modal fades in smoothly

---

### Task 3.18: Slide Down (20 min)
**File**: `src/index.css`
**Goal**: Dropdown animation

**Add**:
```css
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slide-down 0.2s ease-out;
}
```

**Usage**: Apply to dropdowns, toasts

**Test**: Element slides down from top

---

### Task 3.19: Scale In (20 min)
**File**: `src/index.css`
**Goal**: Modal entrance

**Add**:
```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Usage**: Modal content entrance

**Test**: Modal scales in from center

---

## Batch F: Micro-interactions (80 min = 4 tasks)

### Task 3.20: Button Press Animation (20 min)
**File**: `src/components/ui/Button.tsx`
**Goal**: Enhance active state

**Already has** `active:scale-98`. Verify it works:
```tsx
// Should already exist:
className="... active:scale-98 ..."
```

**If missing**, add to all variants.

**Test**: Click and hold button → slightly shrinks

---

### Task 3.21: Input Focus Glow (20 min)
**File**: `src/components/ui/Input.tsx`
**Changes**: Add subtle glow on focus

**Pattern**:
```tsx
focus:ring-4 focus:ring-retro-primary-100 focus:shadow-soft
```

**Test**: Focus input → soft glow + ring

---

### Task 3.22: Checkbox Checkmark Animation (20 min)
**File**: `src/components/ui/Checkbox.tsx` (if exists) or inline
**Goal**: Animated checkmark

**If creating new component**:
```tsx
export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div className={`w-5 h-5 rounded border-2 transition-all duration-200
          ${checked
            ? 'bg-retro-primary border-retro-primary scale-110'
            : 'border-retro-border hover:border-retro-primary-400'
          }
        `}>
          {checked && (
            <svg className="w-full h-full text-white animate-scale-in" viewBox="0 0 12 12">
              <polyline points="2,6 5,9 10,3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
}
```

**Test**: Check checkbox → checkmark animates in

---

### Task 3.23: Toast Slide In (20 min)
**File**: `src/components/gamification/BadgeUnlockedToast.tsx`
**Changes**: Slide in from right

**Add to container**:
```tsx
<div className="fixed top-4 right-4 z-50 animate-slide-right">
  {/* toast content */}
</div>
```

**Test**: Unlock badge → toast slides from right

---

## Batch G: Final Polish (80 min = 4 tasks)

### Task 3.24: Add Backdrop Blur to Modals (20 min)
**Files**: All modal components
**Changes**: Add backdrop-blur to modal backdrops

**Pattern**:
```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
```

**Test**: Open modal → background blurred

---

### Task 3.25: Add Ripple Effect to Buttons (20 min)
**File**: `src/components/ui/Button.tsx`
**Goal**: Material-style ripple on click

**Complex implementation** - skip if too advanced, or use simple scale feedback instead.

**Alternative**: Enhance active:scale-98 with faster transition:
```tsx
transition-all duration-150  // Faster for press feedback
```

**Test**: Click feels snappier

---

### Task 3.26: Image Lazy Loading Prep (20 min)
**Files**: Components with images (avatars, etc)
**Changes**: Add loading="lazy"

**Pattern**:
```tsx
<img src={avatar} alt="..." loading="lazy" />
```

**Locations**:
- Avatar images
- Badge icons
- Team logos

**Test**: Images load only when scrolled into view

---

### Task 3.27: Scroll-to-Top Fade (20 min)
**File**: Create `src/components/ui/ScrollToTop.tsx`
**Goal**: Floating button when scrolled down

**Create**:
```tsx
import { ArrowUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!show) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 p-3 rounded-full bg-retro-primary text-white shadow-float hover:scale-110 transition-all duration-200 animate-fade-in"
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  )
}
```

**Test**: Scroll down → button appears, click → smooth scroll to top

---

## Summary

| Batch | Tasks | Time | Focus |
|-------|-------|------|-------|
| A | 3 | 60 min | Typography |
| B | 4 | 80 min | Colored Shadows |
| C | 3 | 60 min | Glow Effects |
| D | 4 | 80 min | Dark Mode Prep |
| E | 5 | 100 min | Advanced Animations |
| F | 4 | 80 min | Micro-interactions |
| G | 4 | 80 min | Final Polish |
| **Total** | **27** | **8.7h** | **Phase 3 Complete** |

---

## Execution Strategy

### By Priority (Recommended)
1. **High Impact**: Batches B, C (Colored shadows, glows) - 2.3h
2. **Medium Impact**: Batches A, F (Typography, micro-interactions) - 2.3h
3. **Nice to Have**: Batch E (Advanced animations) - 1.7h
4. **Future**: Batch D (Dark mode prep) - 1.3h
5. **Optional**: Batch G (Final polish) - 1.3h

### By Batch (Sequential)
Complete batches A→G in order. Commit after each batch.

### Cherry-Pick (Flexible)
Start with highest ROI tasks:
1. Task 3.2 (Mono for points) - Immediate visual improvement
2. Task 3.6-3.7 (Badge/Points glow) - Delight factor
3. Task 3.3 (Display tracking) - Premium feel
4. Task 3.8-3.10 (Achievement glows) - Celebration moments

---

## Testing Checklist

After each task:
- [ ] Code compiles
- [ ] Animation/effect visible
- [ ] Timing feels natural
- [ ] No performance issues (60fps)
- [ ] Mobile responsive

After each batch:
- [ ] All tasks tested
- [ ] Cross-browser verified
- [ ] Commit with clear message
- [ ] Push to remote

---

## Performance Notes

**Animations**:
- Keep under 300ms for UI feedback
- Use transform/opacity only (GPU accelerated)
- Add `will-change: transform` for frequently animated elements
- Use `prefers-reduced-motion` media query for accessibility

**Colored Shadows**:
- Use sparingly (shadows are expensive)
- Only on hover/focus, not persistent
- Max 2-3 colored shadows visible at once

**Backdrop Blur**:
- `backdrop-blur-sm` (4px) is performant
- `backdrop-blur-lg` (16px) can cause jank on low-end devices
- Test on slower hardware

---

## Quick Reference

**New Animations (Phase 3)**:
- `animate-flip` - 360° flip (0.6s)
- `animate-bounce-gentle` - Soft bounce (2s infinite)
- `animate-fade-in` - Simple fade (0.2s)
- `animate-slide-down` - Dropdown (0.2s)
- `animate-scale-in` - Modal entrance (0.2s)

**Typography**:
- `font-mono` - JetBrains Mono for numbers
- `tracking-display` - -2% letter-spacing for headlines

**Glow Classes**:
- `animate-pulse-glow` - 2s glow pulse
- `shadow-primary` - Indigo colored shadow
- `shadow-glad` - Green colored shadow
- `shadow-mad` - Red colored shadow

**Dark Mode**:
- `data-theme="dark"` on html element
- CSS variables in `:root` and `[data-theme="dark"]`
- `<ThemeToggle />` component in navbar
