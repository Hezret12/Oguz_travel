# Oguz Travel — Project Coding Rules (AGENTS.md)

> Comprehensive rules derived from full analysis of the project's hooks, components, and page patterns.

---

## 1. CRUD Hook Signatures — NEVER Guess Parameter Names

### `useCreate` (`src/hooks/CRUD/useCreate.js`)
```js
useCreate({ apiFn, key, onSuccess, invalidateQueries = [], isPaginated = false })
```
| Param | Type | Required | Notes |
|---|---|---|---|
| `apiFn` | function | **YES** | The API function (e.g., `addTranslationApi`). **NOT** `createFn`. |
| `key` | string \| string[] | **YES** | React Query cache key (e.g., `"translations"`). **NOT** `queryKey`. |
| `onSuccess` | function | optional | Called after mutation succeeds and cache is updated. Receives raw Axios response. |
| `invalidateQueries` | string[] | optional | Additional query keys to invalidate. |
| `isPaginated` | boolean | optional | When `true`, invalidates query instead of optimistic prepending (essential for server-paginated tables). |

- **Cache behavior**: When `isPaginated: false`, automatically prepends the created item to the cache (`setQueriesData`). When `isPaginated: true`, invalidates the primary query key to fetch fresh relations and accurate server counts.
- **Success handler**: `onSuccess?.()` is called after cache update. Use it only for UI side effects (close modal, reset form).

### `useUpdate` (`src/hooks/CRUD/useUpdate.js`)
```js
useUpdate({ apiFn, key, idKey, onSuccessUpdate, invalidateQueries = [], isInfiniteQuery = false })
```
| Param | Type | Required | Notes |
|---|---|---|---|
| `apiFn` | function | **YES** | The API function (e.g., `updateTranslationApi`). |
| `key` | string \| string[] | **YES** | React Query cache key. |
| `idKey` | string | **YES** | The unique identifier field name (e.g., `"guid"`). |
| `onSuccessUpdate` | function | optional | Called after mutation succeeds and cache is updated. **NOT** `onSuccess`. |
| `invalidateQueries` | string[] | optional | Additional query keys to invalidate. |
| `isInfiniteQuery` | boolean | optional | Set `true` for infinite scroll queries. |

- **Cache behavior**: Automatically merges (`{ ...oldItem, ...updatedItem }`) matching items by `idKey` using `setQueriesData`. **Do NOT manually call `queryClient.setQueriesData` or `queryClient.invalidateQueries` in `onSuccessUpdate` unless you need to update a DIFFERENT query key.** The hook handles the primary key cache update internally.
- **Success handler name**: `onSuccessUpdate` — NOT `onSuccess`.

### `useDelete` (`src/hooks/CRUD/useDelete.js`)
```js
useDelete({ deleteFn, queryKey, idKey, invalidateQueries = [], isInfiniteQuery = false, isPaginated = false })
```
| Param | Type | Required | Notes |
|---|---|---|---|
| `deleteFn` | function | **YES** | The delete API function. **NOT** `apiFn`. |
| `queryKey` | string \| string[] | **YES** | React Query cache key. **NOT** `key`. |
| `idKey` | string | **YES** | The unique identifier field name (e.g., `"guid"`). |
| `isPaginated` | boolean | optional | When `true`, invalidates query instead of removing from cache. |

- **⚠️ CRITICAL**: `useDelete` uses `deleteFn` and `queryKey` — different param names from `useCreate`/`useUpdate`.
- The `mutate` function receives a `guid` (string or array of strings).

### `useGet` (`src/hooks/CRUD/useGet.js`)
```js
useGet({ apiFn, key, params = {}, options = {} })
```
- Returns `{ data, ...queryResult }` where `data = query?.data?.data?.data ?? []`.

### `usePagginationGet` (`src/hooks/usePagginationGet.js`)
```js
usePagginationGet({ apiFn, key, params })
```
- Returns `{ data, totalItems, pageCount, currentPage, isLoading, isFetching, isError, error, refetch }`.
- Uses `keepPreviousData` for smooth pagination transitions.

---

## 2. Status & Payment Display Components

### `StatusChip` (`src/components/StatusChip.jsx`)
```jsx
<StatusChip status={value} config={CONFIG_OBJECT} size="small" />
```
- Converts `status` to `String(status).toUpperCase()` to find the matching config key.
- If no match found, renders a plain outlined `Chip` with the raw value.
- **ALWAYS** use `StatusChip` + a centralized config from `statusChipConfigs.js` for status columns. **NEVER** write inline `Chip` logic in table cells.

### `statusChipConfigs.js` (`src/functions/statusChipConfigs.js`)
All status config objects live here. Each entry: `{ label, color, icon }`.

