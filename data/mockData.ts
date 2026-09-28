import { UserProfile, Post, Job, JobApplication, Conversation, ChatMessage, DirectPayment, WalletTransaction, NotificationItem, Review, CommunityGroup, CommunityMessage } from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user_me',
    name: 'Alex Rivera',
    handle: '@alexrivera_sol',
    email: 'alex@skillchain.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: 'Senior Solana Smart Contract Engineer',
    bio: 'Building high-performance DeFi protocols and smart contracts on Solana. 5+ years in Rust & Web3 architecture.',
    isVerified: true,
    walletAddress: '7Xw9...4Kp9mN2q8Xv1',
    hourlyRateSol: 2.5,
    rating: 4.98,
    reviewCount: 34,
    skills: ['Rust', 'Anchor Framework', 'Solana Web3.js', 'TypeScript', 'DeFi', 'OtterSec Audit'],
    chains: ['Solana', 'Monad', 'Ethereum'],
    role: 'both',
    isOnline: true,
    location: 'San Francisco, CA (Remote)',
    jobTypes: ['Remote', 'Contract', 'Full-time'],
    completedJobsCount: 28,
    totalEarnedSol: 340.5,
    joinedDate: 'Jan 2024',
    githubUrl: 'https://github.com/alexrivera-sol',
    twitterUrl: 'https://twitter.com/alexrivera_sol',
    portfolio: [
      {
        id: 'p1',
        title: 'Drift-like DEX Perpetual Engine',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
        description: 'Low latency on-chain orderbook matcher written in Rust Anchor with dynamic slippage controls.',
        tags: ['Rust', 'Solana', 'DeFi']
      },
      {
        id: 'p2',
        title: 'Solana Direct Payment SDK',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        description: 'Open-source library for instant milestone payments on Solana Mainnet with multisig fallback.',
        tags: ['Anchor', 'Payments', 'Security']
      }
    ],
    experience: [
      {
        id: 'e1',
        role: 'Lead Smart Contract Engineer',
        company: 'Solana Labs Ecosystem Grant Project',
        period: '2023 - Present',
        verifiedOnChain: true,
        txHash: '5Kz8m...9Pq1x2',
        description: 'Architected automated yield farming vaults processing over $12M TVL.'
      },
      {
        id: 'e2',
        role: 'Protocol Auditor',
        company: 'Sec3 Audits',
        period: '2022 - 2023',
        verifiedOnChain: true,
        txHash: '3Mn7b...1Qq8z4',
        description: 'Audited 15+ Anchor programs for reentrancy, integer overflow, and PDA seeds vulnerabilities.'
      }
    ],
    credentials: [
      {
        id: 'c1',
        title: 'Solana Certified Program Developer',
        issuer: 'Solana Foundation',
        issuedDate: 'Nov 2023',
        badgeIcon: 'ShieldCheck',
        verifiedOnChain: true,
        txHash: '9Lp0...2Xx7'
      },
      {
        id: 'c2',
        title: 'Rust Security & Audit Specialist',
        issuer: 'OtterSec Academy',
        issuedDate: 'Feb 2024',
        badgeIcon: 'Award',
        verifiedOnChain: true,
        txHash: '8Kj1...4Mv9'
      }
    ],
    coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&auto=format&fit=crop&q=80',
    isOnboarded: true,
    documents: [
      {
        id: 'doc_cv_1',
        type: 'cv',
        title: 'Alex Rivera - Senior Solana Engineer Resume.pdf',
        fileName: 'Alex_Rivera_Solana_CV_2026.pdf',
        fileSize: '420 KB',
        fileUrl: 'https://skillchain.io/docs/alex_cv.pdf',
        uploadedAt: 'Feb 2026',
        isDefault: true,
        verifiedOnChain: true,
        txHash: '5xY9a...p12N',
        description: 'Comprehensive 5-page CV detailing Rust smart contract architecture, OtterSec audit history, and TVL metrics.'
      },
      {
        id: 'doc_cover_1',
        type: 'cover_letter',
        title: 'Senior Web3 Smart Contract Engineer Cover Letter.pdf',
        fileName: 'Alex_Rivera_Cover_Letter.pdf',
        fileSize: '180 KB',
        fileUrl: 'https://skillchain.io/docs/alex_cover.pdf',
        uploadedAt: 'Jan 2026',
        isDefault: true,
        description: 'Tailored cover letter highlighting low-latency DEX experience, Anchor workflows, and team leadership.'
      },
      {
        id: 'doc_cert_1',
        type: 'certificate',
        title: 'Solana Program Developer Level 3 Certificate',
        fileName: 'Solana_Foundation_Dev_Cert.pdf',
        fileSize: '1.2 MB',
        uploadedAt: 'Nov 2023',
        verifiedOnChain: true,
        txHash: '9Lp0...2Xx7',
        description: 'Official verification issued by Solana Foundation for advanced CPIs, PDAs, and Anchor state management.'
      }
    ]
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    handle: '@elena_rust',
    email: 'elena@solstudios.xyz',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    title: 'Anchor Security Auditor',
    bio: 'Auditing Solana smart contracts, Anchor programs & DeFi liquidations. 40+ verified security reports on-chain.',
    isVerified: true,
    walletAddress: '3Mv1...8Kx9p2',
    hourlyRateSol: 2.2,
    rating: 5.0,
    reviewCount: 38,
    skills: ['Security Audits', 'Rust', 'Anchor', 'Smart Contracts', 'DeFi', 'Code Review'],
    chains: ['Solana', 'Monad'],
    role: 'talent',
    isOnline: true,
    location: 'Lisbon, Portugal',
    jobTypes: ['Remote', 'Contract'],
    completedJobsCount: 38,
    totalEarnedSol: 395.0,
    joinedDate: 'Jan 2024',
    portfolio: [
      {
        id: 'p_e1',
        title: 'Solana Perpetual DEX Audit Report',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        description: 'In-depth security audit for a Solana perpetual DEX identifying critical re-entrancy edge cases.',
        tags: ['Anchor', 'SecurityAudit', 'DeFi']
      }
    ],
    experience: [
      {
        id: 'ee1',
        role: 'Lead Security Auditor',
        company: 'Sec3 Audits',
        period: '2023 - Present',
        verifiedOnChain: true,
        txHash: '2Xx7...9Pq0',
        description: 'Audited 25+ Anchor programs on Solana Mainnet.'
      }
    ],
    credentials: [
      {
        id: 'ce1',
        title: 'Certified Anchor Security Specialist',
        issuer: 'OtterSec Guild',
        issuedDate: 'Jan 2024',
        badgeIcon: 'ShieldCheck',
        verifiedOnChain: true,
        txHash: '7Hy3...1Zp9'
      }
    ]
  },
  {
    id: 'user_devin',
    name: 'Devon Chen',
    handle: '@devon_uiux',
    email: 'devon@web3design.dev',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    title: 'Web3 UI/UX Designer',
    bio: 'Crafting slick, high-conversion Web3 dApp experiences, design systems, and responsive React/Tailwind interfaces.',
    isVerified: true,
    walletAddress: '4Lp2...7Qq9m1',
    hourlyRateSol: 2.4,
    rating: 4.9,
    reviewCount: 19,
    skills: ['Frontend', 'Design', 'React', 'UI/UX', 'Tailwind CSS', 'Figma', 'Solana Web3'],
    chains: ['Solana', 'Monad', 'Ethereum'],
    role: 'talent',
    isOnline: true,
    location: 'San Francisco, CA',
    jobTypes: ['Remote', 'Contract', 'Part-time'],
    completedJobsCount: 19,
    totalEarnedSol: 310.0,
    joinedDate: 'Dec 2023',
    portfolio: [],
    experience: [],
    credentials: []
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    handle: '@marcus_hyperion',
    email: 'marcus@hyperioncap.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    title: 'Head of Talent',
    bio: 'Funding and building high-growth Solana ecosystems. Hiring Rust developers, zero-knowledge researchers, and AI agents.',
    isVerified: true,
    walletAddress: '9Pq0...1Kj8x5',
    hourlyRateSol: 0,
    rating: 5.0,
    reviewCount: 19,
    skills: ['Recruiting', 'Venture Capital', 'Tokenomics', 'Community Growth'],
    chains: ['Solana', 'Monad'],
    role: 'client',
    isOnline: false,
    location: 'New York, NY',
    jobTypes: ['Full-time', 'Contract'],
    completedJobsCount: 15,
    totalEarnedSol: 0,
    joinedDate: 'Mar 2024',
    portfolio: [],
    experience: [],
    credentials: []
  },
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    handle: '@sarah_uiux',
    email: 'sarah@web3design.co',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: 'Lead Web3 Product Designer',
    bio: 'Crafting frictionless mobile-first dApp interfaces, design systems, and Web3 user experiences.',
    isVerified: true,
    walletAddress: '8Kj3...2Mm1v4',
    hourlyRateSol: 2.1,
    rating: 4.96,
    reviewCount: 29,
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Tailwind CSS', 'Mobile First'],
    chains: ['Solana', 'Ethereum'],
    role: 'talent',
    isOnline: true,
    location: 'London, UK',
    jobTypes: ['Remote', 'Full-time', 'Contract'],
    completedJobsCount: 24,
    totalEarnedSol: 285.0,
    joinedDate: 'Feb 2024',
    portfolio: [
      {
        id: 'p_s1',
        title: 'Solana Mobile UI Component Kit',
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        description: 'Native component library optimized for React Native and Solana Mobile Stack.',
        tags: ['UI/UX', 'Mobile', 'DesignSystem']
      }
    ],
    experience: [],
    credentials: []
  },
  {
    id: 'user_kai',
    name: 'Kai Tanaka',
    handle: '@kai_solana',
    email: 'kai@solanaship.dev',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    title: 'Senior Solana Infrastructure Lead',
    bio: 'Specializing in high-throughput RPC clusters, Geyser plugins, and Rust Anchor execution optimization.',
    isVerified: true,
    walletAddress: '5Np8...9Qq2z1',
    hourlyRateSol: 2.8,
    rating: 4.99,
    reviewCount: 38,
    skills: ['Rust', 'Geyser Plugin', 'RPC Nodes', 'Anchor', 'Performance Tuning'],
    chains: ['Solana'],
    role: 'talent',
    isOnline: true,
    location: 'Tokyo, Japan',
    completedJobsCount: 36,
    totalEarnedSol: 520.0,
    joinedDate: 'Nov 2023',
    portfolio: [],
    experience: [],
    credentials: []
  },
  {
    id: 'user_amara',
    name: 'Amara Okafor',
    handle: '@amara_audit',
    email: 'amara@certik.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    title: 'Smart Contract Auditor',
    bio: 'Formal verification researcher auditing Solana Anchor programs and MOVE smart contracts.',
    isVerified: true,
    walletAddress: '2Xx9...4Pp1m8',
    hourlyRateSol: 2.6,
    rating: 4.97,
    reviewCount: 19,
    skills: ['Smart Contract Audit', 'Formal Verification', 'Rust', 'Security', 'Anchor'],
    chains: ['Solana', 'Aptos', 'Sui'],
    role: 'talent',
    isOnline: false,
    location: 'Lagos, Nigeria',
    completedJobsCount: 22,
    totalEarnedSol: 310.0,
    joinedDate: 'Jan 2024',
    portfolio: [],
    experience: [],
    credentials: []
  },
  {
    id: 'user_liam',
    name: "Liam O'Connor",
    handle: '@liam_anchor',
    email: 'liam@rustlab.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    title: 'Senior Rust Core Developer',
    bio: 'Author of open-source Anchor macro extensions and high-throughput Solana CPI libraries.',
    isVerified: true,
    walletAddress: '4Kj8...1Mp9z3',
    hourlyRateSol: 2.7,
    rating: 4.99,
    reviewCount: 27,
    skills: ['Rust', 'Anchor Macros', 'CPI', 'Solana Core'],
    chains: ['Solana'],
    role: 'talent',
    isOnline: true,
    location: 'Dublin, Ireland',
    completedJobsCount: 30,
    totalEarnedSol: 380.0,
    joinedDate: 'Feb 2024',
    portfolio: [],
    experience: [],
    credentials: []
  },
  {
    id: 'user_priya',
    name: 'Priya Sharma',
    handle: '@priya_solmobile',
    email: 'priya@solanamobile.dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title: 'Solana Mobile Stack Specialist',
    bio: 'Building seed vault integrations, Web3 auth drawers, and mobile dApp experiences for Saga 2.',
    isVerified: true,
    walletAddress: '8Pq1...3Kj9x2',
    hourlyRateSol: 2.3,
    rating: 4.96,
    reviewCount: 31,
    skills: ['React Native', 'Solana Mobile Stack', 'Seed Vault', 'Mobile UX'],
    chains: ['Solana'],
    role: 'talent',
    isOnline: true,
    location: 'Bangalore, India',
    completedJobsCount: 26,
    totalEarnedSol: 290.0,
    joinedDate: 'Jan 2024',
    portfolio: [],
    experience: [],
    credentials: []
  },
  {
    id: 'user_mateo',
    name: 'Mateo Gomez',
    handle: '@mateo_oracle',
    email: 'mateo@pyth.network',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    title: 'DeFi Oracle Architect',
    bio: 'Designing low-latency Pyth & Switchboard price feeds for Solana DEX perpetuals and lending protocols.',
    isVerified: true,
    walletAddress: '6Mv9...2Xx8p1',
    hourlyRateSol: 2.9,
    rating: 4.98,
    reviewCount: 22,
    skills: ['Pyth Network', 'Oracle Feeds', 'DeFi', 'Rust', 'Switchboard'],
    chains: ['Solana', 'Monad'],
    role: 'talent',
    isOnline: false,
    location: 'Buenos Aires, Argentina',
    completedJobsCount: 20,
    totalEarnedSol: 320.0,
    joinedDate: 'Mar 2024',
    portfolio: [],
    experience: [],
    credentials: []
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    authorId: 'user_elena',
    type: 'general',
    content: 'Just finalized an in-depth security audit for a Solana perpetual DEX! Found 2 critical re-entrancy edge cases in the liquidated account settlement instruction. Check out the verified control flow graph & contract snippets from our report audit below. 🛡️ ⚡',
    hashtags: ['SecurityAudit', 'Solana', 'Anchor', 'CodeReview'],
    mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 35,
    commentsCount: 3,
    repostsCount: 13,
    isLiked: true,
    isReposted: false,
    createdAt: '2 hours ago',
    comments: [
      {
        id: 'c1',
        authorId: 'user_me',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@alexrivera_sol',
        isVerified: true,
        content: 'Great catch on the liquidation settlement PDA checks! Reentrancy in Anchor CPIs is subtle.',
        createdAt: '1 hour ago',
        likes: 8
      },
      {
        id: 'c1_2',
        authorId: 'user_marcus',
        authorName: 'Marcus Vance',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@marcus_hyperion',
        isVerified: true,
        content: 'Impressive breakdown Elena! Will make sure our incubated DEX protocols implement these checks.',
        createdAt: '45m ago',
        likes: 4
      },
      {
        id: 'c1_3',
        authorId: 'user_kai',
        authorName: 'Kai Tanaka',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@kai_solana',
        isVerified: true,
        content: 'Zero-copy layout validation prevents nasty heap memory corruption as well. Top notch audit report!',
        createdAt: '25m ago',
        likes: 6
      }
    ]
  },
  {
    id: 'post_0',
    authorId: 'user_me',
    type: 'general',
    content: 'Shipped an open-source Rust Anchor direct payment SDK on Solana Mainnet today. Includes automatic multi-sig fallback and zero-fee developer verification.',
    hashtags: ['Solana', 'Rust', 'Anchor', 'Web3Dev'],
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 48,
    commentsCount: 2,
    repostsCount: 12,
    isLiked: false,
    isReposted: false,
    createdAt: '30m ago',
    comments: [
      {
        id: 'c0_1',
        authorId: 'user_elena',
        authorName: 'Elena Rostova',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@elena_rust',
        isVerified: true,
        content: 'Loved the multi-sig fallback mechanism. Zero-copy state deserialization made the execution blazingly fast!',
        createdAt: '20m ago',
        likes: 5
      },
      {
        id: 'c0_2',
        authorId: 'user_priya',
        authorName: 'Priya Sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@priya_solmobile',
        isVerified: true,
        content: 'Integrating this into our mobile payment vault today. The TypeScript bindings are super intuitive.',
        createdAt: '10m ago',
        likes: 3
      }
    ]
  },
  {
    id: 'post_3',
    authorId: 'user_devin',
    type: 'portfolio_showcase',
    content: 'Showcase: Implemented private account state compression using Solana Light Protocol! Compressed 100,000 user records into a single 32-byte Merkle root on-chain, cutting storage cost by 99.4%.',
    hashtags: ['ZKProofs', 'Solana', 'Compression', 'Rust'],
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 215,
    commentsCount: 2,
    repostsCount: 52,
    isLiked: true,
    isReposted: true,
    createdAt: '8 hours ago',
    comments: [
      {
        id: 'c3_1',
        authorId: 'user_kai',
        authorName: 'Kai Tanaka',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@kai_solana',
        isVerified: true,
        content: 'State compression on Light Protocol is game changing for micro-transaction games on Solana.',
        createdAt: '6 hours ago',
        likes: 15
      },
      {
        id: 'c3_2',
        authorId: 'user_me',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@alexrivera_sol',
        isVerified: true,
        content: 'How did you handle concurrent tree canopy updates during peak TPS?',
        createdAt: '4 hours ago',
        likes: 9
      }
    ]
  },
  {
    id: 'post_4',
    authorId: 'user_sarah',
    type: 'portfolio_showcase',
    content: 'Portfolio Showcase: Designed and prototyped the complete mobile UI experience for a decentralized AI compute marketplace on Solana. Focused on typography hierarchy, instant feedback states, and dark mode toggles.',
    hashtags: ['Portfolio', 'UIUX', 'Figma', 'SolanaMobile'],
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542744094-3a3172720a8a?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 142,
    commentsCount: 18,
    repostsCount: 35,
    isLiked: true,
    isReposted: false,
    createdAt: '1 day ago',
    comments: [
      {
        id: 'cp1',
        authorId: 'user_me',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@alexrivera_sol',
        isVerified: true,
        content: 'Clean spacing and typography! The wallet drawer transition feels completely native.',
        createdAt: '7 hours ago',
        likes: 12
      }
    ]
  },
  {
    id: 'post_5',
    authorId: 'user_kai',
    type: 'general',
    content: 'Pro Tip for Solana Rust Engineers: Always request Compute Budget units explicitly before complex CPI calls. Saved over 40% in CU overhead on our latest liquidity pool program.',
    hashtags: ['Rust', 'SolanaDev', 'Optimization', 'Anchor'],
    mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 112,
    commentsCount: 15,
    repostsCount: 29,
    isLiked: true,
    isReposted: false,
    createdAt: '2 days ago',
    comments: [
      {
        id: 'c5_1',
        authorId: 'user_elena',
        authorName: 'Elena Rostova',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@elena_rust',
        isVerified: true,
        content: 'Spot on! Also remember to set compute unit price for priority fee prioritization during congested slot intervals.',
        createdAt: '1 day ago',
        likes: 9
      },
      {
        id: 'c5_2',
        authorId: 'user_me',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@alexrivera_sol',
        isVerified: true,
        content: 'We noticed a 45% drop in transaction drop rates after implementing set_compute_unit_limit. Great advice.',
        createdAt: '1 day ago',
        likes: 6
      },
      {
        id: 'c5_3',
        authorId: 'user_liam',
        authorName: "Liam O'Connor",
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@liam_anchor',
        isVerified: true,
        content: 'Are you using the ComputeBudgetInstruction helper in solana-program-test for CI simulation benchmarking?',
        createdAt: '18h ago',
        likes: 4
      }
    ]
  },
  {
    id: 'post_6',
    authorId: 'user_amara',
    type: 'portfolio_showcase',
    content: 'Audit Summary Released: Completed formal verification of a cross-chain liquidity bridge on Solana. Verified invariants for total supply locks, PDA derivation seeds, and token vault authority delegation.',
    hashtags: ['AuditReport', 'FormalVerification', 'Security', 'Solana'],
    mediaUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 98,
    commentsCount: 12,
    repostsCount: 21,
    isLiked: false,
    isReposted: false,
    createdAt: '3 days ago',
    comments: [
      {
        id: 'c6_1',
        authorId: 'user_elena',
        authorName: 'Elena Rostova',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@elena_rust',
        isVerified: true,
        content: 'PDA seed collision tests are mandatory for bridging programs. Super thorough formal verification methodology Amara!',
        createdAt: '2 days ago',
        likes: 7
      },
      {
        id: 'c6_2',
        authorId: 'user_kai',
        authorName: 'Kai Tanaka',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@kai_solana',
        isVerified: true,
        content: 'Did the formal verification model the Solana clock drift edge cases across validator epochs?',
        createdAt: '2 days ago',
        likes: 5
      }
    ]
  },
  {
    id: 'post_7',
    authorId: 'user_liam',
    type: 'general',
    content: 'Released anchor-attribute-plus v2.0! Introduces auto-generated client TS bindings and zero-copy PDA verification macros for Anchor 0.30+.',
    hashtags: ['Rust', 'Anchor', 'MacroLib', 'OpenSource'],
    mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 124,
    commentsCount: 14,
    repostsCount: 28,
    isLiked: true,
    isReposted: false,
    createdAt: '3 days ago',
    comments: [
      {
        id: 'c7_1',
        authorId: 'user_me',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@alexrivera_sol',
        isVerified: true,
        content: 'The macro expansions clean up so much boilerplate in our instruction accounts structs. Starred the repo on GitHub!',
        createdAt: '2 days ago',
        likes: 11
      },
      {
        id: 'c7_2',
        authorId: 'user_priya',
        authorName: 'Priya Sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@priya_solmobile',
        isVerified: true,
        content: 'Does it auto-export type definitions compatible with React Native web3.js v2?',
        createdAt: '1 day ago',
        likes: 4
      }
    ]
  },
  {
    id: 'post_8',
    authorId: 'user_priya',
    type: 'portfolio_showcase',
    content: 'Built a native React Native seed vault drawer component for Solana Saga 2 Mobile devices. Tested with biometric authentication and hardware wallet fallback.',
    hashtags: ['SolanaMobile', 'ReactNative', 'SeedVault', 'MobiledApp'],
    mediaUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 178,
    commentsCount: 22,
    repostsCount: 41,
    isLiked: true,
    isReposted: true,
    createdAt: '4 days ago',
    comments: [
      {
        id: 'c8_1',
        authorId: 'user_sarah',
        authorName: 'Sarah Jenkins',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@sarah_uiux',
        isVerified: true,
        content: 'The fluid gesture-driven bottom drawer feels so buttery smooth on physical Saga devices.',
        createdAt: '3 days ago',
        likes: 8
      },
      {
        id: 'c8_2',
        authorId: 'user_devin',
        authorName: 'Devon Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@devon_uiux',
        isVerified: true,
        content: 'Brilliant work! Mobile Web3 UX is finally catching up with standard consumer fintech.',
        createdAt: '2 days ago',
        likes: 6
      }
    ]
  },
  {
    id: 'post_9',
    authorId: 'user_mateo',
    type: 'general',
    content: 'DeFi Oracle Update: Integrated Pyth Push Oracles onto Solana mainnet for real-time sub-second price updates. Reduced stale feed risks during high volatility events.',
    hashtags: ['Pyth', 'DeFi', 'Oracle', 'Solana'],
    mediaUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 139,
    commentsCount: 17,
    repostsCount: 33,
    isLiked: false,
    isReposted: false,
    createdAt: '5 days ago',
    comments: [
      {
        id: 'c9_1',
        authorId: 'user_elena',
        authorName: 'Elena Rostova',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@elena_rust',
        isVerified: true,
        content: 'Push oracles eliminate stale price arbitrage during flash crashes. Huge improvement for margin health.',
        createdAt: '4 days ago',
        likes: 9
      },
      {
        id: 'c9_2',
        authorId: 'user_kai',
        authorName: 'Kai Tanaka',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@kai_solana',
        isVerified: true,
        content: 'What is the average gas overhead for Pyth push updates compared to switchboard pull feeds?',
        createdAt: '3 days ago',
        likes: 5
      }
    ]
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_kamino',
    title: 'Solana Staking Vault Anchor Program',
    posterId: 'user_kamino',
    posterName: 'Kamino Finance Protocol',
    posterAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    posterCompany: 'Kamino Finance Protocol',
    posterVerified: true,
    jobType: 'REMOTE',
    contractType: 'CONTRACT',
    category: 'contract',
    tag: 'Contractor',
    rateDisplay: '$50 - $85/hour ($5,600 total)',
    location: 'Remote (Worldwide)',
    duration: '2 - 3 weeks',
    payRangeSol: '35 - 55 SOL',
    budgetSol: 45,
    skills: ['Rust', 'Anchor', 'Bankrun', 'TypeScript', 'Automated Testing'],
    chains: ['Solana'],
    description: 'We need an experienced Rust engineer to write a production-ready Anchor program for automated SOL auto-compounding staking vaults with PDA authority delegation and state compression.',
    requirements: [
      '3+ years experience with Rust & Solana Anchor Framework',
      'Solid understanding of Solana PDA seeds and CPI instruction composition',
      'Writing automated test suites using Bankrun and TypeScript'
    ],
    postedAt: '3 hours ago',
    applicantsCount: 6,
    isSaved: true,
    status: 'OPEN'
  },
  {
    id: 'job_superteam',
    title: 'Mobile App React Native & Web3 Adapter',
    posterId: 'user_superteam',
    posterName: 'Superteam DAO',
    posterAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
    posterCompany: 'Superteam DAO',
    posterVerified: true,
    jobType: 'REMOTE',
    contractType: 'CONTRACT',
    category: 'contract',
    tag: 'Contractor',
    rateDisplay: '$40 - $70/hour ($3,500 total)',
    location: 'Remote',
    duration: '3 - 4 weeks',
    payRangeSol: '25 - 40 SOL',
    budgetSol: 30,
    skills: ['React Native', 'TypeScript', 'Solana Web3', 'Mobile UI', 'Expo'],
    chains: ['Solana'],
    description: 'Looking for a skilled React Native developer with Solana Mobile Stack experience to build a native seed vault wallet drawer and transaction signing flow for Saga 2 devices.',
    requirements: [
      'Proven portfolio of shipped React Native mobile apps',
      'Integration experience with Solana Mobile Wallet Adapter (MWA)',
      'Clean UI architecture using Tailwind CSS / NativeWind'
    ],
    postedAt: '1 day ago',
    applicantsCount: 12,
    isSaved: false,
    status: 'OPEN'
  },
  {
    id: 'job_drift',
    title: 'Perpetuals DEX Risk Engine & Liquidator Bot',
    posterId: 'user_drift',
    posterName: 'Drift Ecosystem',
    posterAvatar: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=400&auto=format&fit=crop&q=80',
    posterCompany: 'Drift Foundation',
    posterVerified: true,
    jobType: 'REMOTE',
    contractType: 'MILESTONE-BASED',
    category: 'bounties',
    tag: 'Bounty',
    rateDisplay: '$75 - $110/hour ($8,200 total)',
    location: 'Remote (Worldwide)',
    duration: '4 - 6 weeks',
    payRangeSol: '50 - 75 SOL',
    budgetSol: 60,
    skills: ['Rust', 'Anchor', 'Orderbook', 'DeFi', 'C/C++'],
    chains: ['Solana', 'Monad'],
    description: 'Bounty to develop a high-throughput on-chain liquidator and arbitrage bot using Pyth push oracles and Jito MEV bundles on Solana Mainnet.',
    requirements: [
      'Experience building low-latency trading bots in Rust or Go',
      'Knowledge of Solana Jito block engine and tip accounts',
      'Deep understanding of perpetual margin models and liquidations'
    ],
    postedAt: '2 days ago',
    applicantsCount: 9,
    isSaved: false,
    status: 'OPEN'
  },
  {
    id: 'job_helius',
    title: 'Full-Stack Solana & Next.js Analytics Terminal',
    posterId: 'user_helius',
    posterName: 'Helius Developer Platform',
    posterAvatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
    posterCompany: 'Helius Platform',
    posterVerified: true,
    jobType: 'REMOTE',
    contractType: 'FULL-TIME',
    category: 'full-time',
    tag: 'Full-time',
    rateDisplay: '$60 - $90/hour ($120k - $160k/yr)',
    location: 'Remote',
    duration: 'Full-time',
    payRangeSol: '60 - 90 SOL / month',
    budgetSol: 80,
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Rust'],
    chains: ['Solana'],
    description: 'Join our core engineering team to build high-performance developer dashboards, RPC visualizers, and WebSocket transaction stream analytics.',
    requirements: [
      '4+ years full-stack TypeScript / React development experience',
      'Experience with high-frequency WebSockets and real-time streaming data',
      'Eye for design and typography systems'
    ],
    postedAt: '3 days ago',
    applicantsCount: 15,
    isSaved: false,
    status: 'OPEN'
  }
];

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_1',
    jobId: 'job_1',
    jobTitle: 'Senior Solana Anchor & AI Agent Engineer',
    companyName: 'Hyperion Web3 Ventures',
    applicantId: 'user_me',
    coverLetter: 'Hi Marcus! I have 3+ years writing Anchor smart contracts and recently built a full direct payment program SDK on Solana. Excited to help build the AI Agent platform.',
    proposedRateSol: 50,
    status: 'shortlisted',
    appliedAt: 'Yesterday',
    updatedAt: '2 hours ago'
  }
];

