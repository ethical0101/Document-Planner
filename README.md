# Document Planner

Document Planner is a real-time collaborative document workspace. Teams create
workspaces, write in a block-based editor, discuss content in comment threads with
@mentions, and get notified when something changes. It works on phones, tablets and
desktops.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firestore-12-FFCA28?logo=firebase&logoColor=black)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF)
![Liveblocks](https://img.shields.io/badge/Realtime-Liveblocks-black)

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Data model](#data-model)
- [Available scripts](#available-scripts)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Authentication**: sign in and sign up with Clerk (email, social providers),
  with protected routes for the dashboard and workspaces.
- **Organizations**: switch between a personal account and team organizations.
  Each one has its own list of workspaces.
- **Workspaces**: create workspaces with a name, an emoji and a cover image. You
  can show them as a grid or a list.
- **Documents**: create, rename, delete and share documents inside a workspace,
  and give each document its own emoji and cover.
- **Rich block editor**: built on [Editor.js](https://editorjs.io/), with
  headings, paragraphs, lists, checklists, tables, code blocks, alerts, delimiters
  and images.
- **Real-time sync and autosave**: changes are debounced, saved to Firestore and
  shown live to everyone who has the document open.
- **Comments and @mentions**: threaded comments powered by Liveblocks, where you
  can mention teammates.
- **Notifications inbox**: an unread counter and a list of comment and mention
  notifications.
- **Shareable links**: copy a direct link to any document in one click.
- **Responsive UI**: the sidebar becomes a slide-in drawer on mobile, and the
  headers, dialogs, editor, comments panel and notifications adapt to small
  screens.

## Tech stack

| Area           | Technology                                                              |
| -------------- | ----------------------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org/) (App Router, Turbopack)               |
| UI             | React 19, [Tailwind CSS 4](https://tailwindcss.com/), shadcn/ui, Radix UI |
| Icons          | [lucide-react](https://lucide.dev/)                                     |
| Authentication | [Clerk](https://clerk.com/)                                             |
| Database       | [Cloud Firestore](https://firebase.google.com/docs/firestore)           |
| Real-time      | [Liveblocks](https://liveblocks.io/) (comments, mentions, notifications) |
| Editor         | [Editor.js](https://editorjs.io/) with plugins                          |
| Notifications  | [Sonner](https://sonner.emilkowal.ski/) toasts                          |

## Project structure

```
.
├── app/
│   ├── (auth)/                     # Clerk sign-in / sign-up pages
│   ├── (routes)/
│   │   ├── createworkspace/        # Create a new workspace
│   │   ├── dashboard/              # Workspace overview (grid / list)
│   │   └── workspace/
│   │       ├── [workspaceid]/      # Workspace layout + document pages
│   │       └── _components/        # Sidebar, editor, comments, notifications...
│   ├── _components/                # Landing page, logo, pickers, auth layout
│   ├── api/liveblocks-auth/        # Authorizes users for Liveblocks rooms
│   ├── Room.jsx                    # Liveblocks providers
│   ├── globals.css                 # Tailwind CSS 4 theme and global styles
│   └── layout.js                   # Root layout (Clerk, fonts, toaster)
├── components/ui/                  # shadcn/ui components
├── config/firebaseConfig.js        # Firebase initialization
├── lib/                            # Shared helpers (documents, workspaces, utils)
├── public/Assets/                  # Logo, cover images and illustrations
├── proxy.js                        # Clerk route protection (Next.js proxy)
└── next.config.mjs
```

## Getting started

### Prerequisites

- **Node.js 20.9 or newer** and npm
- A [Clerk](https://dashboard.clerk.com/) application
- A [Firebase](https://console.firebase.google.com/) project with Cloud Firestore enabled
- A [Liveblocks](https://liveblocks.io/dashboard) project

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ethical0101/Document-Planner.git
   cd Document-Planner
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file from the template and fill in your keys (see
   [Environment variables](#environment-variables)):

   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Create a `.env.local` file in the project root. **Never commit this file.** It is
already listed in `.gitignore`.

| Variable                                | Required | Description                                                  |
| --------------------------------------- | -------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`     | Yes      | Clerk publishable key                                        |
| `CLERK_SECRET_KEY`                      | Yes      | Clerk secret key (server only)                               |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`         | Yes      | Sign-in route, e.g. `/sign-in`                               |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`         | Yes      | Sign-up route, e.g. `/sign-up`                               |
| `NEXT_PUBLIC_FIREBASE_API_KEY`          | Yes      | Firebase web API key                                         |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`       | No       | Use your own Firebase project (along with the other `NEXT_PUBLIC_FIREBASE_*` values) |
| `LIVEBLOCK_SK`                          | Yes      | Liveblocks secret key (server only)                          |

See [`.env.example`](.env.example) for the full list.

## Data model

Firestore collections used by the app:

| Collection           | Document id      | Fields                                                                  |
| -------------------- | ---------------- | ----------------------------------------------------------------------- |
| `Workspace`          | workspace id     | `id`, `workspaceName`, `emoji`, `coverImage`, `createdBy`, `orgId`      |
| `workspaceDocuments` | document id      | `id`, `workspaceId`, `documentName`, `emoji`, `coverImage`, `createdBy` |
| `documentOutput`     | document id      | `docId`, `output` (Editor.js JSON), `editedBy`                          |
| `DocPlannerUsers`    | user email       | `name`, `email`, `avatar` (used for mentions and comment authors)       |

`orgId` is the active Clerk organization id, or the user's email address for
personal workspaces. Each Liveblocks room id matches its document id.

## Available scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create an optimized production build |
| `npm run start` | Run the production build             |

## Deployment

The easiest way to deploy is [Vercel](https://vercel.com/new):

1. Import the repository into Vercel.
2. Add every variable from [Environment variables](#environment-variables) in
   **Project → Settings → Environment Variables**.
3. Add your production domain to the allowed origins in Clerk.
4. Deploy.

Any platform that supports Next.js 16 on Node.js 20.9 or newer works as well.

## Security

- All dependencies are kept on patched versions. `npm audit` reports
  **0 vulnerabilities**.
- Secrets live only in environment variables. `.env*` files are git-ignored, and
  `.env.example` contains placeholders only.
- The `/dashboard`, `/workspace`, `/createworkspace` and `/api/liveblocks-auth`
  routes require a signed-in Clerk user.
- The Liveblocks auth endpoint grants access to a document's room only after it
  checks that the user owns the workspace or belongs to the workspace's
  organization.
- **Firestore rules:** the app reads and writes Firestore from the browser.
  Configure [Firestore security rules](https://firebase.google.com/docs/firestore/security/get-started)
  for your project before going to production. For the strongest setup, connect
  Clerk to Firebase Authentication
  ([guide](https://clerk.com/docs/integrations/databases/firebase)) and restrict
  access by user and organization in your rules.

If you find a security issue, please open a private security advisory on GitHub
instead of a public issue.

## Contributing

Contributions are welcome:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a pull request.

## License

This project is licensed under the MIT License.
