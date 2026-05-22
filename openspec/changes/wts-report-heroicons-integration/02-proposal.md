# Heroicons Integration Proposal

**Project:** wts-report  
**Change:** Heroicons CDN Replacement  
**Date:** May 21, 2026  
**Status:** Ready for Specification Phase

---

## 1. Goal Statement

**Primary Objectives:**
1. Replace all 14 Material Symbols instances with Heroicons across the UI
2. Remove external CDN dependency (googleapis.com/css2)
3. Establish centralized, component-based icon management
4. Improve accessibility with proper ARIA labels and semantic icon handling
5. Leverage Heroicons' Tailwind-first design for better styling integration

**Success Outcome:** A cohesive, maintainable icon system that integrates seamlessly with Tailwind CSS, eliminates CDN overhead, and improves accessibility.

---

## 2. Solution Design

### 2.1 IconMap Utility Architecture

**File:** `ui/src/utils/IconMap.js`

The IconMap utility will serve as a centralized registry and factory for all icon components used across the application.

**Design Principles:**
- Single source of truth for all icons
- Tree-shakeable exports (Heroicons advantage)
- Consistent sizing API
- Optional color theming
- Zero breaking changes to consuming components

**Utility Structure:**

```javascript
// ui/src/utils/IconMap.js
import {
  GitBranchIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClipboardIcon,
  ArrowPathIcon,
} from '@heroicons/react/20/solid';

// Size mappings: Heroicons uses inherent sizing via fontSize
// We map Material Symbols sizes (16px, 18px, 20px, 24px) to Tailwind classes
const SIZE_MAP = {
  sm: 'h-4 w-4',      // 16px
  md: 'h-5 w-5',      // 20px (default Material Symbols)
  lg: 'h-6 w-6',      // 24px
};

// Icon registry mapping Material Symbols names to Heroicons components
const ICON_REGISTRY = {
  'git_branch': GitBranchIcon,
  'add_circle': PlusCircleIcon,
  'check_circle': CheckCircleIcon,
  'close': XMarkIcon,
  'edit': PencilSquareIcon,
  'delete': TrashIcon,
  'description': DocumentTextIcon,
  'auto_awesome': SparklesIcon,
  'content_copy': ClipboardIcon,
  'cached': ArrowPathIcon,
};

/**
 * IconWrapper: A simple wrapper component that applies sizing and color classes
 * @param {Object} props
 * @param {React.Component} props.Component - The Heroicons component
 * @param {string} props.size - One of 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.className - Additional Tailwind classes (e.g., 'text-blue-600')
 * @returns {JSX.Element}
 */
const IconWrapper = ({ Component, size = 'md', className = '' }) => {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  return <Component className={`${sizeClass} ${className}`.trim()} />;
};

/**
 * Direct component exports for named imports
 * Allows: import { GitBranchIcon } from '@/utils/IconMap';
 */
export { 
  GitBranchIcon, 
  PlusCircleIcon, 
  CheckCircleIcon, 
  XMarkIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  DocumentTextIcon, 
  SparklesIcon, 
  ClipboardIcon, 
  ArrowPathIcon,
};

/**
 * IconMap object: Named icon access with sizing helper
 * Allows: <IconMap.GitBranchIcon size="md" color="text-blue-600" />
 */
const IconMap = Object.entries(ICON_REGISTRY).reduce((acc, [key, Component]) => {
  acc[key] = ({ size = 'md', color = '' } = {}) => (
    <IconWrapper Component={Component} size={size} className={color} />
  );
  return acc;
}, {});

/**
 * getIcon: Functional helper for dynamic icon access
 * Allows: getIcon('git_branch', { size: 'lg', className: 'text-green-500' })
 */
export const getIcon = (iconName, { size = 'md', className = '' } = {}) => {
  const Component = ICON_REGISTRY[iconName];
  if (!Component) {
    console.warn(`Icon not found: ${iconName}`);
    return null;
  }
  return <IconWrapper Component={Component} size={size} className={className} />;
};

export default IconMap;
```

### 2.2 Component Refactor Pattern

**Before (Material Symbols):**
```javascript
// AutomaticTab.js
<span className="material-symbols-outlined text-blue-600">git_branch</span>
```

