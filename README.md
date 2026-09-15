# ⚡ SkillChain

<div align="center">
  <img src="assets/images/img.png" alt="SkillChain Logo" width="120" height="120" style="border-radius: 28px;" />
  <h3>Decentralized Web3 Freelance Protocol & Social Builder Network on Solana</h3>
  <p>Connect, collaborate, and transact with verified Web3 developers and employers using non-custodial MPC wallets and on-chain escrow milestones.</p>

  <p>
    <img src="https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana" />
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
    <img src="https://img.shields.io/badge/Privy-18181B?style=for-the-badge&logo=privy&logoColor=white" alt="Privy" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

---

## 📖 Overview

**SkillChain** is a cross-platform Web3 application designed for the decentralized gig economy. It bridges high-caliber blockchain talent (Smart Contract Engineers, Protocol Auditors, UI/UX Designers, DeFi Architects) with Web3 protocols, DAOs, and founders.

Built with **React Native (Expo SDK 54)**, **Privy Authentication**, **Supabase Backend**, and **Solana Web3**, SkillChain delivers an intuitive mobile-first experience with enterprise-grade blockchain security.

---

## ✨ Key Features

### 🔐 1. Seamless Web3 Authentication & Embedded Wallets
* **Privy Email OTP Login**: Passwordless onboarding with a 90-day persistent session token.
* **Embedded MPC Wallets**: Automatically provisions non-custodial Solana (`ed25519`) and Ethereum (`secp256k1`) wallets for every authenticated user upon signup.
* **Solana Mobile Wallet Adapter (MWA)**: One-tap authorization and transaction signing with external wallets (Phantom, Solflare).
* **On-Chain SOL Transfers & Tipping**: Native `@solana/web3.js` integration for instant tipping on posts and peer-to-peer milestone settlements.

### 🌐 2. Interactive Feed & Social Discovery
* **Dynamic Feed Streaming**: Live Supabase database synchronization for posts, comments, likes, and reposts.
* **Multi-Image Carousels**: Swipeable image galleries with native aspect ratios and lightbox previews.
* **Accurate Creator Attribution**: Automatic author profile mapping ensuring verified handles, avatars, and Solana settlement addresses are preserved.
* **Hashtag Filtering & Rich Text**: Tap `#Rust`, `#Solana`, `#Anchor`, or `#DeFi` to instantly filter relevant updates.
* **Integrated SOL Tipping**: Send instant tips to post authors directly from your embedded or connected wallet.

### 💼 3. Web3 Jobs, Gigs & Bounties Marketplace
* **Escrow-Secured Gigs**: Browse fixed-price bounties, hourly contracts, and full-time Web3 opportunities.
* **Proposal & CV Submission**: Attach verified credential documents (PDFs, resumes, audit certificates) directly to job applications.
* **Post a Bounty / Job**: Clients can publish detailed deliverables, technical requirements, and budget ranges in SOL/USDC.
* **Job Bookmarks & Filters**: Save listings to your private bookmarked drawer for offline review.

