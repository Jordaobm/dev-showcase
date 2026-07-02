export const SOCIAL_LINKS = {
  github: process.env.NEXT_PUBLIC_GITHUB_URL!,
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO_URL!,
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL!,
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL!,
  emailHref: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`,
} as const;
