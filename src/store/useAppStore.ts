import { create } from 'zustand';
import {
  Certificate,
  Member,
  Reminder,
  ReminderLevel,
  ReminderWithCertificate,
  CertificateFilters,
  SortBy,
  SortOrder,
} from '@/types';
import {
  getCertificates,
  setCertificates,
  getMembers,
  setMembers,
  getReminders,
  setReminders,
  getInitialized,
  setInitialized,
} from '@/utils/storage';
import { generateMockCertificates, generateMockMembers } from '@/utils/mockData';
import {
  calculateDaysRemaining,
  generateId,
  getReminderLevel,
  todayISO,
} from '@/utils/dateUtils';

interface AppState {
  certificates: Certificate[];
  members: Member[];
  reminders: Reminder[];
  initialized: boolean;
  filters: CertificateFilters;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedCertificateId: string | null;

  init: () => void;
  addCertificate: (cert: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'photos'> & { photos?: Certificate['photos'] }) => void;
  updateCertificate: (id: string, cert: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  getCertificate: (id: string) => Certificate | undefined;
  getFilteredCertificates: () => Certificate[];
  getSortedCertificates: (certs: Certificate[]) => Certificate[];
  getExpiringCertificates: (limit?: number) => Certificate[];

  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  getRemindersWithCertificate: () => ReminderWithCertificate[];
  getActiveRemindersCount: () => number;
  markReminderRead: (id: string) => void;
  markReminderDismissed: (id: string, dismissed: boolean) => void;
  regenerateReminders: () => void;

  setFilters: (filters: Partial<CertificateFilters>) => void;
  setSort: (sortBy: SortBy, sortOrder: SortOrder) => void;
  setSelectedCertificateId: (id: string | null) => void;

  resetWithMockData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  certificates: [],
  members: [],
  reminders: [],
  initialized: false,
  filters: {},
  sortBy: 'expiry',
  sortOrder: 'asc',
  selectedCertificateId: null,

  init: () => {
    const wasInit = getInitialized();
    if (!wasInit) {
      const members = generateMockMembers();
      const certificates = generateMockCertificates(members);
      setMembers(members);
      setCertificates(certificates);
      setInitialized(true);

      const reminders = computeReminders(certificates);
      setReminders(reminders);

      set({ members, certificates, reminders, initialized: true });
    } else {
      const members = getMembers();
      const certificates = getCertificates();
      const reminders = computeReminders(certificates);
      setReminders(reminders);
      set({ members, certificates, reminders, initialized: true });
    }
  },

  addCertificate: (cert) => {
    const now = todayISO();
    const newCert: Certificate = {
      ...cert,
      id: generateId(),
      photos: cert.photos || [],
      createdAt: now,
      updatedAt: now,
    };
    const certificates = [...get().certificates, newCert];
    setCertificates(certificates);
    const reminders = computeReminders(certificates);
    setReminders(reminders);
    set({ certificates, reminders });
  },

  updateCertificate: (id, cert) => {
    const certificates = get().certificates.map((c) =>
      c.id === id ? { ...c, ...cert, updatedAt: todayISO() } : c
    );
    setCertificates(certificates);
    const reminders = computeReminders(certificates);
    setReminders(reminders);
    set({ certificates, reminders });
  },

  deleteCertificate: (id) => {
    const certificates = get().certificates.filter((c) => c.id !== id);
    setCertificates(certificates);
    const reminders = computeReminders(certificates);
    setReminders(reminders);
    set({ certificates, reminders });
  },

  getCertificate: (id) => get().certificates.find((c) => c.id === id),

  getFilteredCertificates: () => {
    const { certificates, filters } = get();
    let result = [...certificates];

    if (filters.type) {
      result = result.filter((c) => c.type === filters.type);
    }
    if (filters.holderId) {
      result = result.filter((c) => c.holderId === filters.holderId);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.type.toLowerCase().includes(query) ||
          c.holderName.toLowerCase().includes(query) ||
          c.number.toLowerCase().includes(query) ||
          c.issuer.toLowerCase().includes(query)
      );
    }

    return get().getSortedCertificates(result);
  },

