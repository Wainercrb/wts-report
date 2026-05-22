# Specification: Heroicons Integration into wts-report UI

**Phase**: SDD Specification  
**Change**: wts-report-heroicons-integration  
**Date**: 2026-05-21  
**Status**: APPROVED & LOCKED  

---

## Executive Summary

Replace all 14 Material Symbols icon instances across 10 components with Heroicons (v2.x), eliminating external CDN dependency while maintaining pixel-perfect visual equivalence. Implementation follows 5 sequential phases: utility creation → template refactor → organism refactor → atom enhancement → CDN removal.

**Scope**: UI layer only (no backend changes)  
**Risk**: VERY LOW (decorative icons, no business logic)  
**Timeline**: ~3 hours total  

---

## Requirements

### Functional
- **R1**: All 14 Material Symbols instances replaced with Heroicons
- **R2**: No external Material Symbols CDN dependency
- **R3**: Icons properly sized (h-5 w-5 for all, = 20px)
- **R4**: Colors applied correctly (Tailwind classes)
- **R5**: Zero visual regressions (pixel-perfect or very close)
- **R6**: Build succeeds, bundle size neutral
- **R7**: Accessibility maintained (aria-labels where needed)
- **R8**: DeleteIcon component uses XMarkIcon (enhancement)

### Non-Functional
- **NF1**: Tree-shaking removes unused icons (no bloat)
- **NF2**: ESLint passes (no violations)
- **NF3**: TypeScript compiles without errors
- **NF4**: Extension builds and runs without errors

---

## Phase Specifications

### Phase 1: Create IconMap Utility

**File**: `ui/src/utils/IconMap.js`  
**Action**: CREATE  
**Purpose**: Centralized registry of all Heroicons used in wts-report

**Implementation**:
```javascript
// IconMap.js — Export all Heroicons used in wts-report

import {
  GitBranchIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  UsersIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/20/solid';

export {
  GitBranchIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  UsersIcon,
  ArchiveBoxIcon,
};

export default {
  GitBranchIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckIcon,
  UsersIcon,
  ArchiveBoxIcon,
};
```

**Validation**:
- `npm run build` succeeds (tree-shaking validates all icons exist)
- No console warnings about missing icons

---

### Phase 2: Replace Template Icons (AutomaticTab.js, ManualTab.js)

#### AutomaticTab.js Changes

**1. Line 1–6: Add import**
```javascript
import { GitBranchIcon, PlusCircleIcon } from '../utils/IconMap';
```

**2. Line 34: Git branch icon (header)**
- OLD: `<span className="material-symbols-outlined text-blue-600 text-xl">git_branch</span>`
- NEW: `<GitBranchIcon className="text-blue-600 h-5 w-5" aria-label="git branch icon" />`

**3. Line 107: Plus circle icon (Add URL button)**
- OLD: `<span className="material-symbols-outlined text-lg">add_circle</span>`
- NEW: `<PlusCircleIcon className="h-5 w-5" aria-label="add url icon" />`

**4. Line 147: Git branch icon (Check History button)**
- OLD: `<span className="material-symbols-outlined text-lg">git_branch</span>`
- NEW: `<GitBranchIcon className="h-5 w-5" aria-label="check history icon" />`

#### ManualTab.js Changes

**1. Line 1–6: Add imports**
```javascript
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, CheckIcon, UsersIcon } from '../utils/IconMap';
```

**2. Line 101: Dynamic type icon (conditional render)**
- OLD: `<span className="material-symbols-outlined" style={{...}}>...type icon...</span>`
- NEW:
```javascript
{currentItem.tsType === 'meeting' ? (
  <UsersIcon className="text-blue-600 h-5 w-5" aria-label="meeting icon" />
) : (
  <CheckIcon className="text-blue-600 h-5 w-5" aria-label="task icon" />
)}
```

**3. Line 125: Chevron left (Back button)**
- OLD: `<span className="material-symbols-outlined text-base">chevron_left</span>`
- NEW: `<ChevronLeftIcon className="h-5 w-5" />`

**4. Line 134: Chevron right (Next button)**
- OLD: `<span className="material-symbols-outlined text-base">chevron_right</span>`
- NEW: `<ChevronRightIcon className="h-5 w-5" />`

**5. Line 156: Check circle (Finish button)**
- OLD: `<span className="material-symbols-outlined text-lg">check_circle</span>`
- NEW: `<CheckCircleIcon className="h-5 w-5" />`

---

### Phase 3: Replace Organism Icons

#### AddedItems.js Changes

**1. Add imports**:
```javascript
import { PlusCircleIcon, CheckCircleIcon, CheckIcon, UsersIcon, ArrowDownTrayIcon } from '../utils/IconMap';
```

**2. Line 22: plus_circle → PlusCircleIcon**
- OLD: `<span className="material-symbols-outlined text-blue-600 text-lg">add_circle</span>`
- NEW: `<PlusCircleIcon className="text-blue-600 h-5 w-5" />`

