# Accessibility

## WCAG Compliance

- Target **WCAG 2.1 Level AA** as minimum standard
- Aim for **Level AAA** where feasible
- Document any intentional deviations with justification
- Regular accessibility audits during development

## HTML Semantics

### Semantic Elements

- Use semantic HTML elements (`<main>`, `<nav>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<aside>`)
- Prefer semantic elements over generic `<div>` when appropriate
- Use `<button>` for interactive actions, not styled `<div>` or `<span>`
- Use `<a>` for navigation links, not clickable divs

### Heading Hierarchy

- Use proper heading hierarchy (h1 → h2 → h3 → h4)
- Only one `<h1>` per page (typically page title)
- Don't skip heading levels (e.g., h1 → h3)
- Use headings to structure content, not for styling
- Example structure:
  ```typescript
  <h1>Goals Dashboard</h1>
    <h2>Active Goals</h2>
      <h3>Quantitative Goals</h3>
    <h2>Completed Goals</h2>
  ```

### Landmarks

- Use ARIA landmarks: `<nav>`, `<main>`, `<aside>`, `<footer>`, `<header>`
- Add `role="banner"` to site header if not using `<header>`
- Add `role="contentinfo"` to site footer if not using `<footer>`
- Use `role="search"` for search regions

### Lists

- Use proper list elements (`<ul>`, `<ol>`, `<dl>`) for list content
- Don't use lists for layout purposes
- Use `<dl>` (description list) for key-value pairs (e.g., goal metadata)

## Form Accessibility

### Labels

- **Always** associate labels with form inputs using `htmlFor` and `id`
- Use Ant Design's `Form.Item` with `label` prop (automatically handles this)
- For custom inputs, use explicit `<label>` elements
- Provide visible labels, not just placeholder text
- Use `aria-label` or `aria-labelledby` only when visible label isn't possible

### Required Fields

- Indicate required fields visually (asterisk) and programmatically
- Use `aria-required="true"` for required fields
- Ant Design Form handles this automatically with `required` validation rule

### Error Messages

- Associate error messages with inputs using `aria-describedby`
- Use `aria-invalid="true"` when field has errors
- Ant Design Form automatically handles this
- For custom error messages:
  ```typescript
  <Input
    id="goal-title"
    aria-invalid={hasError}
    aria-describedby={hasError ? "goal-title-error" : undefined}
  />
  {hasError && (
    <div id="goal-title-error" role="alert">
      Title is required
    </div>
  )}
  ```

### Fieldset and Legend

- Use `<fieldset>` and `<legend>` for grouped form fields
- Useful for goal type selection, date ranges, etc.
- Ant Design's `Form.Item` with multiple children can use fieldset

### Form Validation

- Validate on blur, not just on submit
- Provide clear, specific error messages
- Use `role="alert"` for error messages (Ant Design does this automatically)
- Don't rely solely on color to indicate errors (use icons, text, borders)

## ARIA

### When to Use ARIA

- **Don't use ARIA if native HTML works** (e.g., use `<button>` not `<div role="button">`)
- Use ARIA to enhance, not replace, semantic HTML
- Use ARIA when building custom components that don't have native equivalents

### ARIA Labels

- Use `aria-label` for icon-only buttons and controls
- Use `aria-labelledby` to reference visible text labels
- Use `aria-describedby` for additional descriptive text
- Example:
  ```typescript
  <Button
    icon={<DeleteOutlined />}
    aria-label="Delete goal"
    onClick={handleDelete}
  />
  ```

### ARIA Roles

- Use semantic HTML instead of ARIA roles when possible
- Common roles: `role="alert"`, `role="status"`, `role="dialog"`, `role="tablist"`
- Ant Design components include appropriate roles

### ARIA Live Regions

- Use `aria-live="polite"` for non-critical updates (progress updates, success messages)
- Use `aria-live="assertive"` for critical alerts (errors, warnings)
- Use `role="status"` for status updates
- Use `role="alert"` for error messages
- Example:
  ```typescript
  <div role="status" aria-live="polite" aria-atomic="true">
    {successMessage && <Alert message={successMessage} type="success" />}
  </div>
  ```

### ARIA States and Properties

- Use `aria-expanded` for collapsible content (accordions, dropdowns)
- Use `aria-selected` for selected items (tabs, list items)
- Use `aria-checked` for checkboxes and radio buttons
- Use `aria-disabled` for disabled controls
- Ant Design components handle these automatically