Available configs:
- `SALE_STATUS_CONFIG`: `SALE`, `REISSUE`, `REFUND`
- `PAYMENT_STATUS_CONFIG`: `TOLENDI`, `KREDIT`
- `TRANSLATION_STATUS_CONFIG`: `TRUE`, `FALSE`, `"0"`

When adding a new feature's status display:
1. Add a new exported config to this file.
2. Import both `StatusChip` and the config in the page.
3. Use `<StatusChip status={value} config={MY_CONFIG} />` in the `Cell` renderer.

### `PaymentStatusCell` (`src/components/PaymentStatusCell.jsx`)
```jsx
<PaymentStatusCell percent={numericValue} />
```
- Renders a circular SVG ring chart showing payment percentage (0–100).
- Colors: green (100%), orange (1–99%), red (0%).
- Supports dark mode. Theme-aware.
- Use for `is_paid` / payment percentage columns.

---

## 3. Dialog / Modal Components

### `CustomDialog` (`src/components/Dialog/CustomDialog.jsx`)
```jsx
<CustomDialog open={boolean} close={fn} widthX={700}>
  <CustomDialogHeader variant="h5" title="..." />
  <CustomForm onSubmit={handleSubmit(onSubmit)}>
    {/* form fields */}
    <FooterButton loading={isPending} onCancel={closeFn} />
  </CustomForm>
</CustomDialog>
```
- `widthX`: dialog max-width in pixels.
- `close`: callback function. NOT `onClose`.
- Always compose with `CustomDialogHeader`, `CustomForm`, and `FooterButton`.

### `FooterButton` (`src/components/Dialog/FooterButton.jsx`)
```jsx
<FooterButton loading={boolean} onCancel={fn} saveText="..." cancelText="..." />
```
- Renders Cancel + Save buttons with consistent styling.
- `type="submit"` by default.

### `PaymentManagementModal` (`src/components/Dialog/PaymentManagementModal.jsx`)
```jsx
<PaymentManagementModal open={boolean} onClose={fn} row={mrtRow} />
```
- Opened via `ColumnActionButtons` when `showPayment={true}`.
- Auto-detects entity type (translation vs ticket vs B2B) from row data.
- Handles add/edit/delete payments with internal CRUD hooks.

---

## 4. Form Input Components

### `AppAutocomplete` (`src/components/AppAutocomplete.jsx`)
```jsx
<AppAutocomplete
  name="field_name"
  control={control}
  label="Label"
  options={[{ label: "...", value: "..." }]}
  required
/>
```
- Options format: `[{ label: string, value: string }]`
- Uses `react-hook-form` `Controller` internally.
- For employee/operator/translator dropdowns in modals.

### `GlobalClientAutocomplete` (`src/components/global/GlobalClientAutocomplete/GlobalClientAutocomplete.jsx`)
```jsx
<GlobalClientAutocomplete
  name="client_guid"
  control={control}
  columns={["fullName", "phone_number"]}
  required
/>
```
- Server-side search with debounce (400ms).
- `columns` prop controls which fields are displayed and searchable.
- Includes built-in "Add Client" button when no results found.
- Default export name: `GlobalAutoCompleteClient`.

### `CustomTextField` (`src/components/CustomTextField.jsx`)
```jsx
<CustomTextField name="..." control={control} label="..." type="number" required />
```

### `CustomDatePicker` (`src/components/CustomDatePicker.jsx`)
```jsx
<CustomDatePicker name="..." control={control} label="..." required />
```

### `CustomSelect` (`src/components/CustomSelect.jsx`)
```jsx
<CustomSelect name="..." control={control} label="..." options={[...]} required />
```

---

## 5. Table & Page Layout Pattern

### Standard page structure:
```
PageHeader → GlobalSearchInput + FilterDrawer → MaterialReactTable → Pagination
```

### `ColumnActionButtons` (`src/components/ColumnActionButtons.jsx`)
```jsx
<ColumnActionButtons
  row={row}
  table={table}
  onDelete={handleDelete}
  showPayment={true}  // enables payment modal button
/>
```
- Always use in the actions column.
- `showPayment={true}` adds the payment button and renders `PaymentManagementModal` internally.

### `FilterDrawer` (`src/components/FilterDrawer.jsx`)
```jsx
<FilterDrawer
  open={isDrawerOpen}
  onClose={closeDrawer}
  onApply={applyFilters}
  onReset={resetFilters}
>
  <MyPageFilter ... />
</FilterDrawer>
```
- `children`: the page-specific filter content component (e.g., `TranslateFilter`, `B2BFilter`).
- **Each page must have a `Contents/` subfolder with its own filter component.**

