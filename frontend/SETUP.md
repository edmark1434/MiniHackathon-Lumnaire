# React Router v7 + Tailwind CSS v4 Setup

Quick setup guide for creating a modern React app with React Router v7 and Tailwind CSS v4.

---

## Initial Setup

### 1️⃣ Create React Router Project

```bash
npx create-react-router@latest my-app
cd my-app
npm install
```

When prompted:
- Choose **TypeScript** or **JavaScript** (this template uses TypeScript)
- Select your preferred package manager (npm/yarn/pnpm)

### 2️⃣ Install Tailwind v4

```bash
npm install tailwindcss @tailwindcss/vite
```

### 3️⃣ Configure Vite

Edit `vite.config.ts` (or `vite.config.js`):

```ts
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
```

> **Note:** Add `tailwindcss()` as the first plugin in the array.

### 4️⃣ Add Tailwind to CSS

Edit `app/app.css`:

```css
@import "tailwindcss";
```

### 5️⃣ Start Dev Server

```bash
npm run dev
```

Visit `http://localhost:5173/` to see your app.

---

## Clean Template (Recommended)

Remove default React Router welcome components for a minimal setup:

### PowerShell (Windows):
```powershell
Remove-Item "app\welcome\logo-dark.svg" -Force
Remove-Item "app\welcome\logo-light.svg" -Force
Remove-Item "app\welcome\welcome.tsx" -Force
Remove-Item "app\welcome" -Force
```

### Bash (Mac/Linux):
```bash
rm -rf app/welcome
```

### Update Home Route

Replace `app/routes/home.tsx`:

```tsx
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hello World" },
    { name: "description", content: "A minimal React app" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900">
        Hello World
      </h1>
    </div>
  );
}
```

### Simplify CSS

Replace `app/app.css` with just:

```css
@import "tailwindcss";
```

---

## Project Structure

```
my-app/
├── app/
│   ├── routes/          # File-based routing
│   │   └── home.tsx     # Homepage route
│   ├── app.css          # Global styles
│   ├── root.tsx         # Root layout
│   └── routes.ts        # Route configuration
├── public/              # Static assets
├── vite.config.ts       # Vite configuration
└── package.json
```

---

## Key Features

- ✅ **React Router v7** - Modern file-based routing with SSR support
- ✅ **Tailwind CSS v4** - CSS-first, no PostCSS config needed
- ✅ **TypeScript** - Full type safety (optional)
- ✅ **Vite** - Lightning-fast HMR and builds
- ✅ **No config files required** - Minimal setup, maximum productivity

---

## Key Points

- **No PostCSS config needed** - Tailwind v4 is CSS-first
- **No Tailwind config required** - Optional if you need custom themes
- **Single import** - Just `@import "tailwindcss";`
- **File-based routing** - Create routes by adding files to `app/routes/`

---

## Adding New Routes

Create a new file in `app/routes/`:

```tsx
// app/routes/about.tsx
export default function About() {
  return <h1>About Page</h1>;
}
```

Access at: `http://localhost:5173/about`

---

## Troubleshooting

**Classes not working?**
- Restart dev server (`Ctrl+C` then `npm run dev`)
- Ensure `app.css` is imported in `root.tsx`
- Verify `tailwindcss()` is in `vite.config.ts` plugins array

**TypeScript errors?**
```bash
npm run typecheck
```

**Need a Tailwind config file?**
```bash
npx tailwindcss init
```

---

## Build for Production

```bash
npm run build
npm run start
```

The build output will be in the `build/` directory.