export const INITIAL_PAYMENTS: DirectPayment[] = [
  {
    id: 'pay_1',
    jobId: 'job_1',
    jobTitle: 'Senior Solana Anchor & AI Agent Engineer (Milestone #1)',
    clientName: 'Marcus Vance',
    clientId: 'user_marcus',
    talentName: 'Alex Rivera',
    talentId: 'user_me',
    amount: 15.0,
    amountSol: 15.0,
    currency: 'SOL',
    status: 'CONFIRMED',
    createdAt: 'Yesterday',
    recipientAddress: '7Xw9...4Kp9mN2q8Xv1',
    txHash: '5Kz8m9Pq1x2N4Lp7Vb3Xz0Qw',
    notes: 'Milestone 1: Smart contract bonding curve program deployed to Devnet with 100% test coverage.'
  },
  {
    id: 'pay_2',
    jobId: 'job_2',
    jobTitle: 'Phantom Wallet Redesign Feedback Sprint',
    clientName: 'Elena Rostova',
    clientId: 'user_elena',
    talentName: 'Alex Rivera',
    talentId: 'user_me',
    amount: 8.5,
    amountSol: 8.5,
    currency: 'SOL',
    status: 'RELEASED',
    createdAt: '3 days ago',
    recipientAddress: '7Xw9...4Kp9mN2q8Xv1',
    txHash: '9Qq1x2M4Lp7Vb3Xz0Qw5Kz8m',
    notes: 'Design architecture code reviewed and on-chain verified.'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_elena',
    participantId: 'user_elena',
    lastMessage: 'I have verified the test suites! Everything looks great.',
    lastMessageAt: '10:42 AM',
    unreadCount: 0
  },
  {
    id: 'conv_devin',
    participantId: 'user_devin',
    lastMessage: 'The Figma designs for the wallet drawer are updated.',
    lastMessageAt: 'Yesterday',
    unreadCount: 0
  }
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  conv_elena: [
    {
      id: 'm_e1',
      conversationId: 'conv_elena',
      senderId: 'user_elena',
      text: 'Hey Alex! I finished reviewing the Anchor smart contract program for the collateral vault.',
      createdAt: '10:30 AM',
      read: true
    },
    {
      id: 'm_e2',
      conversationId: 'conv_elena',
      senderId: 'user_me',
      text: 'Awesome Elena! Did you encounter any critical overflows in the borrow calculation math?',
      createdAt: '10:35 AM',
      read: true
    },
    {
      id: 'm_e3',
      conversationId: 'conv_elena',
      senderId: 'user_elena',
      text: 'None! I added 4 unit tests using bankrun. All pass with 100% test coverage.',
      createdAt: '10:40 AM',
      read: true
    },
    {
      id: 'm_e4',
      conversationId: 'conv_elena',
      senderId: 'user_elena',
      text: 'I have verified the test suites! Everything looks great for deployment.',
      createdAt: '10:42 AM',
      read: true
    }
  ],
  conv_devin: [
    {
      id: 'm_d1',
      conversationId: 'conv_devin',
      senderId: 'user_me',
      text: 'Hey Devon, have you had a chance to update the wallet drawer mobile layout?',
      createdAt: '2 days ago',
      read: true
    },
    {
      id: 'm_d2',
      conversationId: 'conv_devin',
      senderId: 'user_devin',
      text: 'The Figma designs for the wallet drawer are updated.',
      createdAt: 'Yesterday',
      read: true
    }
  ]
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'payment',
    title: 'Direct Payment Received!',
    message: '15.0 SOL ($2,400) transferred directly from Kamino Finance Vault to your wallet.',
    amountTag: 'Amount: +15 SOL',
    createdAt: '15 mins ago',
    isRead: true,
    linkTab: 'wallet'
  },
  {
    id: 'notif_2',
    type: 'message',
    title: 'New Proposal on Pyth Bounty',
    message: 'Elena Rostova submitted a proposal (10 SOL) for Pyth Oracle Integration.',
    createdAt: '1 hour ago',
    isRead: true,
    linkTab: 'jobs'
  },
  {
    id: 'notif_3',
    type: 'job_status',
    title: 'Hiring Offer Received',
    message: 'Superteam DAO invited you to lead Anchor Program Development (Budget: 35 SOL).',
    amountTag: 'Amount: +35 SOL',
    createdAt: '3 hours ago',
    isRead: true,
    linkTab: 'jobs'
  },
  {
    id: 'notif_4',
    type: 'match',
    title: 'On-Chain Badge Minted',
    message: 'Solana Superteam Earn Verified Credential NFT successfully minted to your wallet.',
    createdAt: '1 day ago',
    isRead: true,
    linkTab: 'profile'
  }
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_1',
    type: 'PAYMENT_SENT',
    amount: 15.0,
    amountSol: 15.0,
    currency: 'SOL',
    counterpartyName: 'Marcus Vance',
    counterpartyAddress: '9Pq0...1Kj8x5',
    txHash: '5Kz8m9Pq1x2N4Lp7Vb3Xz0Qw',
    timestamp: 'Today 10:42 AM',
    status: 'CONFIRMED'
  },
  {
    id: 'tx_2',
    type: 'PAYMENT_RECEIVED',
    amount: 8.5,
    amountSol: 8.5,
    currency: 'SOL',
    counterpartyName: 'Elena Rostova',
    counterpartyAddress: '3Mv1...8Kx9p2',
    txHash: '9Qq1x2M4Lp7Vb3Xz0Qw5Kz8m',
    timestamp: 'Yesterday 3:15 PM',
    status: 'CONFIRMED'
  },
  {
    id: 'tx_3',
    type: 'TIP_RECEIVED',
    amount: 1.0,
    amountSol: 1.0,
    currency: 'SOL',
    counterpartyName: 'Devin Chen',
    counterpartyAddress: '4Lp2...7Qq9m1',
    txHash: '2Xx79Pq01Zp93Mn7b1Qq8z4',
    timestamp: '2 days ago',
    status: 'CONFIRMED'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    jobId: 'job_past_1',
    jobTitle: 'Solana Anchor DEX Smart Contract Optimization',
    reviewerId: 'user_marcus',
    reviewerName: 'Marcus Vance',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    revieweeId: 'user_me',
    rating: 5,
    comment: 'Alex delivered top-tier Rust Anchor code 3 days ahead of schedule. The program passed full Sec3 audit checks with zero critical findings!',
    createdAt: 'Jan 2024',
    verifiedOnChain: true
  },
  {
    id: 'rev_2',
    jobId: 'job_past_2',
    jobTitle: 'Solana Wallet Integration Architecture',
    reviewerId: 'user_elena',
    reviewerName: 'Elena Rostova',
    reviewerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    revieweeId: 'user_me',
    rating: 5,
    comment: 'Incredible technical mind and smooth developer experience. Highest recommendation for any Web3 project on Solana!',
    createdAt: 'Feb 2024',
    verifiedOnChain: true
  }
];

