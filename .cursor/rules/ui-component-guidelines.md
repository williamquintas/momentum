# UI Component Guidelines

## Component-Specific Guidelines

### Form Components
- Use Ant Design Form with proper validation
- Use Ant Design Form validation rules
- Implement proper form layout
- Use Form.Item for field grouping
- Show validation errors clearly
- Use Form.List for dynamic fields
- Implement optimistic updates where appropriate
- Show loading states during submission
- Provide clear error messages
- Handle form reset and cleanup
- Use Form.useWatch for dependent field updates
- Implement field-level validation with custom validators
- Use Form.Item dependencies for conditional fields
- Handle async validation (e.g., checking if goal title exists)
- Use Form.Item normalize for data transformation
- Example:
  ```typescript
  <Form.Item
    name="title"
    rules={[
      { required: true, message: 'Title is required' },
      { max: 200, message: 'Title must be 200 characters or less' },
      { validator: async (_, value) => {
        if (value && await checkTitleExists(value)) {
          throw new Error('Title already exists');
        }
      }}
    ]}
  >
    <Input placeholder="Enter goal title" />
  </Form.Item>
  ```

### Table Components
- Use Ant Design Table with proper typing
- Implement sorting, filtering, and pagination
- Use virtual scrolling for large datasets (Table.virtual)
- Include row selection for bulk operations
- Make columns responsive
- Use proper key props for rows
- Use rowClassName for conditional styling
- Implement expandable rows for nested data
- Use onRow for row-level event handlers
- Handle empty states with Empty component
- Use Skeleton for loading states
- Example:
  ```typescript
  <Table
    columns={columns}
    dataSource={goals}
    rowKey="id"
    pagination={{ pageSize: 20, showSizeChanger: true }}
    rowSelection={{ type: 'checkbox' }}
    expandable={{ expandedRowRender }}
    loading={isLoading}
  />
  ```

### Progress Components
- Use Ant Design Progress component
- Calculate progress percentage accurately
- Show appropriate progress type (line, circle, dashboard)
- Display current vs target values clearly
- Handle edge cases (negative progress, over 100%)
- Show unit of measurement when applicable
- Use role="progressbar" with ARIA attributes for accessibility
- Display percentage text alongside visual indicator
- Use color coding for progress ranges (low/medium/high)
- Example:
  ```typescript
  <Progress
    percent={Math.min(100, Math.max(0, progress))}
    status={progress >= 100 ? 'success' : progress < 50 ? 'exception' : 'active'}
    format={(percent) => `${percent}% (${current}/${target})`}
  />
  ```

### Card Components
- Use Ant Design Card for goal displays
- Include action buttons in Card actions
- Show relevant metadata (tags, status, priority)
- Make cards clickable to navigate to detail view
- Use Card.Grid for grid layouts
- Include loading states for card content
- Use Card.Meta for structured metadata
- Implement hover effects for better UX
- Use Skeleton for loading states
- Handle empty card states gracefully
- Example:
  ```typescript
  <Card
    hoverable
    actions={[<EditOutlined />, <DeleteOutlined />]}
    cover={<img src={goalImage} alt={goal.title} />}
  >
    <Card.Meta
      title={goal.title}
      description={goal.description}
    />
  </Card>
  ```

### Navigation Components
- Use Ant Design Menu for navigation
- Implement breadcrumbs for deep navigation
- Use Tabs for different view modes
- Include back navigation where appropriate
- Maintain navigation state in URL when possible
- Use Menu.Item with icons for better visual hierarchy
- Implement active state highlighting
- Use Menu.SubMenu for nested navigation
- Example:
  ```typescript
  <Menu mode="horizontal" selectedKeys={[currentPath]}>
    <Menu.Item key="/goals" icon={<AimOutlined />}>
      Goals
    </Menu.Item>
    <Menu.Item key="/dashboard" icon={<DashboardOutlined />}>
      Dashboard
    </Menu.Item>
  </Menu>
  ```