### `usePageFilters` Hook (`src/hooks/usePageFilters.js`)
```js
const {
  applied, draft, queryParams, isDrawerOpen,
  openDrawer, closeDrawer, setDraftFilter, setFilter,
  applyFilters, cancelFilters, resetFilters,
  searchQuery, setSearch, page, limit, setPage, setPageSize,
  sortBy, sortOrder, setSort, selectsOpen, openSelect, closeSelect,
} = usePageFilters({ actions: myFilterActions, selectors: myFilterSelectors });
```
- Requires a Redux filter slice with `actions` and `selectors`.
- Returns debounced `queryParams` ready for API calls.

### `GlobalSearchInput` (`src/components/GlobalSearchInput.jsx`)
```jsx
<GlobalSearchInput
  value={searchQuery}
  onChange={setSearch}
  placeholder={t("search")}
  onRefetch={refetch}
  isFetching={isFetching}
/>
```

### `Pagination` (`src/components/Pagination.jsx`)
```jsx
<Pagination
  totalItems={totalItems}
  page={page}
  limit={limit}
  setPage={setPage}
  setPageSize={setPageSize}
/>
```

---

## 6. Localization & Formatting Helpers

- Use `const { t, selectedLang } = useLocale();` for translations.
- `selectedLang(obj)` extracts the correct language field from multilingual objects (e.g., `office.shortName`).
- All user-facing strings must go through clean `t("key")` calls. **NEVER** add redundant inline `|| "Fallback"` default strings when translation keys exist in locale files (`tk.json`, `ru.json`, `en.json`), as `i18next` handles fallbacks automatically.
- **NO DUPLICATE JSON KEYS**: Always merge new translation keys into existing top-level domain namespace objects in `tk.json`, `ru.json`, and `en.json`. **NEVER** declare duplicate object keys (e.g. creating a second `"referralLetter"` block) in locale JSON files.

### `useDateFormat` (`src/functions/generalHelpers.js`)
```js
import { useDateFormat } from "path/to/generalHelpers";
const { formatChange } = useDateFormat();

// For date-only formatting (DD.MM.YYYY):
Cell: ({ cell }) => formatChange(cell.getValue(), { dateOnly: true })

// For date-time formatting (DD.MM.YYYY HH:mm):
Cell: ({ cell }) => formatChange(cell.getValue())
```
- **ALWAYS** use `useDateFormat` (`formatChange`) for formatting table date cells instead of custom inline date string manipulation.
- Remember to include `formatChange` in the `columns` `useMemo` dependency array when used inside column definitions.

---

## 7. Cache Management Rules

1. **useCreate**: Automatically prepends new item to cache. Only add `invalidateQueries` if you need to refresh a DIFFERENT query.
2. **useUpdate**: Automatically merges updated fields into cache by `idKey`. Only add `invalidateQueries` if you need to refresh a DIFFERENT query. **Do NOT call `queryClient.invalidateQueries` inside `onSuccessUpdate` for the same key.**
3. **useDelete**: Automatically removes item from cache by `idKey`. For paginated queries, use `isPaginated: true` (invalidates instead of optimistic removal).

---

## 8. Backend Data Shape Conventions

- Relations come as nested objects: `{ operator: { guid, fullName, office }, client: { guid, fullName }, translator: { guid, fullName } }`.
- When setting form defaults from row data, always check both flat GUID and nested object: `row?.original?.client_guid || row?.original?.client?.guid`.
- Time fields from backend are `"HH:mm:ss"` (8 chars). Slice to `"HH:mm"` (5 chars) for display/form: `.slice(0, 5)`.
- Boolean fields from backend may come as `true`/`false` or strings. Always normalize in the form/payload.

---

## 9. File & Folder Structure

```
src/pages/<Feature>/
├── index.jsx                 # Main page component with table
├── AddXxxModal.jsx           # Create modal (add-only)
├── EditXxxModal.jsx          # Edit modal
└── Contents/
    └── XxxFilter.jsx         # Filter content for FilterDrawer
```

- **Every page that uses `FilterDrawer` MUST have a corresponding filter component in `Contents/`.**
- **Never remove existing imports** when editing a file. Always verify all imports remain intact after edits.

---

## 10. General Rules

- **Never duplicate cache update logic** that hooks already handle internally.
- **Never write ad-hoc status `Chip` components** inline — always use `StatusChip` + centralized config.
- **Always verify hook parameter names** by reading the hook source before using them. The three CRUD hooks have **different** parameter names.
- **Always preserve necessary imports & clean up unused imports**: Remove any unused component, icon, or constant imports after refactoring to keep the codebase clean and warning-free.
- **All form option values must be consistent types** — if the backend expects strings, use string values in `statusOptions` / `paymentOptions`.

---

## 11. MUI Grid Component Prop Usage

- **ALWAYS** use the `size` prop syntax on `<Grid>` items (e.g., `<Grid size={{ xs: 12, sm: 6, lg: 4 }}>`) instead of legacy `item xs={12} sm={6}` props.