**After (Heroicons with direct import):**
```javascript
// AutomaticTab.js
import { GitBranchIcon } from '@/utils/IconMap';

<GitBranchIcon className="h-5 w-5 text-blue-600" />
```

**Alternative pattern (using wrapper for consistency):**
```javascript
// AutomaticTab.js
import { GitBranchIcon } from '@heroicons/react/20/solid';

<GitBranchIcon className="h-5 w-5 text-blue-600" aria-label="Git branch" />
```

**Benefits of this approach:**
- No intermediate wrapper layer needed (Heroicons components are lightweight)
- Direct component composition
- Full control over sizing and styling
- Tree-shaking works automatically

### 2.3 Sizing Strategy

Material Symbols → Heroicons Conversion:

| Material Symbols | Rendered Size | Heroicons Equivalent | Tailwind Class |
|------------------|---------------|----------------------|-----------------|
| 16px (sm)        | 16px          | 20/solid (with scaling) | h-4 w-4         |
| 18px (default)   | 18px          | 20/solid (1.1x scale)  | h-4.5 w-4.5     |
| 20px (md)        | 20px          | 20/solid              | h-5 w-5         |
| 24px (lg)        | 24px          | 20/solid (1.2x scale) | h-6 w-6         |

**Recommended approach:**
- Use Heroicons `/20/solid` variant (perfect for 20px size)
- Map all Material Symbols sizes to nearest Tailwind size class
- Most icons in wts-report are 20px (md), so one-to-one mapping works

### 2.4 Color Integration

**How Heroicons Works with Colors:**
- Heroicons components inherit color from Tailwind CSS classes
- Apply `text-*-*` classes directly to icon components
- No special color configuration needed

**Pattern:**
```javascript
// Colors work via className inheritance
<GitBranchIcon className="h-5 w-5 text-blue-600" />        // Blue
<PlusCircleIcon className="h-5 w-5 text-green-500" />      // Green
<XMarkIcon className="h-5 w-5 text-red-600" />             // Red
<CheckCircleIcon className="h-5 w-5 text-emerald-600" />   // Emerald
```

**Consistency:** All existing color classes (text-blue-600, text-green-500, etc.) will continue to work without modification.

---

## 3. Phased Implementation Plan

### Phase 1: Foundation Setup
- **Task:** Create `ui/src/utils/IconMap.js` with all icon exports
- **Scope:** New file, no changes to existing components
- **Dependencies:** Install `@heroicons/react` package
- **Testing:** Verify imports work, test tree-shaking via build

### Phase 2: Template Component Refactor
- **Components:** AutomaticTab.js, ManualTab.js
- **Changes:** Replace Material Symbols spans with Heroicons components
- **Icon Count:** ~6 instances
- **Pattern:** Direct named imports from Heroicons

### Phase 3: Organism Component Refactor
- **Components:** AddedItems.js, ResultSection.js, StoredItems.js
- **Changes:** Replace Material Symbols spans with Heroicons components
- **Icon Count:** ~6 instances
- **Pattern:** Direct named imports from Heroicons

### Phase 4: Atom Component Enhancement
- **Component:** DeleteIcon.js
- **Current State:** Uses Material Symbols "close" (material-symbols-outlined)
- **Enhancement:** Switch to Heroicons XMarkIcon
- **Value:** More semantic, better accessibility
- **Icon Count:** 2 instances (in DeleteIcon component itself, plus instances of the component)

### Phase 5: Cleanup & CDN Removal
- **File:** ui/src/index.html
- **Changes:** Remove Material Symbols CDN link from `<link>` tag
- **File:** ui/src/styles.css
- **Changes:** Remove Material Symbols font-family declarations
- **Impact:** Eliminates external dependency, reduces HTTP overhead

---

## 4. Icon Mapping Table

**Complete Material Symbols → Heroicons Mapping:**

