import { Certificate, CERTIFICATE_TYPE_EMOJI } from '@/types';
import {
  calculateDaysRemaining,
  formatDate,
  getReminderBgClass,
  getReminderLevel,
  getReminderLabel,
  getReminderTextClass,
  maskCertificateNumber,
} from '@/utils/dateUtils';
import { Eye, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CertificateCardProps {
  certificate: Certificate;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  compact?: boolean;
}

export function CertificateCard({
  certificate,
  onDelete,
  compact = false,
}: CertificateCardProps) {
  const days = certificate.isPermanent ? Infinity : calculateDaysRemaining(certificate.expiryDate || '');
  const level = certificate.isPermanent ? null : getReminderLevel(days);
  const isUrgent = !certificate.isPermanent && days <= 30 && days > 0;
  const isExpired = !certificate.isPermanent && days < 0;

  const bgClass = getReminderBgClass(level, days);
  const textClass = getReminderTextClass(level, days);
  const emoji = CERTIFICATE_TYPE_EMOJI[certificate.type] || '📄';

  return (
    <div
      className={`
        group relative rounded-2xl border transition-all duration-300 overflow-hidden
        bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
        hover:shadow-xl hover:-translate-y-0.5
        ${bgClass}
        ${isUrgent ? 'animate-pulse-soft' : ''}
      `}
    >
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-1.5
          ${isExpired ? 'bg-red-500' : isUrgent ? 'bg-orange-500' : level === 60 ? 'bg-yellow-500' : level === 90 ? 'bg-green-500' : 'bg-gray-300'}
        `}
      />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl drop-shadow-sm">{emoji}</div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                {certificate.type}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {certificate.holderName}
              </p>
            </div>
          </div>

          <div className={`
            px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-sm
            ${textClass}
            ${certificate.isPermanent ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600' : ''}
          `}>
            {certificate.isPermanent ? '长期有效' : getReminderLabel(days)}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">证件号码</span>
            <span className="font-mono text-gray-800 dark:text-gray-200 tracking-tight">
              {maskCertificateNumber(certificate.number, certificate.type)}
            </span>
          </div>
          {!compact && !certificate.isPermanent && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">有效期至</span>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {formatDate(certificate.expiryDate)}
              </span>
            </div>
          )}
          {!compact && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">发证机关</span>
              <span className="text-gray-800 dark:text-gray-200 truncate max-w-[180px] text-right">
                {certificate.issuer || '-'}
              </span>
            </div>
          )}
          {!compact && !certificate.isPermanent && (days <= 90 || days < 0) && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <Link
                to={`/certificates/${certificate.id}`}
                className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                查看换证指南
              </Link>
            </div>
          )}
        </div>

        {!compact && certificate.photos.length > 0 && (
          <div className="flex gap-2 mb-4">
            {certificate.photos.slice(0, 3).map((photo) => (
              <div
                key={photo.id}
                className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                <img
                  src={photo.data}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {certificate.photos.length > 3 && (
              <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 font-medium">
                +{certificate.photos.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            to={`/certificates/${certificate.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            详情
          </Link>
          <Link
            to={`/certificates/${certificate.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-cyan-600 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(certificate.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
