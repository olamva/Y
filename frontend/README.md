# Frontend for Y

A React TS + Vite frontend for Y.

## Table of Contents

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Access to NTNU's network

## Installation

1. Clone the repository:
   ```bash
   git clone https://git.ntnu.no/IT2810-H24/T06-Project-2
   cd T06-Project-2/frontend
   ```
2. Install dependencies:
   ```bash
    npm install
   ```

### Running the server

Start the development server with:

```bash
npm run dev
```

```
npm install
```

og

```
npm run dev
```

## Testing

The project includes unit and integration tests. To run tests, execute the following command:

```bash
npm run test
```

## Test Structure

Tests are organized by components, with each component having its own test file. For example:

- Footer component tests: test/components/Footer.test.tsx
- LoginForm component tests: test/components/LoginForm.test.tsx
- Navbar component tests, including:
- Dropdown menu: test/components/Navbar/DropdownMenu.test.tsx
- Navbar itself: test/components/Navbar/Navbar.test.tsx
- Theme toggle: test/components/Navbar/ThemeToggle.test.tsx
- Post component tests, including:
- Post body: test/components/Post/PostBody.test.tsx
- Post content: test/components/Post/PostContent.test.tsx

Additional setup configurations are in test/setup.ts.