### Modal and Dialog Components
- Use Ant Design Modal for confirmations and forms
- Use Drawer for side panels (better on mobile)
- Trap focus within modal (Ant Design handles this)
- Return focus to trigger element on close
- Use Modal.confirm for simple confirmations
- Use Popconfirm for inline confirmations
- Handle escape key to close
- Show loading state during async operations
- Use destroyOnClose for forms to reset state
- Example:
  ```typescript
  <Modal
    title="Delete Goal"
    open={isOpen}
    onOk={handleDelete}
    onCancel={handleCancel}
    confirmLoading={isDeleting}
    destroyOnClose
  >
    <p>Are you sure you want to delete this goal?</p>
  </Modal>
  ```

### Dropdown and Select Components
- Use Select for single/multiple choice selections
- Use Dropdown for action menus
- Implement search/filtering in Select
- Use Select with mode="tags" for tag input
- Show loading state during async options loading
- Use virtual scrolling for large option lists
- Provide clear placeholder text
- Handle empty states
- Example:
  ```typescript
  <Select
    mode="multiple"
    placeholder="Select categories"
    options={categoryOptions}
    loading={isLoading}
    showSearch
    filterOption={(input, option) =>
      option?.label?.toLowerCase().includes(input.toLowerCase())
    }
  />
  ```

### Date and Time Pickers
- Use DatePicker for date selection
- Use RangePicker for date ranges
- Use TimePicker for time selection
- Handle timezone conversions correctly
- Validate date ranges (e.g., deadline after start date)
- Show clear date format hints
- Disable invalid dates (e.g., past dates when not allowed)
- Use showTime for datetime selection
- Example:
  ```typescript
  <DatePicker
    disabledDate={(current) => current && current < dayjs().startOf('day')}
    showTime
    format="YYYY-MM-DD HH:mm"
    placeholder="Select deadline"
  />
  ```

### Notification and Alert Components
- Use Message for brief notifications (auto-dismiss)
- Use Notification for detailed notifications
- Use Alert for persistent important messages
- Use appropriate types: success, error, warning, info
- Position notifications consistently
- Don't overuse notifications (avoid notification fatigue)
- Use duration prop to control auto-dismiss timing
- Example:
  ```typescript
  message.success('Goal created successfully');
  notification.error({
    message: 'Error',
    description: 'Failed to save goal. Please try again.',
    duration: 0, // Don't auto-dismiss errors
  });
  ```

### Tooltip and Popover Components
- Use Tooltip for brief hover information
- Use Popover for rich content on hover/click
- Keep tooltip text concise
- Position tooltips to avoid viewport edges
- Use trigger prop to control interaction (hover, click, focus)
- Don't use tooltips for critical information (use visible text)
- Example:
  ```typescript
  <Tooltip title="This goal is due in 3 days">
    <Badge count={3} />
  </Tooltip>
  ```

### Empty States
- Use Ant Design Empty component
- Provide helpful messaging and actions
- Show illustrations or icons
- Include call-to-action buttons
- Customize based on context (no goals, no search results, etc.)
- Example:
  ```typescript
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="No goals found"
  >
    <Button type="primary" onClick={handleCreateGoal}>
      Create Your First Goal
    </Button>
  </Empty>
  ```

### Loading States
- Use Spin for inline loading
- Use Skeleton for content placeholders
- Use Table loading prop for table loading states
- Show loading state during async operations
- Provide loading text for screen readers
- Use aria-busy for accessibility
- Example:
  ```typescript
  {isLoading ? (
    <Skeleton active paragraph={{ rows: 4 }} />
  ) : (
    <GoalList goals={goals} />
  )}
  ```