**3. Line 34: check_circle → CheckCircleIcon**
- OLD: `<span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>`
- NEW: `<CheckCircleIcon className="text-green-500 h-5 w-5" />`

**4. Line 35: Dynamic type icon**
```javascript
{item.tsType === 'meeting' ? (
  <UsersIcon className="text-blue-500 h-5 w-5" aria-label="meeting icon" />
) : (
  <CheckIcon className="text-blue-500 h-5 w-5" aria-label="task icon" />
)}
```

**5. Line 44: save → ArrowDownTrayIcon**
- OLD: `<span className="material-symbols-outlined text-blue-600">save</span>`
- NEW: `<ArrowDownTrayIcon className="text-blue-600 h-5 w-5" />`

#### ResultSection.js Changes

**1. Add imports**:
```javascript
import { DocumentTextIcon } from '../utils/IconMap';
```

**2. Line 22: description → DocumentTextIcon**
- OLD: `<span className="material-symbols-outlined text-gray-500">description</span>`
- NEW: `<DocumentTextIcon className="text-gray-500 h-5 w-5" />`

#### StoredItems.js Changes

**1. Add imports**:
```javascript
import { ArchiveBoxIcon, CheckIcon, UsersIcon } from '../utils/IconMap';
```

**2. Line 23: inventory_2 → ArchiveBoxIcon**
- OLD: `<span className="material-symbols-outlined text-blue-600 text-lg">inventory_2</span>`
- NEW: `<ArchiveBoxIcon className="text-blue-600 h-5 w-5" />`

**3. Line 41: Dynamic type icon**
```javascript
{item.tsType === 'meeting' ? (
  <UsersIcon className="text-blue-500 h-5 w-5" aria-label="meeting icon" />
) : (
  <CheckIcon className="text-blue-500 h-5 w-5" aria-label="task icon" />
)}
```

---

### Phase 4: Enhance DeleteIcon Component

**File**: `ui/src/components/atoms/DeleteIcon.js`  
**Action**: MODIFY  

**Current Implementation**: Uses custom ✕ character

**New Implementation**:
```javascript
import { XMarkIcon } from '../utils/IconMap';

export function DeleteIcon({ className = '', ariaLabel = 'delete' }) {
  return (
    <XMarkIcon 
      className={`h-5 w-5 ${className}`} 
      aria-label={ariaLabel} 
    />
  );
}
```

**Benefits**:
- Consistent icon library across all components
- Matches design system (Heroicons)
- Better accessibility with aria-label

---

### Phase 5: Remove Material Symbols CDN

**File**: `ui/src/index.html`  
**Action**: REMOVE

