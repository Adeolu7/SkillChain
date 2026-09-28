import { Post } from '../types';

export const INFINITE_POST_TEMPLATES: Omit<Post, 'id' | 'createdAt'>[] = [
  {
    authorId: 'user_elena',
    type: 'general',
    content: 'Deep Dive into SVM Parallelism: Benchmarking transaction execution across non-overlapping account write locks. Achieved 2,800 sustained TPS during multi-token liquidity pool rebalancing with minimal CU overhead!',
    hashtags: ['Solana', 'SVM', 'Performance', 'Rust'],
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 168,
    commentsCount: 22,
    repostsCount: 41,
    isLiked: false,
    isReposted: false,
    comments: [
      {
        id: 'inf_c1',
        authorId: 'user_kai',
        authorName: 'Kai Tanaka',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@kai_security',
        isVerified: true,
        content: 'Awesome numbers! Did you test under high compute unit congestion?',
        createdAt: '2h ago',
        likes: 8
      }
    ]
  },
  {
    authorId: 'user_sarah',
    type: 'portfolio_showcase',
    content: 'UX Case Study: Designing a seedless passkey onboarding flow for Solana Mobile dApps. Reduced drop-off rate during new wallet generation from 42% down to 4.8% by integrating WebAuthn biometric signatures directly into the header drawer.',
    hashtags: ['UIUX', 'Passkeys', 'SolanaMobile', 'DesignSystems'],
    mediaUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 230,
    commentsCount: 31,
    repostsCount: 58,
    isLiked: true,
    isReposted: false,
    comments: [
      {
        id: 'inf_c2_1',
        authorId: 'user_devin',
        authorName: 'Devon Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@devon_uiux',
        isVerified: true,
        content: 'Huge improvement on the onboarding conversion funnel. Passkeys will onboard the next 100M users.',
        createdAt: '3h ago',
        likes: 12
      },
      {
        id: 'inf_c2_2',
        authorId: 'user_priya',
        authorName: 'Priya Sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@priya_solmobile',
        isVerified: true,
        content: 'Does this handle key recovery gracefully across separate biometric enclave devices?',
        createdAt: '1h ago',
        likes: 5
      }
    ]
  },
  {
    authorId: 'user_devin',
    type: 'general',
    content: 'Solana Actions & Blinks Integration: Shipped an interactive preview card that lets users trigger on-chain direct milestone releases directly from their web feed without navigating away. Powered by Solana dial-to-action standard!',
    hashtags: ['Blinks', 'SolanaActions', 'Web3Dev', 'Milestones'],
    mediaUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80',
    likesCount: 185,
    commentsCount: 19,
    repostsCount: 37,
    isLiked: false,
    isReposted: false,
    comments: [
      {
        id: 'inf_c3_1',
        authorId: 'user_elena',
        authorName: 'Elena Rostova',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@elena_rust',
        isVerified: true,
        content: 'Blinks in the feed are such an intuitive interaction paradigm. Great work on the dial execution!',
        createdAt: '4h ago',
        likes: 9
      }
    ]
  },
  {
    authorId: 'user_amara',
    type: 'portfolio_showcase',
    content: 'Security Audit Breakdown: Analyzed 14 Anchor smart contracts over the past quarter. Found that 62% of critical vulnerabilities stemmed from unvalidated PDA derivation seeds and unchecked remaining_accounts accounts. Wrote automated lint rules to catch them at build time.',
    hashtags: ['SecurityAudit', 'Solana', 'Anchor', 'RustSecurity'],
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 312,
    commentsCount: 45,
    repostsCount: 89,
    isLiked: true,
    isReposted: true,
    comments: [
      {
        id: 'inf_c4_1',
        authorId: 'user_liam',
        authorName: "Liam O'Connor",
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@liam_anchor',
        isVerified: true,
        content: 'These custom lint rules saved our team during the last protocol upgrade. Highly recommended!',
        createdAt: '5h ago',
        likes: 14
      }
    ]
  },
  {
    authorId: 'user_liam',
    type: 'general',
    content: 'Published a high-throughput WebSocket listener client for Solana Geyser gRPC streams. Features automatic backpressure buffering, ring-buffer event queuing, and sub-15ms block event propagation.',
    hashtags: ['OpenSource', 'gRPC', 'SolanaDev', 'Infrastructure'],
    mediaUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80',
    likesCount: 144,
    commentsCount: 16,
    repostsCount: 27,
    isLiked: false,
    isReposted: false,
    comments: [
      {
        id: 'inf_c5_1',
        authorId: 'user_kai',
        authorName: 'Kai Tanaka',
        authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@kai_solana',
        isVerified: true,
        content: 'Sub-15ms block event propagation is phenomenal for on-chain liquidator bots.',
        createdAt: '6h ago',
        likes: 7
      }
    ]
  },
  {
    authorId: 'user_devon',
    type: 'portfolio_showcase',
    content: 'Design System Update: Re-architected our Web3 Component Library with high-contrast accessibility standards (WCAG AA), zero layout shifts on wallet connection, and optical corner nesting for Solana dApps.',
    hashtags: ['Figma', 'UIUX', 'Tailwind', 'DesignSystems'],
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542744094-3a3172720a8a?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 198,
    commentsCount: 28,
    repostsCount: 44,
    isLiked: false,
    isReposted: false,
    comments: [
      {
        id: 'inf_c6_1',
        authorId: 'user_sarah',
        authorName: 'Sarah Jenkins',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@sarah_uiux',
        isVerified: true,
        content: 'The WCAG AA compliance and button touch bounding boxes are stellar.',
        createdAt: '7h ago',
        likes: 11
      }
    ]
  },
  {
    authorId: 'user_kai',
    type: 'general',
    content: 'Pro tip for zero-copy deserialization in Anchor: Use AccountLoader with zero_copy attribute when handling large arrays or transaction order books over 10KB. Drops deserialization compute units from 35,000 to under 800 CU!',
    hashtags: ['Solana', 'Anchor', 'Rust', 'Optimization'],
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
    likesCount: 276,
    commentsCount: 38,
    repostsCount: 65,
    isLiked: true,
    isReposted: false,
    comments: [
      {
        id: 'inf_c7_1',
        authorId: 'user_me',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@alexrivera_sol',
        isVerified: true,
        content: 'AccountLoader zero_copy is hands down the best optimization for orderbook matching programs.',
        createdAt: '8h ago',
        likes: 16
      }
    ]
  },
  {
    authorId: 'user_elena',
    type: 'portfolio_showcase',
    content: 'Portfolio Showcase: Developed a decentralized AI compute scheduler running on Solana. It distributes matrix computation tasks across verified validator nodes and automatically settles milestone payments in SOL upon proof verification.',
    hashtags: ['DecentralizedAI', 'Solana', 'ComputeNetwork', 'Web3'],
    mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80'
    ],
    likesCount: 340,
    commentsCount: 52,
    repostsCount: 94,
    isLiked: true,
    isReposted: true,
    comments: [
      {
        id: 'inf_c8_1',
        authorId: 'user_marcus',
        authorName: 'Marcus Vance',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        authorHandle: '@marcus_hyperion',
        isVerified: true,
        content: 'Would love to discuss funding this compute network scheduler. Sending you a DM Elena!',
        createdAt: '9h ago',
        likes: 19
      }
    ]
  }
];

