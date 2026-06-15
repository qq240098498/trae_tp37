export type RelationType = '本人' | '配偶' | '父亲' | '母亲' | '子女' | '其他';

export type CertificateType =
  | '身份证'
  | '护照'
  | '驾驶证'
  | '港澳通行证'
  | '台湾通行证'
  | '居住证'
  | '社保卡'
  | '银行卡'
  | '其他';

export type ReminderLevel = 7 | 30 | 60 | 90;

export interface Member {
  id: string;
  name: string;
  relation: RelationType;
  avatar?: string;
  createdAt: string;
}

export interface CertificatePhoto {
  id: string;
  name: string;
  data: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface Certificate {
  id: string;
  type: CertificateType;
  holderId: string;
  holderName: string;
  number: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  isPermanent: boolean;
  notes?: string;
  photos: CertificatePhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  certificateId: string;
  level: ReminderLevel;
  isRead: boolean;
  isDismissed: boolean;
  triggerDate: string;
}

export interface ReminderWithCertificate extends Reminder {
  certificate: Certificate;
  daysRemaining: number;
}

export type SortBy = 'expiry' | 'created';
export type SortOrder = 'asc' | 'desc';

export interface CertificateFilters {
  type?: CertificateType;
  holderId?: string;
  search?: string;
}

export const CERTIFICATE_TYPES: CertificateType[] = [
  '身份证',
  '护照',
  '驾驶证',
  '港澳通行证',
  '台湾通行证',
  '居住证',
  '社保卡',
  '银行卡',
  '其他',
];

export const RELATION_TYPES: RelationType[] = [
  '本人',
  '配偶',
  '父亲',
  '母亲',
  '子女',
  '其他',
];

export const CERTIFICATE_TYPE_EMOJI: Record<CertificateType, string> = {
  身份证: '🪪',
  护照: '📘',
  驾驶证: '🚗',
  港澳通行证: '🛃',
  台湾通行证: '🛂',
  居住证: '🏠',
  社保卡: '💳',
  银行卡: '💰',
  其他: '📄',
};

export const REMINDER_LEVELS: ReminderLevel[] = [90, 60, 30, 7];