---

## 12. MUI Styling & Theme Tokens — NO Hardcoded Dark/Light Ternary Colors

- **ALWAYS** use MUI Semantic Palette Tokens (`text.primary`, `text.secondary`, `background.paper`, `background.default`, `divider`, `action.hover`) instead of writing inline `isDark ? "#..." : "#..."` ternary color checks.
- Only use custom hex colors if a component specifies an explicit non-standard accent/brand color (e.g., priority chips `#DC2626`, custom status dots).
- **Rationale**: Eliminates Emotion CSS-in-JS class generation overhead on re-renders, guarantees dark/light theme consistency across the app, and prevents design system breakages.

---

## 13. React Hook Form Field Watching — ALWAYS Use `useWatch`

- **ALWAYS** use the dedicated `useWatch` hook from `react-hook-form` (e.g., `const [startNo, endNo] = useWatch({ control, name: ["startNo", "endNo"] });`) when watching form values for dynamic calculations, conditional inputs, or side effects.
- **NEVER** call `const val = watch("field")` directly from `useForm()`.
- **Rationale**: Direct `useForm.watch()` forces full component re-renders on every single keystroke of watched fields. Using `useWatch` isolates field subscriptions, preventing unnecessary component re-renders and improving form input performance.


## 14. MaterialReactTable Create & Edit Dialog Rendering Standard

- **ALWAYS** use `renderCreateRowDialogContent` and `renderEditRowDialogContent` properties when configuring MaterialReactTable instances:
  ```jsx
  renderCreateRowDialogContent: ({ table }) => <AddXxxModal table={table} />,
  renderEditRowDialogContent: ({ table, row }) => <EditXxxModal table={table} row={row} />,
  ```
- **Triggering Create Modal**: Trigger creation via `table.setCreatingRow(true)`.
- **Triggering Edit Modal**: Trigger edit via `table.setEditingRow(row)` (handled internally by `ColumnActionButtons`).
- **Modal Component State Pattern**:
  ```jsx
  const isModalOpen = open !== undefined ? Boolean(open) : Boolean(table && (table.getState().creatingRow || table.getState().editingRow?.id === row?.id));
  const handleClose = () => {
    if (table) {
      table.setCreatingRow(null);
      table.setEditingRow(null);
    }
    close?.();
  };
  ```
- **Rationale**: Guarantees clean declarative dialog lifecycle management natively tied to MaterialReactTable instance states across all page modules.


---

## 15. React 19 State Synchronization & Effect Cascading Prevention — NEVER Call `setState` Synchronously Inside `useEffect`

- **NEVER** call `setState()` directly/synchronously inside a `useEffect` body to synchronize state derived from props or parent modal state (e.g., initializing local state when `task` prop changes).
- **React 19 Anti-Pattern (Cascading Re-render Warning/Error)**:
  ```jsx
  // ❌ BAD: Triggers React 19 cascading re-render warning/error
  useEffect(() => {
    if (task && open) {
      setAttachments(task.images || []);
      reset(...);
    }
  }, [task, open]);
  ```
- **React 19 Official Pattern (In-Render State Adjustment)**:
  ```jsx
  // ✅ GOOD: Adjust state synchronously during render when key/props change
  const [prevTaskKey, setPrevTaskKey] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const currentTaskKey = open && task ? task.guid : null;
  if (currentTaskKey !== prevTaskKey) {
    setPrevTaskKey(currentTaskKey);
    setAttachments(task?.images || task?.attachments || []);
  }

  useEffect(() => {
    if (task && open) {
      reset({ title: task.title, ... });
    }
  }, [task, open, reset]);
  ```
- **Rationale**: Direct `setState` calls inside `useEffect` force extra cascading re-render passes, harming UI performance and triggering React 19 strict compiler errors (*"Calling setState synchronously within an effect can trigger cascading renders"*). Adjusting state during render allows React to immediately retry rendering with updated state in a single execution pass.

---

## 16. Multilingual Form Labels Formatting Standard

- **ALWAYS** format multilingual form labels using a comma followed by capitalized language tag: `, Tk`, `, Ru`, `, En`.
- **NEVER** use parentheses like `(TK)`, `(RU)`, `(EN)`.
- **Examples**:
  - `Doly ady, Tk` (NOT `Doly ady (TK)`)
  - `Doly ady, Ru` (NOT `Doly ady (RU)`)
  - `Doly ady, En` (NOT `Doly ady (EN)`)
  - `Gysga ady, Tk` (NOT `Gysga ady (TK)`)
  - `Bölüm ady, Tk` (NOT `Bölüm ady (TK)`)
- **Rationale**: Ensures a clean, modern, and unified typographical style across all forms, modals, and locale translation files.


