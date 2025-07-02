# State Design Brief: Task Management Platform

## Authentication & User Management

### Login Screen

#### Initial Landing State
- Clean, centered layout with Background Primary (#FAFBFC) and prominent company logo
- Single local account login form using Primary Blue (#2563EB) styling
- Subtle animation on page load with logo fade-in (350ms ease-out) followed by form slide-up (250ms)
- H2 typography "Welcome to TaskFlow" in Primary Dark (#1E293B) above form
- Body text "Sign in to your account" in Secondary Slate (#64748B)
- Loading spinner replaces button content during authentication with gentle pulse animation

#### Post-Authentication Loading State
- Smooth transition to dashboard with subtle background color shift
- Skeleton loading cards animate in sequence (150ms stagger) showing upcoming dashboard layout
- Progress indicator at top using Primary Blue (#2563EB) with 400ms fill animation
- "Setting up your workspace..." message in Body text with animated dots

### User Management Dashboard

#### Admin User List State
- Sidebar navigation with Surface White (#FFFFFF) background, active "Users" item highlighted in Secondary Blue Pale (#EFF6FF)
- Main content area with H1 "Team Members" and search input using rounded Search Input styling
- User cards in grid layout with Default Card styling, each showing avatar, name, role badge, and project count
- Role badges use functional colors: Admin (Primary Blue #2563EB), Editor (Accent Green #10B981), Viewer (Neutral Gray #9CA3AF)
- Hover states on cards show 4px Y-offset shadow increase with 200ms ease-out

#### Invite User Modal State
- Modal overlay with Surface White (#FFFFFF) background and Default Card shadow
- H3 "Invite Team Member" with form fields using Text Input styling
- Email input with validation states: Error Red (#DC2626) border for invalid emails
- Role selector dropdown with Select Dropdown styling, pre-filled with project default
- Primary Button "Send Invitation" with loading state showing spinner and "Sending..." text
- Success confirmation with Accent Green (#10B981) checkmark icon and slide-up animation

## Organization & Project Structure

### Project Selector

#### Collapsed Header State
- Top navigation bar with Surface White (#FFFFFF) background and project name in H3 typography
- Current project indicator with colored dot matching project theme and permission badge
- Dropdown chevron icon in Secondary Slate (#64748B) with 150ms rotation animation on hover
- Breadcrumb navigation showing: Organization > Project Name with Link Text styling

#### Expanded Dropdown State
- Dropdown panel slides down (250ms ease-in-out) with Surface White background and Default Card shadow
- Project list with search input at top using Search Input styling with auto-focus
- Each project shows: colored indicator dot, project name, member count, and permission level badge
- Recently accessed projects section with subtle Background Secondary (#F1F5F9) separator
- "Create New Project" option at bottom with Primary Blue (#2563EB) plus icon and hover state

## Cross-Project Dashboard

### Overview Grid State
- Main dashboard with Background Primary (#FAFBFC) and H1 "Dashboard" title
- Grid layout of project cards using Task Card styling with project-specific accent colors
- Each card shows: project name, active sprint, upcoming milestones, task count, team members
- Milestone indicators use Accent Purple (#8B5CF6) with due date countdown
- Real-time updates animate with subtle highlight flash (300ms ease-out) in Secondary Blue Pale (#EFF6FF)

### Conflict Detection State
- Scheduling conflicts highlighted with Warning Orange (#D97706) border and subtle pulse animation
- Conflict indicator tooltip on hover explaining overlap details in Body Small typography
- Filter controls in top-right with Ghost Button styling for "Show Conflicts Only"
- Timeline view toggle between grid and linear timeline with smooth 400ms transition

## Task Management Core

### Task Creation Modal

#### Initial Form State
- Right-side slide-in panel (350ms cubic-bezier) maintaining background context with overlay
- H3 "Create New Task" with form progression indicator showing current step
- Required fields (title, project) with Text Input styling and clear visual hierarchy
- Optional fields revealed via progressive disclosure with "Show more options" link
- Smart defaults: current project selected, priority set to Medium, assignee to current user

#### Rich Content State
- Description field expanded to text area with markdown preview toggle
- File attachment zone with drag-and-drop styling and upload progress indicators
- Tag input with autocomplete dropdown showing existing project tags
- Dependency selector with search-able task list and visual relationship preview
- Story points selector with poker planning values and team velocity context

#### Validation & Success State
- Real-time validation with field-level error messages in Error Red (#DC2626)
- Save button transforms to loading state with spinner and "Creating..." text
- Success confirmation with Accent Green (#10B981) checkmark and auto-close timer
- New task appears in relevant views with highlight animation and smooth position adjustment

### Bulk Operations Interface

#### Selection Mode State
- Multi-select checkboxes fade in (150ms) on task cards when first task selected
- Selected tasks show Primary Blue (#2563EB) border and Secondary Blue Pale (#EFF6FF) background
- Floating action toolbar slides up from bottom with bulk operation options
- Selection counter shows "X tasks selected" with clear all option
- Keyboard shortcuts displayed in tooltip: Shift+Click for range, Cmd/Ctrl+A for all

#### Bulk Action Modal State
- Modal with H3 title showing action and selection count
- Preview of changes with before/after states for transparency
- Progress indicator during bulk operations with estimated time remaining
- Individual task progress with success/error indicators per item
- Undo button available for 10 seconds after completion with countdown timer

## Kanban Board Views

### Main Board State

#### Default Column View
- Four columns (To Do, In Progress, Review, Done) with Background Secondary (#F1F5F9) headers
- Task cards using Task Card styling with priority indicators via left border colors
- Assignee avatars in bottom-right with overlap for multiple assignees
- Milestone associations shown with small Accent Purple (#8B5CF6) tag
- Real-time collaborator cursors with colored outlines and name labels

#### Drag & Drop Active State
- Dragged card shows enhanced shadow and slight rotation (200ms spring animation)
- Drop zones highlight with Secondary Blue Pale (#EFF6FF) background and dashed border
- Column headers show task count updates in real-time during drag operations
- Invalid drop targets (due to permissions) show Error Red (#DC2626) background
- Smooth snap-to-position animation when dropping with gentle bounce effect

### Filter & Search State

#### Filter Panel Expanded
- Right sidebar slides out (250ms ease-in-out) with Background Secondary (#F1F5F9) background
- Filter groups: Assignee, Priority, Labels, Milestone with collapsible sections
- Multi-select checkboxes with instant filtering and result count updates
- Search input with full-text capabilities and highlighted results
- "Clear all filters" button with confirmation for unsaved filter combinations

#### Filtered Results State
- Filtered tasks highlighted with subtle Secondary Blue Pale (#EFF6FF) glow
- Active filter chips below board header with remove option per filter
- Empty state messaging when no tasks match filters with suggestion to adjust criteria
- Save filter option for frequently used combinations with naming interface

## Calendar Integration

### Calendar View

#### Monthly Overview State

FullCalendar layout with Background Primary (#FAFBFC) and Surface White (#FFFFFF) date cells
Milestones appear as Accent Purple (#8B5CF6) event blocks with project color accent
- Task due dates show as colored dots with hover tooltips containing task details
- Current day highlighted with Primary Blue (#2563EB) border and subtle background tint
- Project filter toggle in header with multi-select project visibility

#### Conflict Detection State
- Overlapping milestones highlighted with Warning Orange (#D97706) striped pattern
- Conflict tooltip appears on hover with affected projects and suggested alternatives
- Resource overallocation days show Warning Orange (#D97706) background tint
- Team capacity bar below calendar showing workload distribution across time
- Visual indicators for team members at capacity with Error Red (#DC2626) alerts

## Milestone Management

### Milestone Creation State
- Inline creation directly on calendar with click-and-type interface
- Date picker with team availability context and conflict warnings
- Calendar sync toggle with status indicator and permissions check
- Team member selector with automatic attendee addition and notification preferences
- Real-time validation for scheduling conflicts with suggested alternative dates

### Sync Status Indicators
- Calendar sync status badge with Success Green (#059669) for synced events
- Sync in progress with rotating spinner and "Syncing..." text
- Sync error states with Error Red (#DC2626) icon and retry action
- Bidirectional change notifications with clear indication of source system

## Sprint Planning & Backlog Management

### Sprint Planning Board

#### Backlog & Sprint Columns
- Two-column layout with Backlog (left) and Active Sprint (right) using clear visual separation
- Sprint capacity indicator at top showing story points vs. team velocity
- Drag-and-drop between columns with capacity warnings for overcommitment
- Task estimation tooltips with historical data and team velocity context
- Sprint timeline with clear start/end dates and milestone markers

#### Sprint Creation State
- Modal with sprint details form including name, duration, and goals
- Team velocity calculation with historical data visualization
- Capacity planning with individual team member availability
- Goal setting interface with success criteria definition
- Template selection for common sprint patterns

### Burndown Charts

#### Active Sprint Metrics
- Real-time burndown chart with actual vs. ideal work remaining lines
- Daily data points with hover details showing completed tasks and scope changes
- Velocity trending with comparison to team historical averages
- Scope change indicators with explanations for added/removed work
- Projection lines showing likely completion date based on current velocity

#### Historical Analysis State
- Multi-sprint comparison with overlay capabilities
- Team performance trends with improvements and regression indicators
- Filtering by team member, project, or time period
- Export options for data analysis with multiple format support
- Drill-down capabilities to individual task completion patterns

## Advanced Search & Analytics

### Search Interface

#### Global Search State
- Prominent search bar in top navigation with keyboard shortcut indicator (Cmd/Ctrl+K)
- Auto-complete with recent searches, saved filters, and quick suggestions
- Search scope selector: Current Project, All Projects, or Archived
- Real-time results with relevance highlighting and content type indicators
- Advanced filter builder with natural language query preview

#### Search Results State
- Results grouped by type: Tasks, Milestones, Projects, Comments with count badges
- Relevance scoring with highlighted matching text in context
- Quick actions available per result: Edit, Assign, Add to Sprint
- Infinite scroll with performance optimization for large result sets
- Save search option with notification scheduling for new matching items

### Analytics Dashboard

#### Custom Dashboard Creation
- Widget library with drag-and-drop dashboard building interface
- Real-time preview of metrics with sample data during configuration
- Layout grid with responsive breakpoints and auto-sizing options
- Sharing and collaboration features with permission controls
- Template gallery for common dashboard patterns

#### Reporting Interface State
- Report builder with visual query construction and live preview
- Time range selector with common presets and custom date picker
- Export options with scheduling for regular delivery
- Performance optimization with data sampling for large datasets
- Collaborative commenting on reports with threaded discussions