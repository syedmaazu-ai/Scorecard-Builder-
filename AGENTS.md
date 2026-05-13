# QA Scorecard Application - Technical Documentation

This document provides a comprehensive overview of the application's architecture, logic, and UI components with a focus on tab switches and conditional UI rendering.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [File Structure](#file-structure)
3. [Data Models](#data-models)
4. [Main Page Logic (Index.tsx)](#main-page-logic-indextsx)
5. [Step-Based Navigation (ScorecardPanel.tsx)](#step-based-navigation-scorecardpaneltsx)
6. [Step Indicator Component](#step-indicator-component)
7. [Accordion Components](#accordion-components)
   - [Step 1: General Settings](#step-1-general-settings)
   - [Step 2: Smart Rules](#step-2-smart-rules)
   - [Step 3: Advanced Settings](#step-3-advanced-settings)
8. [Conditional UI Rendering Patterns](#conditional-ui-rendering-patterns)
9. [Dashboard Components](#dashboard-components)

---

## Application Overview

The QA Scorecard application is a multi-step form wizard for creating quality assurance scorecards. It features:

- **3-Step Creation Flow**: General Settings → Smart Rules → Advanced Settings
- **Accordion-based Sections**: Collapsible content sections within each step
- **Dynamic Forms**: Fields that appear/disappear based on user selections
- **Dashboard View**: List view with enable/disable, duplicate, and delete actions

---

## File Structure

```
src/
├── pages/
│   └── Index.tsx                    # Main page with dashboard/panel logic
├── components/scorecard/
│   ├── ScorecardPanel.tsx          # Multi-step form container
│   ├── StepIndicator.tsx           # Step navigation UI
│   ├── ScorecardList.tsx           # Dashboard table view
│   ├── EmptyState.tsx              # No scorecards placeholder
│   └── accordions/
│       ├── ScorecardBasicsAccordion.tsx    # Step 1
│       ├── QATypeAccordion.tsx             # Step 1
│       ├── RebuttalAccordion.tsx           # Step 1
│       ├── AllocationAccordion.tsx         # Step 2
│       ├── FiltersAccordion.tsx            # Step 2
│       ├── ParametersAccordion.tsx         # Step 2
│       ├── TestTicketAccordion.tsx         # Step 3
│       └── RerunTicketsAccordion.tsx       # Step 3
└── data/
    └── mockData.ts                  # Types and default data
```

---

## Data Models

### Core Types (mockData.ts)

```typescript
type TicketType = "voice" | "email" | "chat" | "whatsapp" | "instagram" | "twitter" | "facebook";
type QAType = "manual" | "hybrid" | "auto";
type AssignmentType = "no-assignee" | "round-robin" | "team-based";
type AllocationType = "all" | "fixed" | "variable";
type ScoringType = "score" | "na" | "yes-no";
type FilterConnector = "and" | "or";
```

### ScorecardFormData Interface

```typescript
interface ScorecardFormData {
  // Step 1: General Settings
  name: string;
  ticketCategory: "voice" | "non-voice";
  ticketType: TicketType;
  qaType: QAType;
  auditors: string[];
  reviewer: string;
  assignmentType: AssignmentType;
  rebuttalEnabled: boolean;
  rebuttalLevels: RebuttalLevel[];
  autoAcceptHours: number;
  
  // Step 2: Smart Rules
  allocationType: AllocationType;
  allocationValue: number;
  excludeEmailEnabled: boolean;
  excludeEmails: string;
  filters: FilterRule[];
  parameters: Parameter[];
}
```

---

## Main Page Logic (Index.tsx)

### Conditional Dashboard Rendering

The main page switches between two views based on state:

```tsx
// Empty state vs List view
if (scorecards.length === 0 && !isPanelOpen) {
  return <EmptyState onCreateNew={() => setIsPanelOpen(true)} />;
}

return (
  <>
    <ScorecardList ... />
    <ScorecardPanel ... />
  </>
);
```

**Rendering Logic:**
| Condition | View |
|-----------|------|
| `scorecards.length === 0` | EmptyState with "Create New" button |
| `scorecards.length > 0` | ScorecardList table view |
| `isPanelOpen === true` | ScorecardPanel overlay (any state) |

### Scorecard Actions

```tsx
handleCreateScorecard(formData)    // Creates new scorecard from form
handleToggleEnabled(id, enabled)   // Toggles enabled state
handleDuplicateScorecard(id)       // Creates copy with "(Copy)" suffix
handleDeleteScorecard(id)          // Removes scorecard from list
```

---

## Step-Based Navigation (ScorecardPanel.tsx)

### Step State Management

```tsx
type Step = 1 | 2 | 3;
const [currentStep, setCurrentStep] = useState<Step>(1);
```

### Step Navigation Logic

```tsx
const handleBack = () => {
  if (currentStep > 1) {
    setCurrentStep((prev) => (prev - 1) as Step);
  }
};

const handleContinue = () => {
  if (currentStep < 3) {
    setCurrentStep((prev) => (prev + 1) as Step);
  } else {
    onCreateScorecard?.(formData);  // Final step - create scorecard
    handleCancel();
  }
};
```

### Dynamic Button Text

```tsx
const getContinueButtonText = () => {
  switch (currentStep) {
    case 1: return "Continue to Smart Rules";
    case 2: return "Continue to Advanced Settings";
    case 3: return "Create Scorecard";
  }
};
```

### Step Content Rendering

```tsx
{/* Step 1: General Settings */}
{currentStep === 1 && (
  <div className="space-y-3">
    <ScorecardBasicsAccordion ... />
    <QATypeAccordion ... />
    <RebuttalAccordion ... />
  </div>
)}

{/* Step 2: Smart Rules */}
{currentStep === 2 && (
  <div className="space-y-3">
    <AllocationAccordion ... />
    <FiltersAccordion ... />
    <ParametersAccordion ... />
  </div>
)}

{/* Step 3: Advanced Settings */}
{currentStep === 3 && (
  <div className="space-y-3">
    <TestTicketAccordion ... />
    <RerunTicketsAccordion ... />
  </div>
)}
```

---

## Step Indicator Component

### Visual States

```tsx
const isCompleted = item.step < currentStep;  // Past steps
const isCurrent = item.step === currentStep;  // Active step
// Future steps: neither completed nor current
```

### Styling Logic

```tsx
className={cn(
  "...",
  isCurrent
    ? "bg-primary text-primary-foreground shadow-md"          // Active
    : isCompleted
      ? "bg-primary/10 text-primary hover:bg-primary/20"      // Completed
      : "bg-muted text-muted-foreground hover:bg-muted/80"    // Future
)}
```

### Connector Lines

```tsx
{index < steps.length - 1 && (
  <div className={cn(
    "h-0.5 w-8 rounded-full",
    item.step < currentStep ? "bg-primary" : "bg-border"  // Filled vs unfilled
  )} />
)}
```

---

## Accordion Components

### Common Accordion Pattern

All accordions follow this structure:

```tsx
<Collapsible open={expanded} onOpenChange={onToggle}>
  <CollapsibleTrigger>
    {/* Header with title and chevron */}
  </CollapsibleTrigger>
  <CollapsibleContent>
    {/* Accordion content */}
  </CollapsibleContent>
</Collapsible>
```

---

### Step 1: General Settings

#### ScorecardBasicsAccordion

**Conditional Rendering: Channel Selection**

```tsx
{formData.ticketCategory === "non-voice" && (
  <ToggleGroup>
    {/* Shows Email, Chat, WhatsApp, Instagram, Twitter, Facebook */}
  </ToggleGroup>
)}
```

| ticketCategory | Visible Fields |
|----------------|----------------|
| `"voice"` | Scorecard Name, Ticket Type toggle |
| `"non-voice"` | + Channel selection (6 options) |

---

#### QATypeAccordion

**Conditional Rendering: Auditor vs Reviewer**

```tsx
const showAuditorDropdown = formData.qaType === "manual" || formData.qaType === "hybrid";
const showReviewerDropdown = formData.qaType === "auto";

{showAuditorDropdown && (
  <Select>Auditor dropdown</Select>
)}

{showReviewerDropdown && (
  <Select>Reviewer dropdown</Select>
)}
```

| qaType | Visible Fields |
|--------|----------------|
| `"manual"` | Auditor dropdown |
| `"hybrid"` | Auditor dropdown |
| `"auto"` | Reviewer dropdown |

---

#### RebuttalAccordion

**Conditional Rendering: Enable Rebuttal**

```tsx
{formData.rebuttalEnabled && (
  <div className="animate-in fade-in slide-in-from-top-2">
    {/* QA Type Badge */}
    {/* Rebuttal Levels (1-3) with assignee search */}
    {/* Auto-accept timer input */}
  </div>
)}
```

**Dynamic Level Management:**

```tsx
const handleAddLevel = () => {
  if (formData.rebuttalLevels.length >= 3) return;  // Max 3 levels
  // Add new level
};

const handleRemoveLevel = (id: string) => {
  // Remove and renumber remaining levels
  const updatedLevels = formData.rebuttalLevels
    .filter((l) => l.id !== id)
    .map((l, index) => ({ ...l, level: index + 1 }));  // Renumber
};
```

| rebuttalEnabled | Visible Fields |
|-----------------|----------------|
| `false` | Only toggle switch |
| `true` | + QA Type badge, Level rows (1-3), Auto-accept timer |

---

### Step 2: Smart Rules

#### AllocationAccordion

**Conditional Rendering: Allocation Input**

```tsx
{formData.allocationType === "fixed" && (
  <Input type="number" label="Number of Tickets" />
)}

{formData.allocationType === "variable" && (
  <Input type="number" label="Percentage of Tickets" suffix="%" />
)}
```

| allocationType | Input Type |
|----------------|------------|
| `"all"` | No input (Auto QA all tickets) |
| `"fixed"` | Number input for fixed count |
| `"variable"` | Percentage input (1-100%) |

---

#### FiltersAccordion

**Conditional Rendering: Email Exclusions**

```tsx
{formData.excludeEmailEnabled && (
  <Input placeholder="Enter email IDs (comma separated)" />
)}
```

**Dynamic Filter Rows:**

```tsx
{formData.filters.map((filter, index) => (
  <div>
    {/* Filter row: If [Field] [Operator] [Value] */}
    
    {/* AND/OR connector between filters */}
    {index < formData.filters.length - 1 && (
      <ToggleGroup value={filter.connector}>
        <ToggleGroupItem value="and">AND</ToggleGroupItem>
        <ToggleGroupItem value="or">OR</ToggleGroupItem>
      </ToggleGroup>
    )}
  </div>
))}
```

**Filter Limits:**
- Maximum 5 filters allowed
- Connector shown between filters (not after last)

---

#### ParametersAccordion

**Nested Collapsible Structure:**

```tsx
{formData.parameters.map((param) => (
  <div onClick={() => toggleParam(param.id)}>
    {/* Parameter header (expandable) */}
    
    {expandedParams.includes(param.id) && (
      <div>
        {param.subParameters.map((subParam) => (
          <div>
            {/* Sub-parameter form fields */}
            
            {/* Conditional scoring inputs */}
            {subParam.scoringType === "score" && (
              <div>Low Score, Medium Score (optional), High Score</div>
            )}
            
            {subParam.scoringType === "na" && (
              <div>N/A message</div>
            )}
            
            {subParam.scoringType === "yes-no" && (
              <div>Yes/No message</div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
))}
```

| scoringType | Visible Fields |
|-------------|----------------|
| `"score"` | Low Score, Medium Score (optional checkbox), High Score |
| `"na"` | Info message (not applicable) |
| `"yes-no"` | Info message (evaluated as Yes/No) |

---

### Step 3: Advanced Settings

#### TestTicketAccordion

**Tab-Based Navigation:**

```tsx
type TabView = "upload" | "results";
const [activeTab, setActiveTab] = useState<TabView>("upload");

{activeTab === "upload" && (
  // Upload or Add Conversation content
)}

{activeTab === "results" && (
  // Test Results audit log table
)}
```

**Voice vs Non-Voice Branching:**

```tsx
const isVoice = formData.ticketCategory === "voice";

{isVoice ? (
  // Voice Flow: URL input or File upload
  <>
    {voiceInputMethod === "url" && <Input placeholder="Recording URL" />}
    {voiceInputMethod === "upload" && <FileUpload accept=".mp3,.wav,.ogg" />}
  </>
) : (
  // Non-Voice Flow: File upload or Manual conversation
  <>
    {nonVoiceInputMethod === "upload" && <FileUpload accept=".csv,.xlsx" />}
    {nonVoiceInputMethod === "conversation" && (
      <ConversationBuilder />  // Manual message input
    )}
  </>
)}
```

**Input Method Tables:**

| ticketCategory | Input Methods |
|----------------|---------------|
| `"voice"` | URL input OR Audio file upload |
| `"non-voice"` | CSV/XLSX upload OR Manual conversation builder |

---

#### RerunTicketsAccordion

**Validation States:**

```tsx
const ticketCount = parseTicketIds(ticketIds).length;
const isOverLimit = ticketCount > 25;

<Textarea
  className={cn(
    isOverLimit && "border-destructive focus-visible:ring-destructive"
  )}
/>

<p className={cn(
  isOverLimit ? "text-destructive" : "text-muted-foreground"
)}>
  {ticketCount} tickets entered
  {isOverLimit && " (exceeds maximum of 25)"}
</p>
```

**Result Messages:**

```tsx
{rerunResult === "success" && (
  <Alert className="border-primary/30 bg-primary/5">
    Rerun Completed Successfully!
  </Alert>
)}

{rerunResult === "error" && (
  <Alert variant="destructive">
    Rerun Failed
  </Alert>
)}
```

---

## Conditional UI Rendering Patterns

### Pattern 1: Show/Hide Based on Boolean

```tsx
{formData.rebuttalEnabled && (
  <div>Rebuttal configuration content</div>
)}
```

### Pattern 2: Switch Based on Selection

```tsx
{formData.qaType === "manual" && <AuditorDropdown />}
{formData.qaType === "auto" && <ReviewerDropdown />}
```

### Pattern 3: Conditional Styling

```tsx
className={cn(
  "base-classes",
  condition && "conditional-classes"
)}
```

### Pattern 4: Dynamic List Rendering

```tsx
{formData.filters.map((filter, index) => (
  <FilterRow key={filter.id} />
  {/* Show connector only between items */}
  {index < formData.filters.length - 1 && <Connector />}
))}
```

### Pattern 5: Tab-Based Content Switching

```tsx
<TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
{activeTab === "tab1" && <Tab1Content />}
{activeTab === "tab2" && <Tab2Content />}
```

---

## Dashboard Components

### EmptyState

Displayed when `scorecards.length === 0`:
- Centered icon and message
- Fixed "Create New" button at bottom

### ScorecardList

Table view with columns:
- ScoreCard (icon based on ticketCategory)
- Scorecard Title
- Parameters count
- Sub-Parameters count
- Weightage
- Total ZTs
- Last Modified
- Enable/Disable toggle
- Actions dropdown (Duplicate, Delete)

**Icon Conditional Rendering:**

```tsx
{scorecard.ticketCategory === "voice" ? (
  <Phone className="h-5 w-5" />
) : (
  <MessageSquare className="h-5 w-5" />
)}
```

**Dropdown Actions:**

```tsx
<DropdownMenuItem onClick={() => onDuplicate?.(scorecard.id)}>
  Duplicate
</DropdownMenuItem>
<DropdownMenuItem className="text-destructive" onClick={() => onDelete?.(scorecard.id)}>
  Delete
</DropdownMenuItem>
```

---

## Animation Classes Used

| Class | Purpose |
|-------|---------|
| `animate-in` | Entry animation wrapper |
| `fade-in` | Opacity transition |
| `slide-in-from-top-2` | Slide down animation |
| `duration-200` | Animation duration |
| `data-[state=open]:animate-accordion-down` | Accordion open animation |
| `data-[state=closed]:animate-accordion-up` | Accordion close animation |

---

## Summary

The application uses a combination of:

1. **Step-based navigation** - `currentStep` state determines which accordions to show
2. **Accordion expansion** - Local state arrays track which sections are open
3. **Form field conditionals** - `formData` values determine which inputs appear
4. **Tab switching** - Local tab state toggles between content views
5. **Dynamic lists** - Arrays in `formData` are rendered with add/remove functionality
6. **Validation states** - Real-time feedback based on input constraints