### 💬 4. Real-Time Chat & Builder Communities
* **Direct Messaging**: 1-on-1 direct conversations between clients and freelancers.
* **Community Channels**: Dedicated group rooms (e.g. *#Solana Ecosystem*, *#Anchor Rust Developers*, *#Security & Audits*).
* **Swipeable Chat Actions**: Native swipe gestures for quick replies and message actions.

### 👤 5. Verified Credentials & On-Chain Portfolio
* **Proof-of-Work Portfolios**: Showcase completed dApps, smart contract audits, and GitHub repos.
* **On-Chain Verification**: Badges backed by Solana transaction signatures (`txHash`).
* **Document Management**: Centralized repository for CVs, cover letters, and professional certificates.

### 🛡️ 6. Hardened Database Row Level Security (RLS)
* Comprehensive PostgreSQL RLS policies enforcing strict ownership across all tables:
  * Users can only edit/delete their own profile, posts, comments, and job listings.
  * Public read access is preserved for the decentralized discovery feed.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile Runtime** | React Native `0.81.5`, Expo SDK `54`, Expo Router `v6` (File-based routing) |
| **Styling & UI** | React Native Stylesheet, Lucide Icons (`lucide-react-native`), React Native Reanimated `3.17.4`, React Native SVG |
| **Authentication** | Privy SDK (`@privy-io/expo`) with MPC Embedded Wallets & Passkeys |
| **Blockchain** | `@solana/web3.js`, `@solana/spl-token`, `@solana-mobile/mobile-wallet-adapter-protocol`, `ethers` v5 |
| **Database & Storage** | Supabase PostgreSQL (`@supabase/supabase-js`) with Row Level Security (RLS) |
| **State & Caching** | React Context (`AppContext.tsx`), SWR In-Memory & AsyncStorage Layer (`Cache.ts`) |

---

## 📁 Repository Structure

```
SkillChain/
├── app/                          # Expo Router file-based pages
│   ├── (auth)/                   # Login & Signup screens
│   │   ├── login.tsx             # Email OTP Login
│   │   └── signup.tsx            # New account creation
│   ├── (tabs)/                   # 5 Bottom Tab Screens
│   │   ├── index.tsx             # Home Feed & Stream
│   │   ├── discover.tsx          # Talent Directory & Communities
│   │   ├── jobs.tsx              # Jobs & Gigs Marketplace
│   │   ├── chat.tsx              # Direct & Community Chats
│   │   └── profile.tsx           # User Profile & Portfolio
│   ├── _layout.tsx               # Root application layout with PrivyProvider & Theme listener
│   ├── chat-detail.tsx           # 1-on-1 Chat view
│   ├── post-job.tsx              # Post a New Job / Bounty
│   ├── settings.tsx              # User preferences & account management
│   └── wallet-settings.tsx       # Live Solana/EVM balances & On-Chain Send SOL
├── components/                   # Modular UI Components
│   ├── Auth/                     # Onboarding wizard, OTP verification modal
│   ├── Chat/                     # Swipeable messages, conversation bubbles
│   ├── Common/                   # Shared empty states, share sheets, SkillChain logos
│   ├── Discover/                 # Community chat rooms, talent filter chips
│   ├── Home/                     # PostCard, CreatePostModal, Image carousels
│   ├── Jobs/                     # JobCard, JobApplicationDrawer, Filter sheets
│   ├── Profile/                  # Document uploads, EditProfileModal, Portfolio cards
│   ├── Splash/                   # SkillChain animated splash screen
│   └── Wallet/                   # Phantom & Embedded Solana Wallet drawer
├── constants/                    # Supabase client, Theme palettes, Cache SWR
├── context/                      # AppContext (Global state, auth sync, SOL balance)
├── data/                         # Mock data & infinite scroll feeds
├── android/                      # Native Android project (Gradle, Kotlin)
├── ios/                          # Native iOS project (Xcode, Swift)
├── migration.sql                 # Complete database setup script
├── supabase_rls_secure.sql       # Hardened Row Level Security (RLS) policies
└── types.ts                      # TypeScript interfaces & domain models
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: `v18.x` or `v20.x`
* **npm** or **yarn** / **pnpm**
* **Expo Go** app on Android/iOS (or Android Studio / Xcode for native emulator builds)

### 1. Clone the Repository
```bash
git clone https://github.com/Ukpatu-Mimin/SkillChain.git
cd SkillChain
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Supabase & Privy
Ensure your API keys are configured in `constants/Supabase.ts` and `app/_layout.tsx`:
* `EXPO_PUBLIC_SUPABASE_URL`
* `EXPO_PUBLIC_SUPABASE_ANON_KEY`
* `EXPO_PUBLIC_PRIVY_APP_ID`
* `EXPO_PUBLIC_PRIVY_CLIENT_ID`

### 4. Run Database Migrations
Execute [`supabase_rls_secure.sql`](supabase_rls_secure.sql) in your **Supabase Dashboard -> SQL Editor** to establish database tables and activate Row Level Security.

### 5. Start the Development Server
```bash
npx expo start -c
```
* Press **`a`** to launch on an Android emulator or connected device.
* Press **`w`** to run in the Web browser.
* Scan the QR code with **Expo Go** on your physical Android/iOS phone.

---

## 📱 Building the Native Android APK

To generate a standalone release APK:
```bash
cd android
./gradlew assembleRelease
```
The output APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🔒 Security & Privacy

* **Zero Plaintext Private Keys**: Privy MPC architecture ensures private keys are partitioned; no raw keys are ever stored on device storage or databases.
* **Row Level Security (RLS)**: Enforced on all tables. Only authorized users can update their own data.
* **Sanitized Inputs**: All user submissions (markdown, handles, URLs) are validated and sanitized before database persistence.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>SkillChain</b> — Empowering the Global Web3 Workforce on Solana 🚀
</div>
