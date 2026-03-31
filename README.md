# 🎯 MathQuest — Adaptive Quiz Engine

A full-stack **gamified adaptive math quiz platform** powered by Google Gemini AI. Built with Next.js 14, MongoDB, Tailwind CSS, and NextAuth.js.

---

## 🚀 Features

- **AI-Generated Questions** — Google Gemini generates unique MCQs every session
- **Adaptive Difficulty** — Easy → Medium → Hard based on your speed & accuracy
- **Full Gamification** — XP, levels, badges, daily streaks, leaderboard
- **13 Math Topics** — Arithmetic, Algebra, Geometry, Mensuration, Trigonometry, and more
- **Instant Feedback** — Step-by-step AI explanations after every answer
- **Sound Effects** — Web Audio API sound feedback (correct/wrong/timeout)
- **Dark Theme** — Beautiful glassmorphism UI with Framer Motion animations
- **Mobile First** — Fully responsive design

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 App Router |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v5 (credentials + JWT) |
| AI | Google Gemini 1.5 Flash |
| Styling | Tailwind CSS v3 + Framer Motion |
| Validation | Zod |

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.local.example` to `.env.local` and fill in:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/adaptive_quiz
GEMINI_API_KEY=your_gemini_api_key
NEXTAUTH_SECRET=your_random_secret_32chars_minimum
NEXTAUTH_URL=http://localhost:3000
```

**How to get each:**
- `MONGODB_URI`: Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas), then go to Connect → Connect your application
- `GEMINI_API_KEY`: Visit [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` in terminal, or use any 32+ char random string

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```
Set the same environment variables in your Vercel project settings.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── auth/register/        # User registration
│   │   ├── quiz/question/        # Gemini question generation
│   │   ├── quiz/submit/          # Save quiz & award XP
│   │   ├── leaderboard/          # Global rankings
│   │   ├── dashboard/            # Dashboard stats
│   │   └── user/profile/         # User profile CRUD
│   ├── dashboard/                # Dashboard page
│   ├── topics/                   # Topic selection
│   ├── quiz/                     # Quiz engine
│   ├── results/                  # Post-quiz results
│   ├── leaderboard/              # Leaderboard
│   ├── profile/                  # User profile
│   ├── login/                    # Login
│   └── register/                 # Register
├── components/
│   └── layout/Navbar.js
├── lib/
│   ├── mongodb.js                # DB connection
│   ├── gemini.js                 # AI integration
│   └── gamification.js           # XP, badges, levels
├── models/
│   ├── User.js
│   ├── QuizAttempt.js
│   └── Performance.js
├── auth.js                       # NextAuth config
└── middleware.js                 # Route protection
```

---

## 🎮 How to Play

1. **Register/Login** — Create your account
2. **Pick a Topic** — Choose from 13 math topics
3. **Select Difficulty** — Easy, Medium, or Hard (adapts automatically!)
4. **Answer Questions** — Race against the timer for speed bonuses
5. **Earn XP & Badges** — Build your streak, climb the leaderboard

---

## 🏅 Badges

| Badge | How to Earn |
|-------|------------|
| ⚡ Speed Master | Answer 5 questions in under 5 seconds |
| 🎯 Accuracy King | Maintain 90%+ accuracy over 20 questions |
| 🔥 Streak Legend | 7-day daily login streak |
| 🏆 Topic Expert | 100% accuracy on a topic |
| 🌟 First Steps | Complete your first quiz |
| 💎 Hard Mode Hero | Answer 10 hard questions correctly |

---

## 📝 License

MIT — Free to use and modify.