| Material Symbol | Heroicons Component | Size | Color Classes | Components |
|-----------------|----------------------|------|----------------|------------|
| `git_branch` | GitBranchIcon (20) | h-5 w-5 | text-blue-600 | StoredItems, ManualTab |
| `add_circle` | PlusCircleIcon (20) | h-5 w-5 | text-green-500 | AddedItems, AutomaticTab, ManualTab |
| `check_circle` | CheckCircleIcon (20) | h-5 w-5 | text-emerald-600 | AddedItems |
| `close` | XMarkIcon (20) | h-5 w-5 | text-red-500, text-gray-400 | DeleteIcon (2x) |
| `edit` | PencilSquareIcon (20) | h-5 w-5 | text-orange-500, text-yellow-600 | ResultSection, StoredItems |
| `delete` | TrashIcon (20) | h-5 w-5 | text-red-600 | ResultSection, StoredItems |
| `description` | DocumentTextIcon (20) | h-5 w-5 | text-blue-500 | ResultSection |
| `auto_awesome` | SparklesIcon (20) | h-5 w-5 | text-purple-500 | ResultSection |
| `content_copy` | ClipboardIcon (20) | h-5 w-5 | text-blue-500 | ResultSection |
| `cached` | ArrowPathIcon (20) | h-5 w-5 | text-blue-600 | ManualTab |

**Summary:**
- 10 unique Material Symbols → 10 Heroicons components (1:1 mapping)
- All icons use 20px Heroicons variant (`/20/solid`)
- All icons map to Tailwind size class `h-5 w-5`
- No icons exceed standard Tailwind color palette

---

## 5. Acceptance Criteria

**Icon Replacement:**
- [ ] All 14 Material Symbols instances replaced with Heroicons
- [ ] No `material-symbols-outlined` spans remain in component code
- [ ] Icon visual rendering matches original Material Symbols

**CDN Removal:**
- [ ] Material Symbols CDN `<link>` removed from index.html
- [ ] Material Symbols CSS declarations removed from styles.css
- [ ] Network tab shows zero requests to googleapis.com for fonts
- [ ] No console warnings about missing Material Symbols

**Build & Performance:**
- [ ] `npm run build` in ui/ succeeds without errors
- [ ] No console errors in webview development tools
- [ ] Bundle size neutral or improved (Heroicons is tree-shakeable)
- [ ] Tree-shaking verified: only used icons included in bundle

**Visual & Accessibility:**
- [ ] All icons render correctly with proper sizes
- [ ] All color classes apply correctly to icons
- [ ] Icons have meaningful `aria-label` attributes where appropriate
- [ ] No visual regressions in any UI component

**Component Testing:**
- [ ] AutomaticTab: all 3 icons visible and correct
- [ ] ManualTab: all 2 icons visible and correct
- [ ] AddedItems: add_circle icon visible and correct
- [ ] ResultSection: all 5 icons visible and correct
- [ ] StoredItems: all 2 icons visible and correct
- [ ] DeleteIcon: XMarkIcon renders correctly in all contexts

**Integration:**
- [ ] Extension builds and loads in VS Code
- [ ] Extension webview renders without errors
- [ ] All icon interactions work as expected

---

## 6. Risks & Mitigations

### Risk 1: Visual Mismatch Between Icon Sets
**Severity:** Medium  
**Description:** Heroicons may render slightly differently than Material Symbols (stroke width, proportions, style).

**Mitigation:**
- Preview each icon in the actual component context during Phase 2–4
- Use browser developer tools to compare side-by-side
- Adjust size classes (sm/md/lg) if needed for visual balance
- Document any size adjustments in a visual reference

### Risk 2: CDN Removal Breaking Change
**Severity:** Low  
**Description:** If CDN link is removed before all components are updated, some icons won't render.

**Mitigation:**
- Perform CDN removal (Phase 5) only after all component updates are complete and tested
- Stage the change in a single commit to prevent intermediate breakage
- Verify build and webview rendering before committing

### Risk 3: Color Class Inconsistency
**Severity:** Low  
**Description:** Some components may use inline styles or non-standard color classes.

**Mitigation:**
- Audit all components during Phase 2–4 for color application
- Standardize to Tailwind `text-*-*` classes
- Update styles.css if any Material Symbols-specific color rules exist

### Risk 4: Backward Compatibility (DeleteIcon)
**Severity:** None  
**Description:** DeleteIcon component is internal; no external consumers.

**Mitigation:**
- Change is safe; no external API impact
- Component will be improved with XMarkIcon

### Risk 5: Bundle Size Growth
**Severity:** Low  
**Description:** Adding Heroicons as a dependency might increase bundle size.

**Mitigation:**
- Heroicons is tree-shakeable; only used icons are bundled
- Expected bundle size impact: neutral to slight reduction (CDN overhead removal)
- Monitor bundle size via webpack analysis if needed