### Error States
- Display clear error messages
- Use Alert component for error display
- Provide recovery actions (retry, go back, contact support)
- Log errors for debugging
- Use Result component for error pages
- Example:
  ```typescript
  <Result
    status="error"
    title="Failed to Load Goals"
    subTitle="Please try again or contact support if the problem persists."
    extra={[
      <Button type="primary" onClick={handleRetry}>
        Retry
      </Button>,
      <Button onClick={handleGoBack}>Go Back</Button>
    ]}
  />
  ```

### Timeline Components
- Use Timeline for progress history
- Use Steps for milestone progression
- Show chronological order clearly
- Include timestamps
- Use color coding for status (pending, in-progress, completed)
- Handle long timelines with pagination or virtualization
- Example:
  ```typescript
  <Timeline>
    {progressHistory.map((entry) => (
      <Timeline.Item
        key={entry.id}
        color={entry.status === 'completed' ? 'green' : 'blue'}
      >
        <p>{entry.date}</p>
        <p>{entry.value}</p>
      </Timeline.Item>
    ))}
  </Timeline>
  ```

### Calendar Components
- Use Calendar for date-based views
- Use DatePicker.Calendar for custom calendar views
- Highlight important dates (deadlines, milestones)
- Show goal markers on calendar
- Handle month/year navigation
- Support different view modes (month, week, day)
- Example:
  ```typescript
  <Calendar
    dateCellRender={(date) => {
      const goalsOnDate = getGoalsForDate(date);
      return goalsOnDate.map(goal => (
        <div key={goal.id}>{goal.title}</div>
      ));
    }}
  />
  ```

### Tag and Badge Components
- Use Tag for categories, status, priority
- Use Badge for counts and notifications
- Use color coding consistently (green=success, red=error, etc.)
- Make tags clickable for filtering when appropriate
- Use closable tags for removable items
- Example:
  ```typescript
  <Space>
    <Tag color="blue">{goal.category}</Tag>
    <Tag color={goal.status === 'active' ? 'green' : 'default'}>
      {goal.status}
    </Tag>
    <Badge count={overdueCount} showZero>
      <Button>Overdue Goals</Button>
    </Badge>
  </Space>
  ```

### Upload Components
- Use Upload for file attachments
- Validate file types and sizes
- Show upload progress
- Display preview for images
- Handle upload errors gracefully
- Use beforeUpload for validation
- Example:
  ```typescript
  <Upload
    beforeUpload={(file) => {
      const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
      if (!isValidType) {
        message.error('Only JPG/PNG files are allowed');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('File must be smaller than 2MB');
        return false;
      }
      return true;
    }}
    onChange={handleUploadChange}
  >
    <Button icon={<UploadOutlined />}>Upload Attachment</Button>
  </Upload>
  ```

### Search and Filter Components
- Use Input.Search for search functionality
- Implement debouncing for search input
- Show search results with highlighting
- Clear search state appropriately
- Use AutoComplete for search suggestions
- Combine with Select for advanced filtering
- Example:
  ```typescript
  <Input.Search
    placeholder="Search goals..."
    onSearch={handleSearch}
    onChange={(e) => debouncedSearch(e.target.value)}
    allowClear
  />
  ```

### Statistic Components
- Use Statistic for displaying key metrics
- Show current value, target value, and percentage
- Use Statistic.Countdown for deadline countdowns
- Format numbers appropriately
- Use color coding for status
- Example:
  ```typescript
  <Row gutter={16}>
    <Col span={8}>
      <Statistic title="Current" value={currentValue} suffix={unit} />
    </Col>
    <Col span={8}>
      <Statistic title="Target" value={targetValue} suffix={unit} />
    </Col>
    <Col span={8}>
      <Statistic
        title="Progress"
        value={progress}
        suffix="%"
        valueStyle={{ color: progress >= 100 ? '#3f8600' : '#cf1322' }}
      />
    </Col>
  </Row>
  ```

## Component Composition Patterns