const TIME_OFFSETS = [
  '4 hours ago',
  '6 hours ago',
  '9 hours ago',
  '12 hours ago',
  '1 day ago',
  '2 days ago',
  '3 days ago',
  '4 days ago',
  '5 days ago',
  '1 week ago'
];

export function generateInfinitePostsBatch(pageIndex: number, batchSize: number = 3): Post[] {
  const result: Post[] = [];
  const totalTemplates = INFINITE_POST_TEMPLATES.length;

  for (let i = 0; i < batchSize; i++) {
    const templateIndex = (pageIndex * batchSize + i) % totalTemplates;
    const template = INFINITE_POST_TEMPLATES[templateIndex];
    const timeIndex = (pageIndex * batchSize + i) % TIME_OFFSETS.length;
    
    // Clean and deduplicate tags
    const cleanTags = Array.from(
      new Set(
        (template.hashtags || [])
          .map((t) => t.replace(/^#+/, '').trim())
          .filter(Boolean)
      )
    );

    const commentsWithIds = (template.comments || []).map((c, cIdx) => ({
      ...c,
      id: `inf_comment_${pageIndex}_${i}_${cIdx}_${Date.now()}`
    }));

    result.push({
      ...template,
      id: `post_infinite_${pageIndex}_${i}_${Date.now() + i}`,
      createdAt: TIME_OFFSETS[timeIndex],
      hashtags: cleanTags,
      likesCount: template.likesCount + Math.floor(Math.random() * 15),
      commentsCount: Math.max(template.commentsCount || 0, commentsWithIds.length),
      repostsCount: template.repostsCount + Math.floor(Math.random() * 8),
      comments: commentsWithIds
    });
  }

  return result;
}
