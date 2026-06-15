import {
  format,
  parseISO,
  differenceInDays,
  startOfToday,
  addDays,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ReminderLevel, REMINDER_LEVELS } from '@/types';

export function formatDate(date: string | Date, pattern: string = 'yyyy年MM月dd日'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd');
}

export function calculateDaysRemaining(expiryDate: string): number {
  const today = startOfToday();
  const expiry = parseISO(expiryDate);
  return differenceInDays(expiry, today);
}

export function getReminderLevel(days: number): ReminderLevel | null {
  for (const level of REMINDER_LEVELS) {
    if (days <= level) {
      return level;
    }
  }
  return null;
}

export function getReminderColor(level: ReminderLevel | null, daysRemaining: number): string {
  if (daysRemaining < 0) return '#ef4444';
  if (level === 7) return '#ef4444';
  if (level === 30) return '#f97316';
  if (level === 60) return '#eab308';
  if (level === 90) return '#22c55e';
  return '#6b7280';
}

export function getReminderBgClass(level: ReminderLevel | null, daysRemaining: number): string {
  if (daysRemaining < 0) return 'bg-red-500/10 border-red-500/30';
  if (level === 7) return 'bg-red-500/10 border-red-500/30';
  if (level === 30) return 'bg-orange-500/10 border-orange-500/30';
  if (level === 60) return 'bg-yellow-500/10 border-yellow-500/30';
  if (level === 90) return 'bg-green-500/10 border-green-500/30';
  return 'bg-gray-500/10 border-gray-500/30';
}

export function getReminderTextClass(level: ReminderLevel | null, daysRemaining: number): string {
  if (daysRemaining < 0) return 'text-red-400';
  if (level === 7) return 'text-red-400';
  if (level === 30) return 'text-orange-400';
  if (level === 60) return 'text-yellow-400';
  if (level === 90) return 'text-green-400';
  return 'text-gray-400';
}

export function getReminderLabel(days: number): string {
  if (days < 0) return `已过期 ${Math.abs(days)} 天`;
  if (days === 0) return '今天到期';
  return `剩余 ${days} 天`;
}

export function getReminderLevelLabel(level: ReminderLevel): string {
  if (level === 7) return '紧急提醒';
  if (level === 30) return '重要提醒';
  if (level === 60) return '中提醒';
  return '轻提醒';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function todayISO(): string {
  return format(startOfToday(), 'yyyy-MM-dd');
}

export function addDaysISO(date: string, days: number): string {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd');
}

export function maskCertificateNumber(number: string, type: string): string {
  if (!number) return '';
  if (number.length <= 4) return number;

  if (type === '身份证' && number.length === 18) {
    return number.substring(0, 6) + '********' + number.substring(14);
  }
  if (type === '银行卡' && number.length >= 8) {
    return number.substring(0, 4) + ' **** **** ' + number.substring(number.length - 4);
  }

  const visibleStart = Math.ceil(number.length * 0.25);
  const visibleEnd = Math.ceil(number.length * 0.25);
  const maskLength = number.length - visibleStart - visibleEnd;
  return number.substring(0, visibleStart) + '*'.repeat(maskLength) + number.substring(number.length - visibleEnd);
}