### ARIA for Dynamic Content

- Update `aria-busy="true"` during async operations
- Use `aria-live` regions for dynamic content updates
- Announce goal completion, progress updates, etc. via live regions

## Keyboard Navigation

### Tab Order

- Ensure logical tab order (top to bottom, left to right)
- Use `tabIndex={0}` for focusable elements (default for interactive elements)
- Use `tabIndex={-1}` to remove from tab order but allow programmatic focus
- Never use `tabIndex > 0` (creates confusing tab order)

### Focus Management

- **Return focus** to trigger element after closing modals/dialogs
- **Trap focus** within modals (Ant Design Modal does this automatically)
- **Move focus** to new content when appropriate (e.g., after form submission)
- Use `useRef` and `element.focus()` for programmatic focus management
- Example:

  ```typescript
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);
  ```

### Focus Indicators

- Provide visible focus indicators (outline, border, background change)
- Don't remove `outline` without providing alternative
- Ant Design components include focus styles
- Ensure focus indicators meet contrast requirements (3:1 minimum)
- Custom focus styles:
  ```css
  .custom-button:focus-visible {
    outline: 2px solid #1890ff;
    outline-offset: 2px;
  }
  ```

### Keyboard Shortcuts

- Document keyboard shortcuts in help/accessibility documentation
- Use standard shortcuts where applicable (Ctrl+S for save, Esc for close)
- Provide alternative methods for all keyboard shortcuts
- Use `aria-keyshortcuts` to announce shortcuts to screen readers

### Keyboard Event Handling

- Handle `Enter` key for form submission
- Handle `Escape` key for closing modals/dialogs
- Handle `Arrow` keys for navigation in lists, menus, tabs
- Prevent default behavior only when necessary
- Example:
  ```typescript
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      onSubmit();
    }
  };
  ```

## Visual Accessibility

### Color Contrast

- **Text contrast**: Minimum 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold)
- **UI components**: Minimum 3:1 for interactive elements (buttons, form controls)
- **Graphics**: Minimum 3:1 for non-text content (icons, charts)
- Use tools: WebAIM Contrast Checker, axe DevTools
- Ant Design theme colors meet WCAG AA standards by default

### Color Independence

- **Never rely solely on color** to convey information
- Use icons, text, patterns, or shapes in addition to color
- Examples:
  - Status: Use icon + color (✓ green, ✗ red)
  - Progress: Use progress bar + percentage text
  - Errors: Use error icon + red color + error message

### Text Alternatives

- Provide `alt` text for images (descriptive, not "image of...")
- Use `aria-label` for icon-only buttons
- Provide text alternatives for charts and graphs
- Use `aria-label` or `aria-labelledby` for decorative images (or `alt=""`)

### High Contrast Mode

- Test in Windows High Contrast Mode and macOS Increase Contrast
- Ensure UI remains functional and readable
- Don't rely solely on background colors (use borders, icons)

### Touch Targets

- Minimum **44x44px** touch target size (iOS/Android guidelines)
- Minimum **24x24px** for dense interfaces (WCAG)
- Provide adequate spacing between touch targets
- Ant Design components meet these requirements

### Responsive Text

- Support text scaling up to 200% without horizontal scrolling
- Use relative units (rem, em, %) instead of fixed pixels for text
- Test with browser zoom at 200%

## Ant Design Accessibility

### Built-in Features

- Ant Design components include ARIA attributes by default
- Form components handle labels, errors, and validation accessibility
- Modal components include focus trapping
- Table components support keyboard navigation
- Menu components include proper ARIA roles

### Component-Specific Notes

#### Form

- `Form.Item` automatically associates labels with inputs
- Error messages are announced to screen readers
- Required fields are indicated programmatically

#### Table

- Use `rowKey` prop for proper row identification
- Provide `aria-label` for action buttons in table rows
- Consider `aria-rowcount` and `aria-rowindex` for large tables
- Ensure sortable columns are keyboard accessible

#### Modal/Drawer

- Focus is automatically trapped within modal
- Focus returns to trigger on close
- Use `title` prop for accessible modal titles
- Close button is keyboard accessible

#### Menu

- Keyboard navigation (Arrow keys) works automatically
- Use `aria-label` for icon-only menu items
- Ensure menu items have accessible names

#### Select/Dropdown

- Keyboard navigation works automatically
- Use `aria-label` for custom select components
- Ensure options are announced to screen readers

#### DatePicker