### Container/Presentational Pattern
- Separate data fetching (containers) from presentation (components)
- Containers handle state and side effects
- Presentational components receive props and render UI
- Example:
  ```typescript
  // Container
  const GoalsContainer = () => {
    const { data, isLoading } = useGoals();
    return <GoalsList goals={data} loading={isLoading} />;
  };
  
  // Presentational
  const GoalsList = ({ goals, loading }: GoalsListProps) => {
    return <Table dataSource={goals} loading={loading} />;
  };
  ```

### Compound Components
- Group related components together
- Share implicit state between components
- Use React Context for compound component state
- Example: Card with Card.Header, Card.Body, Card.Footer

### Render Props Pattern
- Use when component needs flexible rendering
- Pass render function as prop
- Useful for data fetching and state management
- Example:
  ```typescript
  <DataFetcher
    url="/api/goals"
    render={(data, loading, error) => (
      <GoalsList goals={data} loading={loading} error={error} />
    )}
  />
  ```

### Higher-Order Components (HOCs)
- Use sparingly (prefer hooks)
- Useful for cross-cutting concerns
- Example: withErrorBoundary, withLoadingState

## Props Design

### TypeScript Props
- Always define Props interface
- Use descriptive names (GoalCardProps, not Props)
- Mark optional props with `?`
- Use union types for limited options
- Use generics for reusable components
- Example:
  ```typescript
  interface GoalCardProps {
    goal: Goal;
    onEdit?: (goal: Goal) => void;
    onDelete?: (goalId: string) => void;
    showActions?: boolean;
    variant?: 'default' | 'compact' | 'detailed';
  }
  ```

### Default Props
- Prefer default parameters over defaultProps
- Use default parameters in function signature
- Example:
  ```typescript
  const GoalCard = ({
    goal,
    showActions = true,
    variant = 'default'
  }: GoalCardProps) => {
    // ...
  };
  ```

### Prop Validation
- Use TypeScript for compile-time validation
- Use runtime validation with Zod for API data
- Validate required props at component level
- Provide helpful error messages for invalid props

### Event Handler Props
- Use descriptive names: `onClick`, `onSubmit`, `onChange`
- Pass event object or relevant data
- Use consistent naming: `handle*` for internal, `on*` for props
- Example:
  ```typescript
  interface GoalCardProps {
    onEdit: (goal: Goal) => void;
    onDelete: (goalId: string) => void;
  }
  
  const GoalCard = ({ onEdit, onDelete }: GoalCardProps) => {
    const handleEdit = () => onEdit(goal);
    const handleDelete = () => onDelete(goal.id);
    // ...
  };
  ```

## State Management in Components

### Local State
- Use useState for simple component state
- Use useReducer for complex state logic
- Keep state as local as possible
- Lift state up only when needed
- Example:
  ```typescript
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useReducer(formReducer, initialFormData);
  ```

### Derived State
- Calculate derived values in render or useMemo
- Avoid storing derived state separately
- Example:
  ```typescript
  const progress = useMemo(
    () => calculateProgress(current, target),
    [current, target]
  );
  ```

### Form State
- Use Ant Design Form for form state management
- Use Form.useForm() for programmatic control
- Use Form.useWatch() for dependent fields
- Handle form reset and cleanup

### URL State
- Use URL parameters for shareable/filterable state
- Use React Router or similar for URL state
- Sync URL state with component state
- Example: `/goals?status=active&category=health`

## Event Handling

### Click Events
- Use onClick for button clicks
- Prevent default behavior when needed
- Stop propagation to prevent bubbling
- Handle keyboard events (Enter, Space) for accessibility
- Example:
  ```typescript
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAction();
  };
  ```

### Form Events
- Use onSubmit for form submission
- Prevent default form submission
- Validate before submission
- Handle async submission with loading states
- Example:
  ```typescript
  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await submitForm(values);
      message.success('Goal created');
    } catch (error) {
      message.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };
  ```

