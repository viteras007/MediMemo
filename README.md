# MediMemo - AI-Powered Medical Report Interpreter

Upload your medical reports and get clear, easy-to-understand explanations powered by AI.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page (public)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── dashboard/
│       ├── page.tsx          # Upload page
│       └── layout.tsx        # Dashboard layout
├── components/
│   └── ui/                   # shadcn/ui components
└── lib/
    └── utils.ts              # Utility functions
```

## 🔄 Navigation Flow

1. **Landing Page** (`/`) - Public marketing page
   - Hero section with value proposition
   - Feature cards explaining the process
   - "Get Started" and "Sign In" buttons → Dashboard
2. **Dashboard** (`/dashboard`) - Upload functionality
   - Clean upload interface
   - "Sign Out" button → Landing page

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) to see the landing page

## 📱 Routes

- `/` - Landing page (public)
- `/dashboard` - Upload page

## 🎯 Next Steps

- [ ] Implement file upload functionality
- [ ] Add AI analysis with Together.ai
- [ ] Create results display page
- [ ] Add proper GitHub and LinkedIn icons
- [ ] Implement error handling and loading states
- [ ] Add proper authentication (Clerk, Auth0, etc.)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Together.ai (Qwen 2.5 72B)
- **Deployment**: Vercel
