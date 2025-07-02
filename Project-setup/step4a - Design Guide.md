# UX/UI Style Guide: Task Management Platform

## Color Palette

### Primary Colors

- **Primary Blue** - #2563EB (Primary brand color for buttons, key actions, and navigation emphasis)
- **Primary White** - #FFFFFF (Clean surfaces, card backgrounds, and content areas)
- **Primary Dark** - #1E293B (Primary text and high-contrast elements)

### Secondary Colors

- **Secondary Blue Light** - #3B82F6 (Hover states and interactive elements)
- **Secondary Blue Pale** - #EFF6FF (Selected states, highlights, and subtle backgrounds)
- **Secondary Slate** - #64748B (Secondary text and supporting information)

### Accent Colors

- **Accent Green** - #10B981 (Success states, completed tasks, and positive actions)
- **Accent Orange** - #F59E0B (Warnings, conflicts, and attention-requiring items)
- **Accent Purple** - #8B5CF6 (Milestones, special events, and calendar highlights)
- **Accent Indigo** - #6366F1 (Sprint indicators and agile-specific elements)

### Functional Colors

- **Success Green** - #059669 (Confirmations and successful operations)
- **Error Red** - #DC2626 (Errors, destructive actions, and critical alerts)
- **Warning Orange** - #D97706 (Cautions and scheduling conflicts)
- **Info Blue** - #0284C7 (Informational messages and helpful guidance)
- **Neutral Gray** - #9CA3AF (Disabled states and placeholders)

### Background Colors

- **Background Primary** - #FAFBFC (Main app background with subtle warmth)
- **Background Secondary** - #F1F5F9 (Section backgrounds and content separation)
- **Background Tertiary** - #E2E8F0 (Subtle dividers and inactive areas)
- **Surface White** - #FFFFFF (Cards, modals, and elevated content)

## Typography

### Font Family

- **Primary Font**: Inter (Web primary)
- **Fallback Font**: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Font Weights

- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

#### Headings

- **H1**: 32px/40px, Bold, Letter spacing -0.5px
  - Used for main page titles and primary headers

- **H2**: 28px/36px, Bold, Letter spacing -0.3px
  - Used for section headers and feature titles

- **H3**: 24px/32px, Semibold, Letter spacing -0.2px
  - Used for subsection headers and card titles

- **H4**: 20px/28px, Semibold, Letter spacing -0.1px
  - Used for component headers and task titles

#### Body Text

- **Body Large**: 18px/28px, Regular, Letter spacing 0px
  - Primary reading text for descriptions and content

- **Body**: 16px/24px, Regular, Letter spacing 0px
  - Standard text for most UI elements and task details

- **Body Small**: 14px/20px, Regular, Letter spacing 0.1px
  - Secondary information and metadata

#### Special Text

- **Caption**: 13px/18px, Medium, Letter spacing 0.2px
  - Timestamps, labels, and supporting information

- **Button Text**: 16px/24px, Medium, Letter spacing 0.1px
  - Interactive elements and call-to-action text

- **Link Text**: 16px/24px, Medium, Letter spacing 0px, Primary Blue
  - Clickable text and navigation elements

- **Code/Monospace**: 14px/20px, Regular, Letter spacing 0px, 'JetBrains Mono'
  - Technical content and task IDs

## Component Library Implementation

### ShadCN/UI Integration

The design system will be implemented using ShadCN/UI components, which provide accessible, customizable components built on Radix UI primitives. All design tokens and styling guidelines above are compatible with ShadCN/UI's theming system.

**ShadCN/UI Component Mapping:**
- Primary Button → Button component with default variant
- Secondary Button → Button component with outline variant
- Ghost Button → Button component with ghost variant
- Danger Button → Button component with destructive variant
- Default Card → Card component with CardHeader, CardContent
- Task Card → Custom Card variant with hover states
- Text Input → Input component with custom styling
- Select Dropdown → Select component with custom theming
- Modal/Dialog → Dialog component with overlay styling

**Custom CSS Variables for ShadCN/UI:**
```css
:root {
  --primary: 219 78% 57%;      /* Primary Blue #2563EB */
  --primary-foreground: 0 0% 100%;  /* White text */
  --secondary: 215 25% 27%;    /* Secondary Slate #64748B */
  --accent: 166 76% 54%;       /* Accent Green #10B981 */
  --destructive: 0 72% 51%;    /* Error Red #DC2626 */
  --background: 216 12% 98%;   /* Background Primary #FAFBFC */
  --card: 0 0% 100%;          /* Surface White */
  --border: 215 20% 89%;      /* Border color #E2E8F0 */
  --radius: 0.5rem;          /* 8px border radius */
}
```

## Component Styling

### Buttons

