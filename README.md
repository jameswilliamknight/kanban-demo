# Kanban Demo

A simple Kanban board implementation using React, Vite, TypeScript, and @dnd-kit for drag-and-drop functionality. Note, almost everything in this repo is AI generated, it's my first pass at a PoC before moving into my main app.

## Features

- Drag and drop tasks between lists
- Create new tasks in any list
- Edit tasks with double-click
- Delete tasks
- Keyboard shortcuts (Ctrl/Cmd + Enter to save/create)
- Modern React with TypeScript
- Styled with Tailwind CSS
- State management with Zustand
- Persistent storage with localStorage

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Project Structure

- `src/components/` - React components
  - `Task.tsx` - Individual task component with drag, edit, and delete functionality
  - `List.tsx` - List component that contains tasks
  - `KanbanBoard.tsx` - Main board component with DnD context
  - `CreateTask.tsx` - Task creation component
- `src/store/` - Zustand store
  - `kanbanStore.ts` - Central state management with persistence
- `src/types/` - TypeScript types
  - `kanban.ts` - Shared types and constants

## Working Patterns

### DnD-Kit Integration

- Use `useSortable` for draggable items
- Configure drag activation constraints in `KanbanBoard`
- Disable drag during edit mode
- Handle event conflicts between drag and click/double-click

### State Management

- Use Zustand for centralized state
- Persist state in localStorage
- Track sync status and versions
- Keep state updates immutable

### Component Patterns

- Double-click to edit
- Keyboard shortcuts for common actions
- Separate drag handle from content when needed
- Use proper event propagation control
- Debug with console messages during development

### Styling

- Use Tailwind for responsive design
- Maintain consistent spacing and colors
- Use transitions for smooth interactions
- Handle hover and active states

### TypeScript Best Practices

- Define clear interfaces for props and state
- Use type inference where possible
- Export shared types from central location
- Use strict type checking

### Development Tips

1. Watch the console for debug messages when troubleshooting events
2. Test both mouse and keyboard interactions
3. Verify state updates in React DevTools
4. Check localStorage persistence after changes
5. Test edge cases like rapid interactions
6. Consider mobile touch interactions

## Common Issues & Solutions

1. **DnD vs Double-Click**: Handle by using activation constraints and proper event handling
2. **Event Propagation**: Use `stopPropagation` and `preventDefault` appropriately
3. **State Updates**: Ensure immutable updates in Zustand store
4. **Type Safety**: Use TypeScript's strict mode and proper type definitions
5. **Layout Issues**: Use Tailwind's responsive classes and proper containment
