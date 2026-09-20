export const COPY = {
  brand: 'Next Template',
  brandLabel: 'Next.js starter',
  navigation: {
    overview: 'Overview',
    architecture: 'Architecture',
    foundation: 'Foundation',
    health: 'System health',
    primaryLabel: 'Primary navigation',
    open: 'Open navigation',
    close: 'Close navigation',
    status: 'Template online',
    sidebarLabel: 'Site sidebar',
    sectionLabel: 'Workspace',
    currentPage: 'Overview',
    foundationBadge: 'Production foundation',
    stackTitle: 'Full-stack ready',
    stackDescription: 'Two clean codebases connected by one contract.',
  },
  home: {
    eyebrow: 'Next.js 16 + PocketBase',
    title: 'Build the product, not the plumbing.',
    description:
      'A production-minded foundation with a refined interface, typed API boundaries, secure server-side data access, and deployment checks already in place.',
    primaryAction: 'Explore the architecture',
    secondaryAction: 'Check the connection',
    proofLabel: 'Foundation snapshot',
    proofItems: [
      { value: '100%', label: 'Strict TypeScript' },
      { value: '3', label: 'Explicit layers' },
      { value: '0', label: 'Browser secrets' },
      { value: 'A11y', label: 'Built in' },
    ],
    architecture: {
      eyebrow: 'Clear by design',
      title: 'One request. Three deliberate boundaries.',
      description:
        'The browser talks only to its own Next.js server. Next validates and presents the response. PocketBase remains on the private application network.',
      steps: [
        {
          number: '01',
          title: 'React interface',
          description: 'Responsive Server and Client Components with focused local state.',
          meta: 'Browser boundary',
        },
        {
          number: '02',
          title: 'Next.js server',
          description: 'Validated routes, use-case services, repositories, and safe presenters.',
          meta: 'Application boundary',
        },
        {
          number: '03',
          title: 'PocketBase',
          description: 'Versioned migrations, collection rules, hooks, and isolated persistence.',
          meta: 'Data boundary',
        },
      ],
    },
    foundation: {
      eyebrow: 'Production essentials',
      title: 'The important parts are already here.',
      description:
        'Every choice is meant to survive the jump from a starter repository to a maintained product.',
      items: [
        {
          number: '01',
          title: 'Typed contracts',
          description:
            'Versioned schemas protect the handoff between the independent frontend and backend repositories.',
          tag: 'Zod + TypeScript',
        },
        {
          number: '02',
          title: 'Secure by default',
          description:
            'Private backend networking, server-only environment variables, and strict browser headers.',
          tag: 'Least privilege',
        },
        {
          number: '03',
          title: 'Recovery ready',
          description:
            'PocketBase data stays outside the image and ships with documented snapshot and restore checks.',
          tag: 'Verified backups',
        },
        {
          number: '04',
          title: 'Quality gates',
          description:
            'Formatting, linting, type checks, tests, builds, and an end-to-end compatibility handshake.',
          tag: 'Yarn checks',
        },
      ],
    },
    deployment: {
      label: 'Deployment model',
      title: 'Separate repositories. One dependable product.',
      description:
        'Each codebase keeps its own history, dependencies, and deployment contract while sharing a small versioned API.',
      tags: ['Independent releases', 'Private data network', 'Health-checked runtime'],
    },
  },
  health: {
    eyebrow: 'Live integration',
    title: 'Frontend to backend handshake',
    loading: 'Checking the private PocketBase service…',
    available: 'The full stack is connected and healthy.',
    unavailable: 'The backend is not available yet.',
    retry: 'Try again',
    endpointLabel: 'Same-origin endpoint',
    endpoint: '/api/health',
    verifiedResponse: 'Verified response',
  },
  loading: 'Loading…',
  error: {
    title: 'Something went wrong.',
    description: 'The page could not be loaded safely.',
    retry: 'Try again',
  },
  notFound: {
    title: 'Page not found',
    description: 'The page you requested does not exist.',
    home: 'Return home',
  },
  footer: 'A clean Next.js + PocketBase reference architecture.',
  footerStatus: 'Ready to adapt',
} as const;