### Input Events
- Use onChange for controlled inputs
- Debounce search/filter inputs
- Validate on blur for better UX
- Handle special keys (Enter, Escape)

## Performance Optimization

### Memoization
- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for stable function references
- Only memoize when profiling shows it's needed
- Example:
  ```typescript
  const GoalCard = React.memo(({ goal }: GoalCardProps) => {
    // ...
  });
  
  const expensiveValue = useMemo(
    () => calculateExpensiveValue(data),
    [data]
  );
  
  const handleClick = useCallback(() => {
    onAction();
  }, [onAction]);
  ```

### Lazy Loading
- Use React.lazy() for code splitting
- Use Suspense for loading states
- Lazy load routes and heavy components
- Example:
  ```typescript
  const GoalsPage = React.lazy(() => import('./pages/GoalsPage'));
  
  <Suspense fallback={<Spin />}>
    <GoalsPage />
  </Suspense>
  ```

### Virtual Scrolling
- Use for large lists (1000+ items)
- Ant Design Table supports virtual scrolling
- Use react-window or react-virtualized for custom lists
- Example:
  ```typescript
  <Table
    virtual
    scroll={{ y: 400 }}
    dataSource={largeDataSet}
  />
  ```

### Debouncing and Throttling
- Debounce search inputs (300-500ms)
- Throttle scroll events
- Use lodash.debounce or custom hooks
- Example:
  ```typescript
  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );
  ```

## Animation and Transitions

### CSS Transitions
- Use CSS transitions for simple animations
- Prefer transform and opacity for performance
- Keep animations subtle and purposeful
- Example:
  ```css
  .card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  ```

### Ant Design Animations
- Use Ant Design's built-in animations
- Use ConfigProvider for global animation settings
- Use Transition components for enter/exit animations
- Example:
  ```typescript
  <ConfigProvider
    theme={{
      token: {
        motionDurationFast: '0.1s',
        motionDurationMid: '0.2s',
      }
    }}
  >
    {/* components */}
  </ConfigProvider>
  ```

### Animation Best Practices
- Keep animations under 300ms for interactions
- Use easing functions for natural motion
- Respect prefers-reduced-motion
- Don't animate layout properties (use transform)
- Test animations on lower-end devices

## Ant Design Usage

### Spacing & Layout
- Use Ant Design's spacing system (8px base)
- Use Space component for component spacing
- Follow Ant Design's grid system
- Use Row and Col for layouts
- Maintain consistent margins and padding
- Use gap property for flex layouts
- Example:
  ```typescript
  <Space direction="vertical" size="large">
    <Card>Goal 1</Card>
    <Card>Goal 2</Card>
  </Space>
  
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card>Goal Card</Card>
    </Col>
  </Row>
  ```

### Colors & Theming
- Follow Ant Design's color palette
- Use theme customization via ConfigProvider
- Maintain color consistency
- Use semantic colors (success, warning, error, info)
- Support dark mode if implemented
- Use CSS variables for dynamic theming
- Example:
  ```typescript
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 6,
      },
    }}
  >
    {/* components */}
  </ConfigProvider>
  ```

### Icons
- Use Ant Design icons from `@ant-design/icons`
- Use appropriate icon sizes
- Maintain icon consistency
- Use semantic icons (check for success, close for cancel)
- Provide aria-label for icon-only buttons
- Use consistent icon style (outlined, filled, two-tone)
- Example:
  ```typescript
  <Button icon={<EditOutlined />} aria-label="Edit goal">
    Edit
  </Button>
  ```

### Responsive Design
- Use Ant Design's responsive breakpoints
- Test on mobile, tablet, and desktop
- Use responsive props (xs, sm, md, lg, xl, xxl)
- Implement mobile-friendly navigation
- Test touch interactions
- Use responsive utilities for conditional rendering
- Example:
  ```typescript
  const { xs, sm, md } = Grid.useBreakpoint();
  
  return (
    <Col xs={24} sm={12} md={8} lg={6}>
      {/* Responsive column */}
    </Col>
  );
  ```