- Keyboard navigation works automatically
- Use `aria-label` for custom date pickers
- Ensure date format is clear

### Custom Components

- When extending Ant Design components, maintain accessibility
- Test custom components with screen readers
- Follow Ant Design's accessibility patterns
- Document any accessibility considerations

## React-Specific Accessibility

### Conditional Rendering

- Use `aria-hidden="true"` for decorative content that shouldn't be announced
- Ensure important content isn't hidden from screen readers
- Example:
  ```typescript
  <div aria-hidden="true">
    {/* Decorative icon */}
  </div>
  <span className="sr-only">
    {/* Screen reader only text */}
  </span>
  ```

### Dynamic Content Updates

- Announce important updates via `aria-live` regions
- Use `role="status"` for non-critical updates
- Use `role="alert"` for critical updates
- Example:
  ```typescript
  {goalCompleted && (
    <div role="alert" aria-live="assertive">
      Goal "{goal.title}" has been completed!
    </div>
  )}
  ```

### Loading States

- Announce loading states to screen readers
- Use `aria-busy="true"` during async operations
- Provide loading text, not just spinners
- Example:
  ```typescript
  <div aria-busy={isLoading} aria-live="polite">
    {isLoading ? 'Loading goals...' : <GoalList goals={goals} />}
  </div>
  ```

### Error Boundaries

- Ensure error boundaries are accessible
- Provide clear error messages
- Include recovery options
- Make error messages keyboard accessible

## Testing Accessibility

### Automated Testing

- Use **axe DevTools** browser extension
- Use **WAVE** browser extension
- Run **Lighthouse** accessibility audit
- Integrate **@axe-core/react** in development
- Use **eslint-plugin-jsx-a11y** for linting

### Manual Testing

- **Keyboard-only navigation**: Test entire app with keyboard only
- **Screen reader testing**: Test with NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS)
- **Zoom testing**: Test at 200% browser zoom
- **High contrast mode**: Test in Windows High Contrast Mode
- **Color blindness**: Use tools like Color Oracle to simulate color blindness

### Testing Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] All images have alt text
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Color isn't the only way to convey information
- [ ] Text meets contrast requirements
- [ ] Page has logical heading hierarchy
- [ ] ARIA attributes are used correctly
- [ ] Dynamic content updates are announced
- [ ] Modals trap focus and return focus on close
- [ ] Touch targets are adequate size

### Screen Reader Testing

- Test with **NVDA** (Windows, free)
- Test with **JAWS** (Windows, paid)
- Test with **VoiceOver** (macOS/iOS, built-in)
- Test with **TalkBack** (Android, built-in)
- Navigate through entire user flows
- Verify all content is announced correctly
- Verify interactive elements are accessible

## Common Patterns for Goals Tracking

### Goal Cards

- Use semantic structure: `<article>` for each goal card
- Provide accessible goal title as heading
- Use `aria-label` for action buttons (edit, delete, complete)
- Announce progress updates via `aria-live`
- Example:
  ```typescript
  <article>
    <h3>{goal.title}</h3>
    <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      {progress}% complete
    </div>
    <Button aria-label={`Edit ${goal.title}`}>Edit</Button>
  </article>
  ```

### Progress Indicators

- Use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Provide text alternative showing percentage
- Announce significant progress changes
- Example:
  ```typescript
  <Progress
    percent={progress}
    aria-label={`Progress: ${progress}% complete`}
  />
  ```

### Goal Lists/Tables

- Use proper table markup with `<thead>`, `<tbody>`
- Provide `aria-label` for action buttons in rows
- Ensure sortable columns are keyboard accessible
- Use `aria-sort` for sorted columns

### Filters and Search

- Label search inputs clearly
- Announce filter changes to screen readers
- Provide clear filter removal options
- Use `aria-label` for filter toggles

### Notifications/Alerts

- Use `role="alert"` for important notifications
- Use `role="status"` for informational messages
- Ensure notifications are keyboard dismissible
- Don't rely on auto-dismiss for critical alerts

## Resources

### Tools

- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools accessibility audit
- **Color Contrast Analyzer**: Check color contrast ratios
- **WebAIM Contrast Checker**: Online contrast checker

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Ant Design Accessibility](https://ant.design/docs/react/accessibility)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

### Screen Readers

- **NVDA**: Free screen reader for Windows
- **JAWS**: Popular screen reader for Windows
- **VoiceOver**: Built-in screen reader for macOS/iOS
- **TalkBack**: Built-in screen reader for Android
