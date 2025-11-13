# UX Design Laws

> **Essential Principles for Intuitive User Interfaces**

## Overview

This document outlines key UX design principles that should guide the design and development of user interfaces. These laws are based on established psychological and human factors research and help create more intuitive, efficient, and user-friendly experiences.

**Why These Laws Matter:**

- Improve user task completion rates
- Reduce cognitive load and decision fatigue
- Increase user satisfaction and engagement
- Minimize learning curves for new users
- Create more accessible and inclusive interfaces

---

## Table of Contents

### Core Interaction Laws

1. [Fitt's Law](#fitts-law)
2. [Hick's Law](#hicks-law)
3. [Jakob's Law](#jakobs-law)
4. [Miller's Law](#millers-law)

### Visual Design & Gestalt Principles

5. [Aesthetic Usability Effect](#aesthetic-usability-effect)
6. [Law of Common Region](#law-of-common-region)
7. [Law of Prägnanz](#law-of-prägnanz-law-of-simplicity)
8. [Law of Proximity](#law-of-proximity)
9. [Law of Similarity](#law-of-similarity)
10. [Law of Uniform Connectedness](#law-of-uniform-connectedness)

### Performance & Response

11. [Doherty Threshold](#doherty-threshold)
12. [Postel's Law](#postels-law-robustness-principle)

### User Memory & Attention

13. [Serial Position Effect](#serial-position-effect)
14. [Von Restorff Effect](#von-restorff-effect-isolation-effect)
15. [Zeigarnik Effect](#zeigarnik-effect)

### Complexity & Simplicity

16. [Occam's Razor](#occams-razor)
17. [Tesler's Law](#teslers-law-law-of-conservation-of-complexity)

### Business & Productivity Principles

18. [Pareto Principle](#pareto-principle-8020-rule)
19. [Parkinson's Law](#parkinsons-law)

---

## Fitt's Law

### Principle

**The time to reach a target depends on its size and distance.**

Bigger buttons and closer placement result in faster user actions.

### Formula

```
Time = a + b × log₂(D/W + 1)
```

Where:

- **D** = Distance to target
- **W** = Width of target
- **a** and **b** = Constants

### Applications

- **Big CTA buttons**: Make primary call-to-action buttons large and prominent
- **Buttons near thumb zone**: Place frequently used buttons within easy reach on mobile devices
- **Large tap areas on mobile**: Ensure interactive elements are at least 44×44px (iOS) or 48×48dp (Android)
- **Related actions grouped together**: Place related buttons close to each other
- **Edge targets**: Utilize screen edges as they provide infinite width (cursor stops at edge)

### Implementation Tips

- Increase button size for primary actions
- Reduce distance between related controls
- Place critical actions in the thumb-friendly zone on mobile
- Use edge and corner placement strategically (e.g., navigation menus)

### Real-World Examples

**✅ Good:**

- Large "Sign Up" button (min 48px height) placed prominently above the fold
- Navigation menu items with 44px+ tap targets
- Related form buttons grouped together (Save/Cancel side-by-side)
- Mobile bottom navigation for thumb accessibility

**❌ Bad:**

- Tiny "Submit" button (24px) at the bottom of a long form
- Menu items with 32px tap targets causing accidental clicks
- Important actions scattered across the page
- Mobile menu at top requiring thumb stretch

---

## Hick's Law

### Principle

**More choices result in slower decisions.**

Every extra option increases the user's decision time logarithmically.

### Formula

```
Time = a + b × log₂(n)
```

Where:

- **n** = Number of choices
- **a** and **b** = Constants

### Applications

- **Minimal menus**: Limit menu items to essential options only
- **Clean onboarding**: Present information step-by-step rather than all at once
- **Limited visible actions at one time**: Show only the most important actions initially
- **Progressive disclosure**: Reveal additional options only when needed
- **Categorization**: Group related options to reduce cognitive load

### Implementation Tips

- Limit navigation menu items to 5-7 options
- Use progressive disclosure for complex features
- Break down multi-step processes into smaller steps
- Hide advanced options by default
- Use clear categorization to group related choices

### Real-World Examples

**✅ Good:**

- Main navigation with 5-6 items + a "More" dropdown
- Multi-step checkout process (3-4 steps)
- Settings page with collapsible sections
- Onboarding with one concept per screen

**❌ Bad:**

- Navigation menu with 15+ items all visible
- Single-page form with 20+ fields
- Settings page with all options visible at once
- Onboarding screen with 10+ features explained

---

## Jakob's Law

### Principle

**Users expect your design to work like the sites they already use.**

People carry mental models from familiar applications and websites.

### Applications

- **Common UI patterns**: Use established patterns (hamburger menu, search icon, etc.)
- **Predictable navigation**: Follow standard navigation conventions
- **Standard icons & gestures**: Use universally recognized icons (home, search, menu, etc.)
- **Familiar layouts**: Place elements where users expect them (logo top-left, navigation top, etc.)
- **Consistent terminology**: Use familiar terms and labels

### Implementation Tips

- Place logo in the top-left corner
- Use standard navigation patterns (top nav, sidebar, footer)
- Use recognizable icons (magnifying glass for search, hamburger for menu)
- Follow platform conventions (iOS vs. Android vs. Web)
- Maintain consistency with industry standards
- Don't reinvent the wheel - use familiar patterns

### Common Patterns Users Expect

| Element       | Expected Location                | Standard Icon/Pattern      |
| ------------- | -------------------------------- | -------------------------- |
| Logo          | Top-left                         | Clickable, returns to home |
| Search        | Top-right or prominent           | Magnifying glass icon      |
| Navigation    | Top horizontal or left sidebar   | Hamburger menu on mobile   |
| User Account  | Top-right                        | Profile icon or avatar     |
| Shopping Cart | Top-right                        | Cart/bag icon with badge   |
| Settings      | Top-right dropdown or bottom nav | Gear icon                  |
| Back Button   | Top-left (mobile)                | Arrow left icon            |
| Primary CTA   | Prominent, above fold            | Large, contrasting button  |

### Real-World Examples

**✅ Good:**

- Logo in top-left that links to homepage
- Search icon in header (users expect it there)
- Hamburger menu on mobile (universally recognized)
- Standard form layout (labels above inputs)

**❌ Bad:**

- Logo in center or bottom (unexpected placement)
- Custom icon for search that users don't recognize
- Unique navigation pattern requiring learning
- Non-standard form layout confusing users

---

## Miller's Law

### Principle

**Humans can hold approximately 7 items (±2) in working memory at once.**

Too many elements lead to cognitive overload and reduced usability.

### Applications

- **Chunking content**: Break information into groups of 5-9 items
- **5-7 items in menus**: Limit menu items to 7 or fewer
- **Clear section grouping**: Organize content into manageable chunks
- **Progressive information display**: Show information in digestible portions
- **Memory aids**: Use visual grouping, numbering, and categorization

### Implementation Tips

- Limit menu items to 7 or fewer
- Group related items together visually
- Use clear headings and sections
- Break long forms into multiple steps
- Use pagination or infinite scroll for long lists
- Provide visual grouping (cards, sections, dividers)
- Use numbering or bullet points for lists

### Chunking Strategies

1. **Visual Chunking**: Use whitespace, borders, or background colors to group related items
2. **Numerical Chunking**: Break long numbers (phone, credit card) into groups
3. **Hierarchical Chunking**: Use headings and subheadings to organize content
4. **Sequential Chunking**: Group process steps together (step 1, step 2, etc.)

### Real-World Examples

**✅ Good:**

- Navigation menu with 6 items grouped into categories
- Phone number: (555) 123-4567 (chunked format)
- Form with 5-7 fields per step
- Dashboard with 4-6 main sections

**❌ Bad:**

- Navigation menu with 12 items in one list
- Phone number: 5551234567 (no chunking)
- Form with 20 fields on one page
- Dashboard with 15 different sections visible

---

## Aesthetic Usability Effect

### Principle

**Users often perceive aesthetically pleasing designs as more usable.**

Beautiful interfaces are often perceived as easier to use, even if functionality is identical.

### Applications

- **Invest in visual design**: Good aesthetics can mask minor usability issues
- **First impressions matter**: Users judge quality quickly based on appearance
- **Brand credibility**: Professional design increases trust and perceived value
- **Error tolerance**: Users are more forgiving of errors in beautiful interfaces

### Implementation Tips

- Maintain consistent visual style and branding
- Use appropriate whitespace and typography
- Ensure color schemes are harmonious and accessible
- Invest in quality icons and imagery
- Don't sacrifice usability for beauty, but don't ignore aesthetics

### Real-World Examples

**✅ Good:**

- Clean, modern interface with thoughtful spacing
- Consistent color palette and typography
- High-quality icons and illustrations
- Professional photography and imagery

**❌ Bad:**

- Cluttered, inconsistent visual design
- Poor color choices and typography
- Low-quality or mismatched icons
- Unprofessional appearance despite good functionality

---

## Doherty Threshold

### Principle

**Productivity soars when a computer and its users interact at a pace (<400ms) that ensures neither has to wait on the other.**

System response time should be under 400ms to maintain user engagement and flow.

### Applications

- **Loading states**: Show immediate feedback for user actions
- **Progressive loading**: Display content as it becomes available
- **Optimistic updates**: Update UI immediately, sync in background
- **Skeleton screens**: Show placeholders while content loads

### Implementation Tips

- Keep interactive response time under 400ms
- Use loading spinners, skeletons, or progress indicators
- Implement optimistic UI updates
- Preload critical content and assets
- Use debouncing for search/input, but keep feedback immediate

### Real-World Examples

**✅ Good:**

- Button click shows immediate feedback (color change, animation)
- Search results appear with loading skeleton
- Form submissions show instant confirmation
- Smooth animations (60fps) without lag

**❌ Bad:**

- Buttons that don't respond for 2+ seconds
- Blank screens while data loads
- No feedback during API calls
- Janky animations and stuttering

---

## Law of Common Region

### Principle

**Elements tend to be perceived as grouped if they are sharing an area with a clearly defined boundary.**

Visual boundaries create perceived groups and relationships.

### Applications

- **Card layouts**: Group related content in cards or containers
- **Form sections**: Use borders or backgrounds to group related fields
- **Navigation groups**: Visually separate menu sections
- **Content organization**: Use containers to show relationships

### Implementation Tips

- Use borders, backgrounds, or shadows to create visual boundaries
- Group related elements in cards or containers
- Use whitespace to separate different groups
- Apply consistent styling to related items
- Create clear visual hierarchy with containers

### Real-World Examples

**✅ Good:**

- Dashboard cards grouping related metrics
- Form sections with borders separating categories
- Navigation menu with visual dividers
- Content blocks with clear boundaries

**❌ Bad:**

- All content floating without clear grouping
- Related items that look disconnected
- No visual separation between different sections
- Unclear relationships between elements

---

## Law of Prägnanz (Law of Simplicity)

### Principle

**People will perceive and interpret ambiguous or complex images as the simplest form possible.**

Users prefer simple, clear designs over complex ones.

### Applications

- **Minimalist design**: Remove unnecessary elements
- **Clear visual hierarchy**: Make important elements obvious
- **Simple iconography**: Use clear, recognizable icons
- **Reduced cognitive load**: Present information in simplest form

### Implementation Tips

- Remove decorative elements that don't add value
- Use simple, recognizable icons and symbols
- Maintain clear visual hierarchy
- Avoid unnecessary complexity
- Follow "less is more" principle

### Real-World Examples

**✅ Good:**

- Clean, minimal interface with essential elements only
- Simple, recognizable icons
- Clear visual hierarchy
- Uncluttered layouts

**❌ Bad:**

- Overly complex designs with too many elements
- Unclear or ambiguous icons
- No clear visual hierarchy
- Cluttered, busy interfaces

---

## Law of Proximity

### Principle

**Objects that are near, or proximate to each other, tend to be grouped together.**

Elements placed close together are perceived as related.

### Applications

- **Related controls**: Place related buttons/controls close together
- **Form field grouping**: Group related form fields near each other
- **Navigation menus**: Group related menu items
- **Content organization**: Place related content together

### Implementation Tips

- Group related elements together spatially
- Use consistent spacing between related items
- Increase spacing between unrelated groups
- Apply proximity to forms, buttons, and content
- Combine with Law of Similarity for stronger grouping

### Real-World Examples

**✅ Good:**

- Form fields grouped by category with spacing between groups
- Related buttons placed side-by-side
- Navigation items grouped logically
- Related content blocks placed together

**❌ Bad:**

- Related elements scattered across the page
- Unclear spacing creating confusion
- No visual relationship between related items
- Inconsistent grouping patterns

---

## Law of Similarity

### Principle

**Elements that look similar are perceived to be related or part of the same group.**

Visual similarity creates perceived relationships.

### Applications

- **Button styling**: Use consistent styles for similar actions
- **Icon sets**: Use consistent icon style throughout
- **Typography**: Use same font/size for related content
- **Color coding**: Use color to show relationships

### Implementation Tips

- Use consistent styling for similar elements
- Apply color, shape, or size to show relationships
- Create visual consistency across similar actions
- Use contrast to distinguish different types of elements
- Combine with Law of Proximity for stronger grouping

### Real-World Examples

**✅ Good:**

- All primary buttons share the same style
- Consistent icon style throughout interface
- Related content uses same typography
- Color-coded categories

**❌ Bad:**

- Inconsistent button styles confusing users
- Mixed icon styles making relationships unclear
- No visual consistency between similar elements
- Random styling creating no clear relationships

---

## Law of Uniform Connectedness

### Principle

**Elements that are visually connected (e.g., by lines or shapes) are perceived as more related than elements with no connection.**

Visual connections create stronger perceived relationships than proximity alone.

### Applications

- **Connection lines**: Use lines to show relationships
- **Background shapes**: Group elements with background shapes
- **Borders and containers**: Use borders to connect related items
- **Flow diagrams**: Show processes with connecting lines

### Implementation Tips

- Use lines, borders, or shapes to connect related elements
- Create visual flow between connected items
- Use background colors/shapes to group elements
- Show relationships with visual connectors
- Combine multiple grouping laws for stronger effect

### Real-World Examples

**✅ Good:**

- Flowcharts with connecting lines
- Form sections with borders connecting related fields
- Process steps connected visually
- Related cards with connecting visual elements

**❌ Bad:**

- No visual connection between related elements
- Unclear relationships between items
- Disconnected flow in processes
- Missing visual cues for relationships

---

## Occam's Razor

### Principle

**Among competing hypotheses, the one with the fewest assumptions should be selected. The simplest solution is usually the best.**

Simpler solutions are preferred over complex ones.

### Applications

- **Feature simplicity**: Avoid unnecessary features
- **Navigation simplicity**: Use simplest navigation structure
- **Workflow simplicity**: Minimize steps to complete tasks
- **UI simplicity**: Remove unnecessary UI elements

### Implementation Tips

- Choose the simplest solution that works
- Remove unnecessary features and options
- Minimize steps in user workflows
- Avoid over-engineering solutions
- Test if simpler alternatives work as well

### Real-World Examples

**✅ Good:**

- Simple, focused feature set
- Minimal navigation structure
- Few steps to complete tasks
- Clean, uncluttered interface

**❌ Bad:**

- Over-engineered solutions
- Too many features and options
- Complex workflows with unnecessary steps
- Cluttered interface with too many elements

---

## Pareto Principle (80/20 Rule)

### Principle

**80% of effects come from 20% of causes. 80% of users use 20% of features.**

Focus on the features and paths that matter most.

### Applications

- **Feature prioritization**: Focus on high-impact features
- **User research**: Identify most common user paths
- **Performance optimization**: Optimize the 20% causing 80% of issues
- **Content strategy**: Focus on most valuable content

### Implementation Tips

- Identify and prioritize the 20% of features that provide 80% of value
- Optimize the most common user paths
- Focus design effort on high-impact areas
- Track usage to identify critical features
- Don't over-engineer rarely used features

### Real-World Examples

**✅ Good:**

- Dashboard showing most-used features prominently
- Optimized checkout flow (most critical path)
- Focus on core functionality over edge cases
- Analytics-driven feature prioritization

**❌ Bad:**

- Equal focus on all features regardless of usage
- Complex features that few users need
- Neglecting optimization of critical paths
- No data-driven prioritization

---

## Parkinson's Law

### Principle

**Work expands to fill the time available for its completion. Users will use all available time.**

Users will take as long as you allow them, even if less time is needed.

### Applications

- **Progress indicators**: Show progress to encourage completion
- **Time limits**: Use deadlines to encourage action
- **Progress steps**: Break tasks into steps with completion indicators
- **Onboarding**: Don't let it drag on unnecessarily

### Implementation Tips

- Set clear expectations for task duration
- Use progress indicators to show advancement
- Break long processes into manageable steps
- Use time-sensitive offers carefully
- Show completion progress to motivate users

### Real-World Examples

**✅ Good:**

- Multi-step forms with progress bars
- Onboarding with clear completion indicators
- Time-limited offers (used appropriately)
- Clear task duration expectations

**❌ Bad:**

- Open-ended processes with no progress indication
- Unclear how long tasks will take
- No sense of advancement or completion
- Users abandoning due to perceived length

---

## Postel's Law (Robustness Principle)

### Principle

**Be conservative in what you send, be liberal in what you accept.**

Design interfaces to be flexible and forgiving of user input.

### Applications

- **Input validation**: Accept various input formats
- **Error handling**: Gracefully handle errors and edge cases
- **Compatibility**: Support various devices and browsers
- **User input**: Interpret user intent, not just exact input

### Implementation Tips

- Accept multiple input formats (phone numbers, dates, etc.)
- Provide clear error messages and recovery paths
- Handle edge cases gracefully
- Be flexible with user input interpretation
- Design for various devices and browsers

### Real-World Examples

**✅ Good:**

- Phone number input accepts various formats
- Date picker accepts multiple date formats
- Clear error messages with recovery suggestions
- Graceful degradation on older browsers

**❌ Bad:**

- Strict input validation rejecting valid formats
- Unclear error messages
- No recovery options when errors occur
- Poor compatibility across devices

---

## Serial Position Effect

### Principle

**Users have a propensity to best remember the first and last items in a series.**

Items at the beginning and end of a list are remembered better.

### Applications

- **Navigation menus**: Place important items at start and end
- **Content layout**: Put key information at top and bottom
- **Form design**: Place critical fields first and last
- **Feature lists**: Highlight most important features at beginning and end

### Implementation Tips

- Place most important items at the beginning and end of lists
- Put key information at the top and bottom of pages
- Structure navigation with important items at start/end
- Use middle positions for less critical items
- Apply to menus, forms, content lists, and feature displays

### Real-World Examples

**✅ Good:**

- Navigation menu with "Home" first, "Account" last
- Form with name first, submit button last
- Feature list with key features at top and bottom
- Content with key points at beginning and end

**❌ Bad:**

- Important items buried in the middle of lists
- No clear priority in list ordering
- Critical information lost in the middle
- No strategic positioning of important elements

---

## Tesler's Law (Law of Conservation of Complexity)

### Principle

**Every application has an inherent amount of irreducible complexity. Either the user or the developer must handle it.**

Complexity doesn't disappear—it must be managed somewhere.

### Applications

- **System complexity**: Handle complexity in the system, not the UI
- **Smart defaults**: Use intelligent defaults to reduce user decisions
- **Automation**: Automate complex processes behind the scenes
- **Progressive disclosure**: Hide complexity, reveal when needed

### Implementation Tips

- Move complexity from users to the system
- Use smart defaults and intelligent automation
- Hide complexity behind simple interfaces
- Provide advanced options for power users
- Balance simplicity with necessary functionality

### Real-World Examples

**✅ Good:**

- Smart form auto-fill reducing user input
- Intelligent recommendations based on user data
- Automated workflows handling complexity
- Simple interface hiding complex backend

**❌ Bad:**

- Users forced to handle system complexity
- No automation of repetitive tasks
- Complex interfaces requiring user expertise
- Unnecessary complexity exposed to users

---

## Von Restorff Effect (Isolation Effect)

### Principle

**Items that stand out from the rest are more likely to be remembered.**

Distinctive elements are more memorable and attention-grabbing.

### Applications

- **CTA buttons**: Make primary actions visually distinct
- **Important information**: Highlight critical content
- **Feature promotion**: Make key features stand out
- **Error messages**: Make errors visually distinct

### Implementation Tips

- Use color, size, or position to make important elements stand out
- Create visual contrast for key actions
- Highlight critical information
- Use isolation sparingly—too many highlights lose impact
- Make CTAs and primary actions visually distinct

### Real-World Examples

**✅ Good:**

- Large, colorful "Sign Up" button that stands out
- Highlighted error messages
- Prominent feature callouts
- Distinct styling for primary actions

**❌ Bad:**

- Everything looks the same, no emphasis
- Important elements blend in
- No visual hierarchy or distinction
- Users can't identify primary actions

---

## Zeigarnik Effect

### Principle

**People remember incomplete or interrupted tasks better than completed tasks.**

Users remember unfinished tasks, creating motivation to complete them.

### Applications

- **Progress indicators**: Show incomplete progress to encourage completion
- **Saved drafts**: Remind users of incomplete work
- **Onboarding**: Use incomplete steps to encourage completion
- **Task lists**: Show pending tasks to drive completion

### Implementation Tips

- Show progress indicators for incomplete tasks
- Remind users of unfinished work (saved drafts, incomplete forms)
- Use incomplete states to encourage completion
- Show completion status to motivate users
- Create a sense of progress toward completion

### Real-World Examples

**✅ Good:**

- Progress bars showing incomplete profiles
- "Continue where you left off" prompts
- Incomplete task indicators
- Saved draft notifications

**❌ Bad:**

- No indication of incomplete tasks
- Users forget what they were doing
- No progress tracking
- Lost sense of advancement

---

## Design Implementation Guidelines

### Combining the Laws

When designing interfaces, consider all four laws together:

1. **Fitt's Law** → Make important actions easy to reach and large enough to tap/click
2. **Hick's Law** → Reduce choices to speed up decision-making
3. **Jakob's Law** → Use familiar patterns users already know
4. **Miller's Law** → Group information into chunks of 5-9 items

### Example: Navigation Menu

- **Fitt's Law**: Large tap targets, placed in thumb zone
- **Hick's Law**: Maximum 7 menu items
- **Jakob's Law**: Standard hamburger menu pattern
- **Miller's Law**: Grouped into logical categories

### Example: Form Design

- **Fitt's Law**: Large submit buttons, easy to reach
- **Hick's Law**: Progressive disclosure - show fields step-by-step
- **Jakob's Law**: Standard form layout and validation patterns
- **Miller's Law**: Group related fields, limit fields per section

---

## References

### Core Laws

- Fitt, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement.
- Hick, W. E. (1952). On the rate of gain of information.
- Nielsen, J. (1999). Jakob's Law of Internet User Experience.
- Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information.

### Gestalt Principles

- Wertheimer, M. (1923). Laws of organization in perceptual forms.
- Koffka, K. (1935). Principles of Gestalt psychology.

### Performance & Usability

- Doherty, W. J., & Thadani, A. J. (1982). The economic value of rapid response time.
- Postel, J. (1981). Transmission Control Protocol. RFC 793.

### Memory & Cognition

- Von Restorff, H. (1933). Über die Wirkung von Bereichsbildungen im Spurenfeld.
- Zeigarnik, B. (1927). Über das Behalten von erledigten und unerledigten Handlungen.
- Murdock, B. B. (1962). The serial position effect of free recall.

### Complexity & Simplicity

- Tesler, L. (1984). The law of conservation of complexity.
- Ockham, W. (14th century). Occam's Razor principle.

### Business Principles

- Pareto, V. (1896). Cours d'économie politique.
- Parkinson, C. N. (1955). Parkinson's Law: The Pursuit of Progress.

---

## Quick Checklist

When reviewing or designing a UI, ask:

### Core Interaction Laws

- [ ] **Fitt's Law**: Are primary actions large and easy to reach? (min 44px/48px)
- [ ] **Hick's Law**: Are there too many choices presented at once? (max 7)
- [ ] **Jakob's Law**: Do users need to learn new patterns, or are familiar ones used?
- [ ] **Miller's Law**: Is information grouped into chunks of 5-9 items?

### Visual Design Laws

- [ ] **Law of Proximity**: Are related elements grouped together spatially?
- [ ] **Law of Similarity**: Do similar elements have consistent styling?
- [ ] **Law of Common Region**: Are related items contained within clear boundaries?
- [ ] **Law of Uniform Connectedness**: Are relationships shown with visual connections?
- [ ] **Law of Prägnanz**: Is the design simple and uncluttered?
- [ ] **Aesthetic Usability Effect**: Is the interface visually appealing?

### Performance & Response

- [ ] **Doherty Threshold**: Is system response time under 400ms?
- [ ] **Postel's Law**: Does the interface accept various input formats gracefully?

### User Memory & Attention

- [ ] **Serial Position Effect**: Are important items at the beginning and end of lists?
- [ ] **Von Restorff Effect**: Do primary actions stand out visually?
- [ ] **Zeigarnik Effect**: Are incomplete tasks shown to encourage completion?

### Complexity & Simplicity

- [ ] **Occam's Razor**: Is the simplest solution being used?
- [ ] **Tesler's Law**: Is complexity handled by the system, not the user?
- [ ] **Parkinson's Law**: Are progress indicators showing task completion?

### Prioritization

- [ ] **Pareto Principle**: Are efforts focused on the 20% that provides 80% of value?

---

## Code Implementation Examples

### React/Next.js Example: Applying All Laws

```jsx
// Navigation Menu (Hick's + Miller's Law)
const Navigation = () => {
  const mainItems = menuItems.slice(0, 6); // Max 7 items (Miller's Law)
  const moreItems = menuItems.slice(6);

  return (
    <nav className="flex items-center gap-4">
      {mainItems.map(item => (
        <button
          key={item.id}
          className="px-6 py-3 min-h-[48px] min-w-[48px]" // Fitt's Law: Large tap target
        >
          {item.icon && <Icon name={item.icon} />} {/* Jakob's Law: Standard icons */}
          {item.label}
        </button>
      ))}
      {moreItems.length > 0 && (
        <DropdownMenu items={moreItems} /> {/* Hick's Law: Progressive disclosure */}
      )}
    </nav>
  );
};

// Form with Chunking (Miller's Law + Hick's Law)
const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const steps = [
    { id: 1, fields: fields.slice(0, 5), title: "Personal Information" },
    { id: 2, fields: fields.slice(5, 10), title: "Contact Details" },
    { id: 3, fields: fields.slice(10, 15), title: "Preferences" }
  ];

  return (
    <form>
      <StepIndicator current={step} total={steps.length} />
      <div className="space-y-4">
        {steps[step - 1].fields.map(field => (
          <FormField key={field.id} {...field} />
        ))}
      </div>
      <button
        className="px-8 py-4 min-h-[48px] text-lg" // Fitt's Law: Large CTA
        onClick={() => setStep(step + 1)}
      >
        Next Step
      </button>
    </form>
  );
};
```

### CSS Example: Thumb-Friendly Zone (Fitt's Law)

```css
/* Mobile: Place buttons in thumb zone */
@media (max-width: 768px) {
  .primary-actions {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 16px;
    min-height: 48px;
    min-width: 48px;
  }

  /* Large tap targets */
  .mobile-button {
    min-height: 48px;
    min-width: 48px;
    padding: 12px 24px;
  }
}
```

---

## Testing Your Design

### Quick Test Questions

1. **Fitt's Law Test**: Can a user with limited dexterity easily tap all interactive elements?
2. **Hick's Law Test**: How many decisions does a user make on the homepage? (Should be < 7)
3. **Jakob's Law Test**: Can a new user understand the interface without reading instructions?
4. **Miller's Law Test**: Count visible menu items, form fields, or list items. Are there > 7?

### User Testing Scenarios

- **Task Completion**: Time to complete primary task (should be fast)
- **Error Rate**: Number of accidental clicks or wrong selections
- **Cognitive Load**: User feedback on interface complexity
- **Learnability**: First-time user success rate
