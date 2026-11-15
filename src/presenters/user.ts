import type { Session } from '@/contracts/auth';
import type { PocketBaseRegisteredUser, PocketBaseUser } from '@/contracts/pocketbase';
import type { User } from '@/contracts/user';
import { initialsFor } from '@/lib/initials';
import { tokenExpiresAt } from '@/lib/jwt';

/** PocketBase user record -> allowlisted gateway `User`. */
export function presentUser(record: PocketBaseUser): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    verified: record.verified,
    isGuest: record.guest,
    locale: record.locale,
    createdAt: record.created,
  };
}

export function presentRegisteredUser(record: PocketBaseRegisteredUser): User {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    verified: record.verified,
    isGuest: record.guest,
    locale: record.locale,
    createdAt: record.createdAt,
  };
}

export function presentSession(token: string, user: User): Session {
  const expiresAt = tokenExpiresAt(token);
  if (!expiresAt) throw new Error('Token without expiry');
  return { token, expiresAt: expiresAt.toISOString(), user };
}

/** Application-facing user model for components. */
export interface UserViewModel {
  id: string;
  name: string;
  email: string;
  displayName: string;
  initials: string | null;
  verified: boolean;
  isGuest: boolean;
  locale: User['locale'];
  memberSince: string;
}

/**
 * Guest accounts carry a generated email and no chosen name, so they are shown with the localized
 * `guestName` and a neutral avatar instead.
 */
export function presentUserView(user: User, guestName: string): UserViewModel {
  const name = user.isGuest ? '' : user.name.trim();
  return {
    id: user.id,
    name,
    email: user.isGuest ? '' : user.email,
    displayName: user.isGuest ? guestName : name || user.email,
    initials: user.isGuest ? null : initialsFor(name, user.email),
    verified: user.verified,
    isGuest: user.isGuest,
    locale: user.locale,
    memberSince: user.createdAt,
  };
}
