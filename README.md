# Smart To-Do

A clean, responsive task-management dashboard designed to help users organize tasks, prioritize work, and focus on what matters most.

## Overview

Smart To-Do provides a workspace for capturing tasks, tracking completion, and planning next steps. The interface includes a productivity summary, task filters, search, priority labels, due dates, and a focus panel.

## Features

- **Task creation:** Add a title, optional notes, due date, priority, and category.
- **Task management:** Edit tasks, mark them complete, or delete them after confirmation.
- **Search:** Search task titles, notes, and categories.
- **Filters:** View all tasks, tasks due today, upcoming tasks, or completed tasks.
- **Priority labels:** Distinguish High, Medium, and Low priority tasks.
- **Smart plan:** Display up to three recommended incomplete tasks, sorted by due date and priority.
- **Focus mode:** Highlight the recommended task.
- **Responsive layout:** Designed to adapt to smaller screens.
- **Accessible interactions:** Includes form labels, live status messages, and visible keyboard-focus styles.

## Project Structure

```text
smart_todo_separated/
├── index.html   # Page structure and interface
├── style.css    # Custom CSS styles
├── script.js    # Task rendering and interaction logic
└── README.md    # Project documentation
```

## Getting Started

1. Download and extract the ZIP archive, or download the files individually.
2. Keep `index.html`, `style.css`, `script.js`, and `README.md` in the same folder.
3. Open `index.html` in a modern web browser.

> **Important:** The original application uses an external `window.dataSdk` service to load and save task data. These separated files preserve that dependency. If your hosting or runtime environment does not provide this service, task loading and create/update/delete operations will not work until a compatible data SDK is configured.

## Technologies Used

- **HTML5** — page structure and semantic elements.
- **CSS3** — styling, layout, transitions, and responsive behavior.
- **JavaScript** — task rendering, sorting, forms, filters, search, and focus interactions.
- **Tailwind CSS CDN** — utility classes used by the interface.
- **Lucide Icons CDN** — interface icons.
- **Google Fonts** — DM Sans and Fraunces typography.

## External Resources

The HTML file loads these resources over the internet:

- Tailwind CSS: `https://cdn.tailwindcss.com/3.4.17`
- Lucide: `https://cdn.jsdelivr.net/npm/lucide@0.577.0/dist/umd/lucide.min.js`
- Google Fonts stylesheet for DM Sans and Fraunces

An internet connection is required for CDN-hosted assets unless they are downloaded and configured locally.

## How to Use

1. Enter a task title.
2. Optionally add notes, a due date, a priority, and a category.
3. Select **Add task**.
4. Use the search field or filter buttons to find tasks.
5. Mark a task complete using its checkbox.
6. Use the edit icon to update task information.
7. Use the delete icon and confirm to remove a task.
8. Select **Start focus** to highlight the recommended incomplete task.

## Task Sorting

Incomplete tasks appear before completed tasks. Tasks are then sorted by due date, priority (High, Medium, Low), and creation time when available. Tasks without a due date are placed after tasks with a due date.

## Customization

- Edit `style.css` to change colors, typography, spacing, and responsive styles.
- Edit `index.html` to change page content and layout.
- Edit `script.js` to change sorting, filtering, and task interactions.

Keep the file references in `index.html` unchanged unless you also update the filenames or paths:

```html
<link rel="stylesheet" href="style.css">
<script src="script.js" defer></script>
```

## Known Limitations

- Task persistence depends on the external `window.dataSdk` service included in the original application.
- The date used for task filters is defined as a constant in `script.js`; update it if the app should always use the current local date.
- CDN-hosted resources require an internet connection unless self-hosted.

## Contributing

You can copy and customize this project for personal or educational use. After making changes, test task creation, editing, completion, deletion, filtering, and responsive layouts.

## License

No license has been specified for this project. Add a `LICENSE` file before distributing or reusing the project publicly if you want to define its permitted use.

---

**Smart To-Do** — Make room for what matters. One clear next step at a time.
