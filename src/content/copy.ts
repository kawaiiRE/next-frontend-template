export const COPY = {
  brand: 'Application',
  navigation: {
    home: 'Home',
  },
  home: {
    eyebrow: 'Next.js + PocketBase',
    title: 'A clean frontend foundation.',
    description:
      'Start with clear boundaries, strict types, centralized styling, and production checks.',
    architectureTitle: 'Ready to grow by domain',
    architectureDescription:
      'Add each feature through contracts, services, presenters, focused components, and tests.',
  },
  health: {
    title: 'Backend connection',
    loading: 'Checking PocketBase…',
    available: 'PocketBase is available.',
    unavailable: 'PocketBase is not available yet.',
    retry: 'Try again',
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
  footer: 'Built with a separated Next.js frontend architecture.',
} as const;