**Current**:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
```

**New**: (Remove the line entirely)

**File**: `ui/src/styles.css`  
**Action**: CLEAN (if material-symbols-outlined rule exists)

**Remove any CSS rules like**:
```css
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}
```

---

## Icon Mapping Reference

| Material Symbols | Heroicons | Size | Color | Components | Count |
|---|---|---|---|---|---|
| git_branch | GitBranchIcon | h-5 w-5 | text-blue-600 | AutomaticTab, ManualTab | 3 |
| add_circle | PlusCircleIcon | h-5 w-5 | text-blue-600, text-blue-500 | AutomaticTab, AddedItems | 2 |
| chevron_left | ChevronLeftIcon | h-5 w-5 | text-gray-900 | ManualTab | 1 |
| chevron_right | ChevronRightIcon | h-5 w-5 | text-white | ManualTab | 1 |
| check_circle | CheckCircleIcon | h-5 w-5 | text-white, text-green-500 | ManualTab, AddedItems | 2 |
| assignment (task) | CheckIcon | h-5 w-5 | text-blue-600, text-blue-500 | ManualTab, AddedItems, StoredItems | 3 |
| meeting | UsersIcon | h-5 w-5 | text-blue-600, text-blue-500 | ManualTab, AddedItems, StoredItems | 3 |
| save | ArrowDownTrayIcon | h-5 w-5 | text-blue-600 | AddedItems | 1 |
| description | DocumentTextIcon | h-5 w-5 | text-gray-500 | ResultSection | 1 |
| inventory_2 | ArchiveBoxIcon | h-5 w-5 | text-blue-600 | StoredItems | 1 |

**Total**: 14 Material Symbols → 11 Heroicons (some reused across multiple components)

---

## File Manifest

| File | Action | Scope | Priority |
|------|--------|-------|----------|
| ui/src/utils/IconMap.js | CREATE | Phase 1 | P0 |
| ui/src/components/templates/AutomaticTab.js | MODIFY | Phase 2 | P0 |
| ui/src/components/templates/ManualTab.js | MODIFY | Phase 2 | P0 |
| ui/src/components/organisms/AddedItems.js | MODIFY | Phase 3 | P0 |
| ui/src/components/organisms/ResultSection.js | MODIFY | Phase 3 | P0 |
| ui/src/components/organisms/StoredItems.js | MODIFY | Phase 3 | P0 |
| ui/src/components/atoms/DeleteIcon.js | MODIFY | Phase 4 | P1 |
| ui/src/index.html | MODIFY | Phase 5 | P1 |
| ui/src/styles.css | MODIFY | Phase 5 | P1 |

---

## Acceptance Criteria

### Functional ✓
- [ ] All 14 Material Symbols instances replaced with Heroicons
- [ ] No external CDN calls to Material Symbols fonts
- [ ] All icons visible and properly sized (h-5 w-5 = 20px)
- [ ] All icon colors correct (Tailwind classes applied)
- [ ] Dynamic type icons render correctly (meeting → UsersIcon, task → CheckIcon)
- [ ] Build succeeds: `npm run build` → 0 errors
- [ ] Extension compiles: `npm run compile` → 0 errors
- [ ] No console errors or warnings

### Visual/UX ✓
- [ ] Icons visually equivalent to originals or better
- [ ] No visual regressions in layout or spacing
- [ ] Hover states unchanged
- [ ] Disabled states unchanged
- [ ] DeleteIcon renders with proper styling

### Quality ✓
- [ ] ESLint passes: 0 violations
- [ ] TypeScript compiles: 0 errors
- [ ] Bundle size neutral (tree-shaking removes unused icons)
- [ ] All icons have aria-labels where appropriate
- [ ] No console warnings from missing icon imports

### Validation ✓
- [ ] **Grep test**: `grep -r "material-symbols-outlined" ui/src/components/` → 0 results
- [ ] **Grep test**: `grep -r "Material+Symbols" ui/src/` → 0 results
- [ ] **Grep test**: All components import from `../utils/IconMap`
- [ ] **Grep test**: All color classes (text-blue-600, etc.) preserved

---

## Rollback Plan

### Level 1: Minor Issues (Color/Size)
**Condition**: One or two icons have wrong color or size  
**Action**: Adjust Tailwind classes in specific components only  
**Timeline**: 15 minutes

### Level 2: Visual Regression (Multiple Components)
**Condition**: Visual mismatch across multiple components  
**Action**: Revert last 2–3 commits, investigate icon differences, retry  
**Timeline**: 30 minutes

### Level 3: Build Failure
**Condition**: `npm run build` or `npm run compile` fails  
**Action**: 
1. Revert Phase 1 (IconMap.js creation)
2. Verify imports are removed in all components
3. Retry the build
4. Fix import issues individually

**Timeline**: 45 minutes

### Level 4: Full Rollback
**Condition**: Critical regression; icon library incompatibility  
**Action**: 
1. Revert all heroicons commits
2. Restore Material Symbols CDN in index.html
3. All components revert to span elements
4. Verify Material Symbols loads from CDN

**Timeline**: 15 minutes

---

## Dependencies & Timeline

### External Dependencies
- **@heroicons/react**: v2.x (already installed)
- **React**: v16+ (already available)
- **Tailwind CSS**: v3+ (already configured)

### Internal Dependencies
- IconMap utility (Phase 1) → must complete before Phase 2–4

### Timeline Estimate
| Phase | Duration | Owner |
|-------|----------|-------|
| Phase 1 (IconMap) | 20 min | Apply Agent |
| Phase 2 (Templates) | 40 min | Apply Agent |
| Phase 3 (Organisms) | 40 min | Apply Agent |
| Phase 4 (DeleteIcon) | 15 min | Apply Agent |
| Phase 5 (CDN Removal) | 10 min | Apply Agent |
| **Verify** | 30 min | Verify Agent |
| **Total** | ~2.5–3 hours | — |

---

## Risk Assessment

### Risk: LOW
**Rationale**: 
- Decorative icons (no business logic)
- 1:1 mapping (no ambiguity)
- Tree-shaking ensures no unused code
- Heroicons library is stable and widely used

### Known Unknowns
- Icon color rendering may differ slightly from Material Symbols
- Hover/focus states may require micro-adjustments

### Mitigation
- Run visual diff tool after apply phase
- Test interactive states (hover, focus, disabled) in browser
- Keep Material Symbols CDN link available as emergency fallback

---

## Next Steps (sdd-design Phase)

1. **Design Phase** (optional): Can be skipped for this mechanical refactor OR run to define icon sizing/spacing rules
2. **Apply Phase**: Execute all 5 phases sequentially
3. **Verify Phase**: Validate against acceptance criteria
4. **Archive Phase**: Close out change, document lessons learned

---

**Specification Status**: ✅ LOCKED & READY FOR APPLY  
**Approval**: Proposal approved; no changes needed  
**Proceeding to**: sdd-apply phase