#### Primary Button
- Background: Primary Blue (#2563EB)
- Text: White (#FFFFFF)
- Height: 44px
- Corner Radius: 8px
- Padding: 16px horizontal, 12px vertical
- Hover: Secondary Blue Light (#3B82F6)

#### Secondary Button
- Border: 1.5px Primary Blue (#2563EB)
- Text: Primary Blue (#2563EB)
- Background: Transparent
- Height: 44px
- Corner Radius: 8px
- Hover: Secondary Blue Pale background

#### Ghost Button
- Text: Secondary Slate (#64748B)
- Background: Background Secondary (#F1F5F9)
- Height: 40px
- Corner Radius: 6px
- Hover: Background Tertiary

#### Danger Button
- Background: Error Red (#DC2626)
- Text: White (#FFFFFF)
- Height: 44px
- Corner Radius: 8px

### Cards

#### Default Card
- Background: Surface White (#FFFFFF)
- Shadow: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)
- Corner Radius: 12px
- Padding: 20px
- Border: 1px solid #E2E8F0

#### Task Card
- Background: Surface White (#FFFFFF)
- Shadow: 0px 1px 2px rgba(0, 0, 0, 0.05)
- Corner Radius: 8px
- Padding: 16px
- Hover: Enhanced shadow with 4px Y-offset
- Active: Border 2px Primary Blue

#### Milestone Card
- Background: Surface White (#FFFFFF)
- Left Border: 4px Accent Purple (#8B5CF6)
- Corner Radius: 8px
- Padding: 16px

### Input Fields

#### Text Input
- Height: 48px
- Corner Radius: 8px
- Border: 1.5px #E2E8F0
- Active Border: 2px Primary Blue (#2563EB)
- Background: Surface White (#FFFFFF)
- Text: Primary Dark (#1E293B)
- Placeholder: Neutral Gray (#9CA3AF)
- Padding: 12px 16px

#### Search Input
- Height: 44px
- Corner Radius: 22px
- Background: Background Secondary (#F1F5F9)
- Border: None
- Icon: Secondary Slate (#64748B)
- Focus: Background White with Primary Blue border

#### Select Dropdown
- Height: 48px
- Corner Radius: 8px
- Border: 1.5px #E2E8F0
- Background: Surface White (#FFFFFF)
- Chevron: Secondary Slate (#64748B)

### Navigation

#### Sidebar Navigation
- Background: Surface White (#FFFFFF)
- Width: 280px
- Border Right: 1px #E2E8F0
- Active Item: Background Secondary Blue Pale (#EFF6FF)
- Text: Primary Dark (#1E293B)
- Icons: 20px x 20px

#### Tab Navigation
- Height: 48px
- Background: Background Secondary (#F1F5F9)
- Active Tab: Surface White background with shadow
- Border Radius: 8px
- Text: Medium weight

### Icons

- **Primary Icons**: 24px x 24px
- **Small Icons**: 20px x 20px
- **Navigation Icons**: 20px x 20px
- **Large Feature Icons**: 32px x 32px
- **Interactive Icons**: Primary Blue (#2563EB)
- **Decorative Icons**: Secondary Slate (#64748B)
- **Status Icons**: Appropriate functional colors

## Spacing System

- **2px** - Micro spacing (tight elements, borders)
- **4px** - Extra small spacing (related text elements)
- **8px** - Small spacing (internal component padding)
- **12px** - Default small spacing (button padding, tight sections)
- **16px** - Medium spacing (standard margins, card padding)
- **20px** - Large spacing (card internal spacing)
- **24px** - Extra large spacing (section separation)
- **32px** - Section spacing (major content blocks)
- **48px** - Page spacing (top/bottom margins)
- **64px** - Extra large section spacing (feature separation)

## Motion & Animation

### Standard Transitions

#### Micro Interactions: 150ms, ease-out
- Button hovers, icon changes, small state updates

#### Standard Transition: 250ms, ease-in-out
- Component state changes, modal appearances

#### Emphasis Transition: 350ms, cubic-bezier(0.34, 1.56, 0.64, 1)
- Important state changes, success confirmations

#### Page Transitions: 400ms, cubic-bezier(0.25, 0.46, 0.45, 0.94)
- Route changes, view switching

### Specific Animations

- **Drag & Drop**: 200ms spring animation with gentle bounce
- **Card Hover**: 200ms ease-out with 2px Y-offset shadow increase
- **Loading States**: Gentle pulse animation, 1.5s duration
- **Real-time Updates**: Subtle highlight flash, 300ms ease-out
- **Error States**: 150ms shake animation with 2px amplitude

## Dark Mode Variants

- **Dark Background Primary**: #0F172A (main app background)
- **Dark Background Secondary**: #1E293B (section backgrounds)
- **Dark Surface**: #334155 (card backgrounds)
- **Dark Primary Blue**: #3B82F6 (adjusted for contrast)
- **Dark Text Primary**: #F8FAFC (primary text)
- **Dark Text Secondary**: #CBD5E1 (secondary text)
- **Dark Borders**: #475569 (dividers and borders)

## Responsive Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1440px
- **Large Desktop**: 1440px+

## Mobile Adaptations

- **Touch Targets**: Minimum 44px height
- **Spacing**: Reduced by 25% on mobile
- **Typography**: H1 reduced to 28px, Body to 14px
- **Cards**: Reduced padding to 16px
- **Buttons**: Full-width on mobile for primary actions