### Component Usage
- Use ConfigProvider for theme customization
- Leverage Ant Design's built-in features
- Follow Ant Design's component patterns
- Use Ant Design's TypeScript types
- Stay updated with Ant Design version changes
- Import components directly (tree-shaking)
- Example:
  ```typescript
  import { Card, Button, Form } from 'antd';
  import type { FormInstance } from 'antd';
  ```

### Customization
- Customize theme via ConfigProvider
- Use CSS-in-JS for component-specific styles
- Override Ant Design styles when needed
- Maintain design consistency
- Document customizations
- Use CSS modules or styled-components for scoped styles
- Avoid inline styles for complex styling
- Example:
  ```typescript
  // styles.module.css
  .customCard {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  // Component
  <Card className={styles.customCard}>
    {/* content */}
  </Card>
  ```

## Mobile-First Patterns

### Touch Targets
- Minimum 44x44px touch targets
- Adequate spacing between interactive elements
- Use full-width buttons on mobile
- Test on actual devices

### Mobile Navigation
- Use Drawer for mobile navigation
- Collapse menu items on small screens
- Use bottom navigation for primary actions
- Implement swipe gestures where appropriate

### Responsive Tables
- Use horizontal scroll on mobile
- Consider card view for mobile tables
- Hide less important columns on small screens
- Use responsive column visibility

### Mobile Forms
- Use full-width inputs on mobile
- Show labels above inputs (not inline)
- Use native date/time pickers on mobile
- Implement proper keyboard types
- Example:
  ```typescript
  <Input
    type="tel"
    placeholder="Phone number"
    style={{ width: '100%' }}
  />
  ```

## Testing UI Components

### Component Testing
- Test user interactions, not implementation
- Test accessibility (keyboard navigation, screen readers)
- Test error states and edge cases
- Test loading states
- Use React Testing Library
- Example:
  ```typescript
  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<GoalCard goal={mockGoal} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText('Edit goal'));
    expect(onEdit).toHaveBeenCalledWith(mockGoal);
  });
  ```

### Visual Regression Testing
- Use tools like Chromatic or Percy
- Test component variations
- Test responsive breakpoints
- Test dark mode if implemented

## Internationalization (i18n)

### Text Content
- Extract all user-facing text to translation files
- Use translation keys, not hardcoded strings
- Handle pluralization correctly
- Format dates and numbers according to locale
- Example:
  ```typescript
  import { useTranslation } from 'react-i18next';
  
  const { t } = useTranslation();
  return <Button>{t('goals.create')}</Button>;
  ```

### RTL Support
- Test with RTL languages (Arabic, Hebrew)
- Use logical CSS properties (margin-inline, padding-inline)
- Ant Design supports RTL via ConfigProvider
- Example:
  ```typescript
  <ConfigProvider direction="rtl">
    {/* components */}
  </ConfigProvider>
  ```

## Best Practices Summary

### Do's
- ✅ Use TypeScript for all components
- ✅ Follow Ant Design patterns and conventions
- ✅ Implement proper error and loading states
- ✅ Make components accessible (WCAG AA)
- ✅ Test on multiple devices and browsers
- ✅ Use semantic HTML elements
- ✅ Provide clear user feedback
- ✅ Optimize for performance
- ✅ Keep components focused and reusable
- ✅ Document complex components

### Don'ts
- ❌ Don't create custom components when Ant Design provides one
- ❌ Don't ignore accessibility requirements
- ❌ Don't use inline styles for complex styling
- ❌ Don't over-memoize components
- ❌ Don't skip loading and error states
- ❌ Don't hardcode text (use i18n)
- ❌ Don't ignore mobile experience
- ❌ Don't create components that are too large or complex
- ❌ Don't use any type (use proper TypeScript types)
- ❌ Don't forget to handle edge cases