---

## 7. IconMap Utility Design Detail

### 7.1 Design Rationale

**Why IconMap?**
1. **Centralization:** Single source of truth for all icons
2. **Maintainability:** Easy to add/remove/update icons
3. **Consistency:** Enforces sizing and color patterns
4. **Tree-shaking:** Unused exports are removed by bundlers
5. **Type Safety:** Can be extended with TypeScript in future

### 7.2 Usage Patterns

**Pattern A: Direct Named Import (Recommended)**
```javascript
import { GitBranchIcon, PlusCircleIcon } from '@/utils/IconMap';

export function MyComponent() {
  return (
    <>
      <GitBranchIcon className="h-5 w-5 text-blue-600" />
      <PlusCircleIcon className="h-5 w-5 text-green-500" />
    </>
  );
}
```

**Pattern B: Default Export with Size Helper**
```javascript
import IconMap from '@/utils/IconMap';

export function MyComponent() {
  return (
    <>
      {IconMap['git_branch']({ size: 'md', color: 'text-blue-600' })}
      {IconMap['add_circle']({ size: 'lg', color: 'text-green-500' })}
    </>
  );
}
```

**Pattern C: Functional Helper (Dynamic Icons)**
```javascript
import { getIcon } from '@/utils/IconMap';

export function IconByName({ name, size, color }) {
  return getIcon(name, { size, className: color });
}
```

### 7.3 Size Customization Example

```javascript
import { GitBranchIcon } from '@/utils/IconMap';

// Small icon (16px)
<GitBranchIcon className="h-4 w-4 text-blue-600" />

// Medium icon (20px) — default
<GitBranchIcon className="h-5 w-5 text-blue-600" />

// Large icon (24px)
<GitBranchIcon className="h-6 w-6 text-blue-600" />
```

### 7.4 Accessibility Considerations

**ARIA Labels:**
```javascript
import { XMarkIcon } from '@/utils/IconMap';

// For interactive icons (buttons, etc.)
<button aria-label="Close">
  <XMarkIcon className="h-5 w-5" />
</button>

// For decorative icons (already in text context)
<span>
  <CheckCircleIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
  <span>Success</span>
</span>
```

---

## 8. Dependencies & Environment

**Required Installations:**
```bash
cd ui
npm install @heroicons/react
```

**Version:** @heroicons/react@2.x (latest stable)  
**Peer Dependency:** React 16.8+ (already present in wts-report)

**Build System:** Webpack is configured to handle ES modules (no changes needed)

---

## 9. Success Metrics

| Metric | Target | Validation |
|--------|--------|------------|
| Material Symbols instances replaced | 14/14 (100%) | Code search: 0 results for "material-symbols-outlined" |
| CDN requests eliminated | 100% | Network tab analysis |
| Build success rate | 100% | `npm run build` exits with code 0 |
| Console errors | 0 | Browser DevTools console |
| Bundle size impact | Neutral/decrease | Webpack bundle analysis |
| Visual regression | 0 failures | Manual visual testing across components |

---

## 10. Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|-----------------|
| 1 | Setup IconMap utility | 30 min |
| 2 | Refactor templates (AutomaticTab, ManualTab) | 45 min |
| 3 | Refactor organisms (AddedItems, ResultSection, StoredItems) | 1 hour |
| 4 | Enhance DeleteIcon with XMarkIcon | 20 min |
| 5 | Remove CDN + cleanup | 15 min |
| **Total** | | **~3 hours** |

---

## Proposal Summary

This proposal establishes a **low-risk, high-value** integration path for Heroicons:

✅ **Clear Architecture:** Centralized IconMap utility provides single source of truth  
✅ **Phased Approach:** 5 phases allow incremental validation  
✅ **Minimal Changes:** Direct component imports, no complex wrapper layers  
✅ **Tree-Shakeable:** Unused icons not included in bundle  
✅ **Accessible:** Proper ARIA labels and semantic components  
✅ **Maintainable:** Well-documented patterns for future icon additions  

**Next Steps:**
1. Lock this proposal as the specification phase baseline
2. Create detailed specification with component-by-component change list
3. Develop tasks and acceptance test cases
4. Execute phases in order with build validation after each phase

---

**Proposal Status:** ✅ Ready for Specification Phase  
**Ready to lock requirements and proceed to spec?**
