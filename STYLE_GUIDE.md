# Neocomerz Admin Dashboard Style Guide

This style guide establishes consistency for **Typography, Colors, Spacing, Buttons, Form Inputs, Tables, and Modals** in the Products Catalog and all related modules of the Neocomerz Admin Dashboard.

---

## 1. Typography & Font Families

The dashboard utilizes custom typography definitions configured via CSS custom properties in [globals.css](file:///Users/almumeetusaikat/Documents/Neocomer-Admin/neocomerz-store-and-admin/app/globals.css).

### Font Families
- **Primary Font (Sans-Serif)**: `Gotham` (fallback: `Arial, Helvetica, sans-serif`)
  - CSS Variable: `var(--font-gotham)`
  - Tailwind Token: `font-gotham`
  - Usage: Applied by default to `body` and used for all admin interfaces.
- **Secondary Font (Serif)**: `Bembo Std` (fallback: `Georgia, serif`)
  - CSS Variable: `var(--font-bembo)`
  - Tailwind Token: `font-bembo`
  - Usage: Reserved for specialized headings or branded text.

### Font Weight Override (Critical Rule)
The admin panel implements a global font weight reset in `globals.css`:
```css
.admin-dashboard .font-black,
.admin-dashboard .font-extrabold,
.admin-dashboard .font-bold,
.admin-dashboard th,
.admin-dashboard h1,
.admin-dashboard h2,
.admin-dashboard h3,
.admin-dashboard button,
.admin-dashboard select,
.admin-dashboard input,
.admin-dashboard label {
  font-weight: 500 !important;
}
```
> [!IMPORTANT]
> Because of this rule, bold styles (`font-bold`, `font-extrabold`, `font-black`) inside the admin panel render at **medium weight (500)**.
> - Avoid writing `font-black` or `font-extrabold` in your classes, as it is confusing and overridden.
> - Standardize on using `font-semibold` or `font-medium` to keep the code clean and semantic.

### Font Sizes & Hierarchy
Maintain the following standard sizing for catalog pages:

| Element | Tailwind Class | Size (px) | Application |
| :--- | :--- | :--- | :--- |
| **Page Title** | `text-2xl` | 24px | Primary heading in `PageHeader` |
| **Section Headings** | `text-lg` or `text-[18px]` | 18px | Titles for Drawers and Modals |
| **Subheadings** | `text-base` or `text-sm` | 14px–16px | Table headings, card subheaders, form section titles |
| **Body / Content** | `text-sm` | 14px | Table cell contents, list items, description texts |
| **Labels & Fields** | `text-sm` | 14px | Input labels and selectors |
| **Small / Metadata** | `text-xs` | 12px | Badge text, helper descriptions, inventory logs metadata |
| **Micro Labels** | `text-[11px]` | 11px | Serial indices, tiny counts, status badges |

---

## 2. Color System

To keep the UI professional and aligned with the brand, adhere to these precise color tokens:

### Brand Colors (NeoComerz Identity)
- **Primary Brand Red**: `rgba(228, 0, 43, 1)` (`var(--brand-primary)`)
  - Usage: Top-level branding, active menus, logo.
- **Brand Accent 2 (Beige)**: `rgba(197, 185, 172, 1)` (`var(--brand-color-2)`)
- **Brand Accent 3 (Gold)**: `rgba(185, 151, 91, 1)` (`var(--brand-color-3)`)
- **Brand Accent 4 (Dark Brown)**: `rgba(71, 55, 41, 1)` (`var(--brand-color-4)`)
- **Brand Accent 5 (Dark Forest Green)**: `rgba(33, 39, 33, 1)` (`var(--brand-color-5)`)

### Neutral Shades (Slate System)
- **Dashboard Background**: `#fbfbfc` (light slate/off-white)
- **Card/Table Background**: `#ffffff` (`bg-white`)
- **Table Headers**: `bg-slate-50` (or `bg-slate-50/70` for alternating rows)
- **Primary Text**: `text-slate-800` or `text-slate-900`
- **Secondary Text**: `text-slate-600` or `text-slate-700`
- **Muted/Placeholder Text**: `text-slate-400` or `text-slate-500`
- **Borders & Dividers**: `border-slate-200` (soft divider), `border-slate-300` (input fields)

### Functional/Action Colors
- **Primary Accent/Interactive**: Blue system (`bg-blue-600` / `hover:bg-blue-700`)
  - Usage: Buttons, primary checkboxes, selection focus state, link hover colors (`hover:text-blue-600`).
- **Success / In-Stock**: Emerald system (`bg-emerald-600` / `text-emerald-700` / `bg-emerald-50`)
  - Usage: Positive logs (additions), active status toggles, active statuses.
- **Danger / Deletions**: Red/Rose system (`bg-rose-50 text-rose-700`, or `text-red-600 hover:text-red-700`)
  - Usage: Outgoing inventory, delete buttons, error alerts.
- **Secondary Actions (Duplicate/Special)**: Violet system (`bg-violet-50 text-violet-600 hover:bg-violet-100`)

---

## 3. Standard Buttons & Interactive Controls

### Primary Action Button (e.g., "Add Product", "Apply Filters")
```tsx
<button className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 shrink-0">
  <AdminIcon className="h-5 w-5" name="plus" />
  Add Product
</button>
```

### Secondary/Cancel Button
```tsx
<button className="h-11 rounded-lg border-2 border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
  Cancel
</button>
```

### Icon Search / Filter Actions
```tsx
<button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm">
  <AdminIcon className="h-5 w-5 text-slate-600" name="search" />
</button>
```

### Table Row / Small Inline Actions
- **Standard Link/Row Edit**:
  ```tsx
  <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
    Adjust
  </button>
  ```
- **Dangerous Action (Delete)**:
  ```tsx
  <button className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors">
    <AdminIcon className="h-4 w-4" name="trash" />
  </button>
  ```

---

## 4. Forms & Input Fields

Form elements should maintain matching heights and padding to line up perfectly on search panels and forms.

### Text Inputs (Default Form Fields)
- **Standard Text Input**:
  ```tsx
  <input
    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white"
    placeholder="Enter value..."
  />
  ```
- **Filter Bar Text Input**:
  ```tsx
  <input
    className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
    placeholder="Search..."
  />
  ```

### Dropdown Selectors
- **Select dropdown**:
  ```tsx
  <select className="h-11 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all">
    <option value="">Choose option</option>
  </select>
  ```

### Labels
- Labels should always sit above inputs with consistent margins:
  ```tsx
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">Category</span>
    <select ... />
  </label>
  ```

---

## 5. Table Layout & Details Section

Table UI is the core of the products catalog. Spacing and transitions must look clean.

### Table Container Structure
- Wrap tables in a structured container with light shadows and borders:
  ```tsx
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <table className="w-full text-left">
      {/* Table contents */}
    </table>
  </div>
  ```

### Header Row (`thead`)
- Always use `bg-slate-50` with a subtle bottom border:
  ```tsx
  <thead className="bg-slate-50 border-b border-slate-200">
    <tr>
      <th className="px-4 py-4 text-sm font-semibold text-slate-700">Product</th>
      {/* ... */}
    </tr>
  </thead>
  ```

### Body Rows (`tbody`)
- Apply smooth hover transitions on rows:
  ```tsx
  <tr className="hover:bg-blue-50/30 transition-all duration-200">
    <td className="px-4 py-4 text-sm text-slate-600">Row Content</td>
  </tr>
  ```

### Expandable Details Row
When a product catalog row is expanded (e.g., viewing variant specs or logs):
- Use a gradient background for the container: `bg-gradient-to-b from-blue-50/30 to-slate-50/30`
- Keep details aligned by using a clean submenu nav (tabs):
  - Active Tab: `pb-3.5 text-sm font-semibold text-blue-600 border-b-2 border-blue-600`
  - Inactive Tab: `pb-3.5 text-sm font-semibold text-slate-500 hover:text-slate-700`

---

## 6. Modals & Slide-over Drawers

Both overlays must feature a backdrop blur to keep the background dashboard recognizable but subdued.

### Slide-over Filters Drawer
- Backdrop: `bg-slate-950/60 backdrop-blur-sm` (Z-index: `z-50`)
- Drawer container: `relative ml-auto h-full w-full max-w-md bg-white shadow-2xl`
- Header: `border-b border-slate-200 px-6 py-5 bg-gradient-to-r from-slate-50 to-white`
- Action bar: `border-t border-slate-200 px-6 py-5 flex items-center gap-3 bg-slate-50`

### Overlay Dialogs (Modals)
- Backdrop: `bg-slate-950/50 px-4 py-6 z-50 grid place-items-center modal-backdrop`
- Modal body: Enable custom thin scrollbars for long content:
  ```css
  .modal-body {
    scroll-behavior: smooth;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }
  ```

---

## 7. Consistency Best Practices

1. **Avoid Hardcoded Styles**: Do not use custom pixel classes like `text-[14px]` unless aligning with an existing legacy property. Use standard spacing scales (`space-y-4`, `mb-6`, `p-6`).
2. **Reuse Components**: Use the prebuilt header (`PageHeader`), status toggle (`StatusToggle`), and thumbnail (`ProductThumb`) components from `_components/admin-shell` instead of reconstructing them manually.
3. **Typography Reset**: Maintain the clean `font-weight: 500 !important` reset by using tags that fall under the reset selector (like `h3`, `button`, `input`) instead of custom styled paragraph tags for header components.