export const INITIAL_COMMUNITIES: CommunityGroup[] = [
  {
    id: 'comm_official',
    name: 'SkillChain Official Announcements',
    description: 'Central SkillChain announcement group for official platform updates, protocol upgrades, new feature rollouts, and announcements.',
    iconType: 'announcement',
    iconBgColor: '#EFF6FF',
    iconColor: '#2554EB',
    memberCount: 1420,
    isOfficial: true,
    isPinned: true,
    category: 'Announcements',
    unreadCount: 2,
    lastMessage: 'SkillChain Payment Protocol V2 smart contracts are now live on Solana mainnet!',
    lastMessageTime: '10:30 AM',
    creatorId: 'user_marcus',
    adminIds: ['user_marcus'],
    memberIds: ['user_me', 'user_marcus', 'user_elena', 'user_devin', 'user_sarah', 'user_kai', 'user_amara', 'user_liam', 'user_priya', 'user_mateo'],
    isLocked: true,
    pendingJoinRequests: []
  },
  {
    id: 'comm_solana_builders',
    name: 'Solana Builders Hub',
    description: 'Anchor and ZK engineers building high-performance dApps on Solana.',
    iconType: 'solana',
    iconBgColor: '#FEF3C7',
    iconColor: '#F59E0B',
    memberCount: 3,
    isOfficial: false,
    isPinned: false,
    category: 'Solana Ecosystem',
    unreadCount: 0,
    lastMessage: 'Check out the new Light Protocol compression benchmarks for token vaults.',
    lastMessageTime: 'Yesterday',
    creatorId: 'user_me',
    adminIds: ['user_me', 'user_marcus'],
    memberIds: ['user_me', 'user_elena', 'user_marcus'],
    isLocked: false,
    pendingJoinRequests: [
      {
        userId: 'user_devin',
        userName: 'Devin Chen',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        userTitle: 'Web3 UI/UX Designer',
        userHandle: '@devon_uiux',
        requestedAt: '15 mins ago',
        note: 'Hey Alex! Would love to collaborate with the Anchor devs on frontend dApp integration.',
        status: 'pending'
      },
      {
        userId: 'user_sarah',
        userName: 'Sarah Jenkins',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        userTitle: 'Lead Web3 Product Designer',
        userHandle: '@sarah_uiux',
        requestedAt: '1 hour ago',
        note: 'Working on mobile Solana UX benchmarks and want to share designs.',
        status: 'pending'
      }
    ]
  },
  {
    id: 'comm_security_guild',
    name: 'Web3 Security & Audit Guild',
    description: 'Certified auditors, smart contract fuzzers, and zero-knowledge researchers collaborating on vulnerability analysis.',
    iconType: 'security',
    iconBgColor: '#EFF6FF',
    iconColor: '#3B82F6',
    memberCount: 3,
    isOfficial: false,
    isPinned: false,
    category: 'Security & Audits',
    unreadCount: 1,
    lastMessage: 'Elena just shared a new checklist for checking PDA seed collisions in Anchor 0.30.',
    lastMessageTime: '2 days ago',
    creatorId: 'user_elena',
    adminIds: ['user_elena'],
    memberIds: ['user_me', 'user_elena', 'user_amara'],
    isLocked: false,
    pendingJoinRequests: []
  },
  {
    id: 'comm_rust_anchor',
    name: 'Rust & Anchor Programmers',
    description: 'Deep-dive discussions on Solana program optimization, zero-copy deserialization, and Anchor best practices.',
    iconType: 'rust',
    iconBgColor: '#FDF2F8',
    iconColor: '#EC4899',
    memberCount: 3,
    isOfficial: false,
    isPinned: false,
    category: 'Rust & Smart Contracts',
    unreadCount: 0,
    lastMessage: 'How do you structure your custom errors across multiple CPI invocations?',
    lastMessageTime: '3 days ago',
    creatorId: 'user_liam',
    adminIds: ['user_liam'],
    memberIds: ['user_liam', 'user_kai', 'user_priya'],
    isLocked: false,
    pendingJoinRequests: []
  },
  {
    id: 'comm_designers_dao',
    name: 'Web3 UI/UX & Frontend Guild',
    description: 'Mobile dApp UX, Tailwind component design systems, and Solana wallet adapter interfaces.',
    iconType: 'design',
    iconBgColor: '#ECFDF5',
    iconColor: '#10B981',
    memberCount: 2,
    isOfficial: false,
    isPinned: false,
    category: 'Design & Frontend',
    unreadCount: 0,
    lastMessage: 'New Figma kit for mobile wallet modal interactions published in the repo.',
    lastMessageTime: '4 days ago',
    creatorId: 'user_devin',
    adminIds: ['user_devin', 'user_sarah'],
    memberIds: ['user_devin', 'user_sarah'],
    isLocked: false,
    pendingJoinRequests: []
  }
];

