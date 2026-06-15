import { Certificate, Member, Reminder } from '@/types';

const CERTIFICATES_KEY = 'certificate_manager_certificates';
const MEMBERS_KEY = 'certificate_manager_members';
const REMINDERS_KEY = 'certificate_manager_reminders';
const INIT_KEY = 'certificate_manager_initialized';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getInitialized(): boolean {
  return localStorage.getItem(INIT_KEY) === 'true';
}

export function setInitialized(value: boolean): void {
  localStorage.setItem(INIT_KEY, String(value));
}

export function getCertificates(): Certificate[] {
  return safeParse<Certificate[]>(localStorage.getItem(CERTIFICATES_KEY), []);
}

export function setCertificates(certificates: Certificate[]): void {
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(certificates));
}

export function getMembers(): Member[] {
  return safeParse<Member[]>(localStorage.getItem(MEMBERS_KEY), []);
}

export function setMembers(members: Member[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function getReminders(): Reminder[] {
  return safeParse<Reminder[]>(localStorage.getItem(REMINDERS_KEY), []);
}

export function setReminders(reminders: Reminder[]): void {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}