  getSortedCertificates: (certs) => {
    const { sortBy, sortOrder } = get();
    const sorted = [...certs].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'expiry') {
        if (a.isPermanent && b.isPermanent) cmp = 0;
        else if (a.isPermanent) cmp = 1;
        else if (b.isPermanent) cmp = -1;
        else cmp = a.expiryDate.localeCompare(b.expiryDate);
      } else if (sortBy === 'created') {
        cmp = a.createdAt.localeCompare(b.createdAt);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return sorted;
  },

  getExpiringCertificates: (limit) => {
    const { certificates, getSortedCertificates } = get();
    const withDays = certificates
      .filter((c) => !c.isPermanent)
      .map((c) => ({ cert: c, days: calculateDaysRemaining(c.expiryDate) }))
      .filter((x) => x.days <= 365)
      .sort((a, b) => a.days - b.days)
      .map((x) => x.cert);
    return limit ? withDays.slice(0, limit) : withDays;
  },

  addMember: (member) => {
    const newMember: Member = {
      ...member,
      id: generateId(),
      createdAt: todayISO(),
    };
    const members = [...get().members, newMember];
    setMembers(members);
    set({ members });
  },

  updateMember: (id, member) => {
    const oldMember = get().members.find((m) => m.id === id);
    const members = get().members.map((m) => (m.id === id ? { ...m, ...member } : m));
    setMembers(members);

    let certificates = get().certificates;
    if (oldMember && member.name && oldMember.name !== member.name) {
      certificates = certificates.map((c) =>
        c.holderId === id ? { ...c, holderName: member.name! } : c
      );
      setCertificates(certificates);
    }
    set({ members, certificates });
  },

  deleteMember: (id) => {
    const members = get().members.filter((m) => m.id !== id);
    setMembers(members);
    set({ members });
  },

  getRemindersWithCertificate: () => {
    const { reminders, certificates } = get();
    return reminders
      .filter((r) => !r.isDismissed)
      .map((r) => {
        const certificate = certificates.find((c) => c.id === r.certificateId);
        if (!certificate) return null;
        return {
          ...r,
          certificate,
          daysRemaining: certificate.isPermanent
            ? Infinity
            : calculateDaysRemaining(certificate.expiryDate),
        } as ReminderWithCertificate;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a!.daysRemaining !== b!.daysRemaining) return a!.daysRemaining - b!.daysRemaining;
        return a!.level - b!.level;
      }) as ReminderWithCertificate[];
  },

  getActiveRemindersCount: () => {
    return get().getRemindersWithCertificate().filter((r) => !r.isRead).length;
  },

  markReminderRead: (id) => {
    const reminders = get().reminders.map((r) => (r.id === id ? { ...r, isRead: true } : r));
    setReminders(reminders);
    set({ reminders });
  },

  markReminderDismissed: (id, dismissed) => {
    const reminders = get().reminders.map((r) =>
      r.id === id ? { ...r, isDismissed: dismissed, isRead: true } : r
    );
    setReminders(reminders);
    set({ reminders });
  },

  regenerateReminders: () => {
    const reminders = computeReminders(get().certificates);
    setReminders(reminders);
    set({ reminders });
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setSort: (sortBy, sortOrder) => {
    set({ sortBy, sortOrder });
  },

  setSelectedCertificateId: (id) => {
    set({ selectedCertificateId: id });
  },

  resetWithMockData: () => {
    setInitialized(false);
    get().init();
  },
}));

function computeReminders(certificates: Certificate[]): Reminder[] {
  const reminders: Reminder[] = [];
  const today = todayISO();

  for (const cert of certificates) {
    if (cert.isPermanent) continue;
    const days = calculateDaysRemaining(cert.expiryDate);
    const level = getReminderLevel(days);
    if (level) {
      reminders.push({
        id: `reminder-${cert.id}-${level}`,
        certificateId: cert.id,
        level: level as ReminderLevel,
        isRead: false,
        isDismissed: false,
        triggerDate: today,
      });
    }
  }
  return reminders;
}