export const INITIAL_COMMUNITY_MESSAGES: Record<string, CommunityMessage[]> = {
  comm_official: [
    {
      id: 'cmsg_1',
      groupId: 'comm_official',
      senderId: 'user_marcus',
      senderName: 'SkillChain Core',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      senderRole: 'Core Team',
      isVerified: true,
      text: 'Welcome to the official SkillChain community channel! Here you will find live platform updates, bounty drops, and security audits.',
      createdAt: 'Aug 15, 9:00 AM'
    },
    {
      id: 'cmsg_2',
      groupId: 'comm_official',
      senderId: 'user_marcus',
      senderName: 'SkillChain Core',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      senderRole: 'Core Team',
      isVerified: true,
      text: 'SkillChain Payment Protocol V2 smart contracts are now live on Solana mainnet with instant direct milestone settlement.',
      createdAt: 'Today, 10:30 AM'
    }
  ],
  comm_solana_builders: [
    {
      id: 'cmsg_sb_1',
      groupId: 'comm_solana_builders',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      senderTitle: 'Lead Rust & ZK Engineer',
      senderBadge: 'link',
      isVerified: true,
      text: 'Hey everyone! Just deployed our latest Anchor v0.30 zero-copy account layout PR. Anyone available for a peer review?',
      createdAt: '10:15 AM',
      likesCount: 4,
      isLiked: true,
      isPinned: false
    },
    {
      id: 'cmsg_sb_2',
      groupId: 'comm_solana_builders',
      senderId: 'user_marcus',
      senderName: 'Marcus Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      senderTitle: 'Senior DeFi Architect',
      senderBadge: 'link',
      isVerified: true,
      text: 'Checking it out right now Elena! The PDA seed verification looks super clean.',
      createdAt: '10:22 AM',
      likesCount: 2,
      isLiked: false,
      isPinned: false
    },
    {
      id: 'cmsg_sb_3',
      groupId: 'comm_solana_builders',
      senderId: 'user_me',
      senderName: 'Alex Rivera',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      senderTitle: 'Full-Stack Web3 Engineer',
      senderBadge: 'admin',
      isVerified: true,
      text: 'Great work team! I will hook up the frontend React SDK hooks to the newly generated IDL today.',
      createdAt: '10:45 AM',
      likesCount: 5,
      isLiked: true,
      isPinned: false,
      read: true
    }
  ],
  comm_security_guild: [
    {
      id: 'cmsg_sec_1',
      groupId: 'comm_security_guild',
      senderId: 'user_elena',
      senderName: 'Elena Rostova',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      isVerified: true,
      text: 'Elena just shared a new checklist for checking PDA seed collisions in Anchor 0.30. Always ensure seeds include explicit bump seeds.',
      createdAt: '2 days ago'
    }
  ]
};

