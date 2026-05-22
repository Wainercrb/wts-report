# SDD Init: Heroicons Integration for wts-report

**Project**: wts-report  
**Change**: Integrate Heroicons React icons into wts-report UI  
**Date**: 2026-05-21  
**Status**: Complete  

---

## Project Context Confirmation

### wts-report Overview
**Type**: VS Code extension with React-based UI  
**Purpose**: LLM response checking and WTS (What To Show) report generation  
**Status**: Active development with recent styling refactors

### Tech Stack (Confirmed)

#### Extension (TypeScript)
- **TypeScript**: 5.9.3 (strict mode)
- **Target**: ES2022 / Node16 (ESM)
- **Bundler**: Webpack 5.105.3
- **VSCode API**: 1.110.0+

#### UI (React)
- **Framework**: React 16.8.6
- **Build Tool**: Webpack 5.105.4 + webpack-dev-server
- **Styling**: Tailwind CSS 3.4.7 + PostCSS
- **Icons**: @heroicons/react 2.2.0 **already installed** ✅

### Current Icon System
- **Icon Library**: Material Symbols (via Google Fonts CDN)
- **Instances**: 14 `<span class="material-symbols-outlined">` elements
- **Location**: UI HTML loaded at `ui/src/index.html`

### Testing Capabilities
- **Framework**: Mocha + @vscode/test-cli
- **Status**: ✅ Supported
- **Strict TDD**: Available (prerequisites met)

---

## Change Goal

**Replace Material Symbols with Heroicons React components** for:
- ✅ Better Tailwind CSS integration
- ✅ Removal of external CDN dependency
- ✅ Improved accessibility (SVG + React components)
- ✅ Component-based icon management
- ✅ Type-safe icon usage

---

## Current State

### Material Symbols Usage
- **14 instances** across **5 component files**
- **10 unique icon types** (git_branch, add_circle, check_circle, etc.)
- **CDN dependency**: https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined

### Icons in Use
1. git_branch (2 uses)
2. add_circle (2 uses)
3. check_circle (2 uses)
4. assignment (2 uses, dynamic)
5. meeting (2 uses, dynamic)
6. chevron_left (1 use)
7. chevron_right (1 use)
8. save (1 use)
9. description (1 use)
10. inventory_2 (1 use)

### Custom Elements
- **DeleteIcon atom**: Uses plain ✕ character instead of icon font

---

## Heroicons Package Status

```
installed: @heroicons/react@2.2.0
version: 2.2.0
types: outline (primary), solid (alternative)
icons: 300+
tree-shakeable: YES
license: MIT
```

---

## Deliverable Targets

### Phase 1: Icon Utility Component
- Create `IconMap.js` for consistent sizing
- Document Heroicons imports and sizing conventions
- JSDoc/TypeScript for IDE support

### Phase 2-3: Icon Replacement
- Replace all Material Symbols `<span>` elements with Heroicons components
- Maintain existing color/size styling
- Handle dynamic icon selection (assignment vs. meeting)

### Phase 4: DeleteIcon Enhancement
- Replace ✕ character with XMarkIcon

### Phase 5: CDN Cleanup
- Remove Material Symbols `<link>` from HTML
- Remove `.material-symbols-outlined` CSS
- Verify no regressions

---

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Visual regression (sizing) | LOW | SVG sizing is more predictable; test in dev + prod |
| Missing icon equivalent | VERY LOW | All 10 icons already mapped to Heroicons |
| Accessibility regression | VERY LOW | Heroicons has better a11y defaults than Material Symbols |
| Build size increase | VERY LOW | Tree-shaking ensures only used icons included (~80-100B per icon) |

---

## Prerequisites

- ✅ @heroicons/react installed
- ✅ React 16.8.6 compatible with Heroicons
- ✅ Webpack configured for SVG imports
- ✅ Tailwind CSS available (className support)

---

## Success Criteria

- [ ] All 10 icon types replaced with Heroicons equivalents
- [ ] No visual regressions in dev/prod builds
- [ ] Material Symbols CDN link removed
- [ ] Accessibility maintained or improved
- [ ] Bundle size stable or reduced
- [ ] No TypeScript or linting errors

---

## Notes

- **Opportunity**: This change can also improve the DeleteIcon atom by using XMarkIcon instead of ✕
- **Timeline**: Clean replacement; 5 files affected; low complexity
- **Strategy**: Phased all-in-one approach (faster, cleaner than incremental)
- **Testing**: All changes are visual/component-based; recommend manual testing in extension context
