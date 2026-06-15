import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  X,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CERTIFICATE_TYPE_EMOJI, REMINDER_LEVELS, ReminderLevel } from '@/types';
import {
  calculateDaysRemaining,
  formatDate,
  getReminderColor,
  getReminderLevel,
  getReminderLevelLabel,
  getReminderLabel,
} from '@/utils/dateUtils';

const levelFilters: Array<{ label: string; value: ReminderLevel | 'all' }> = [
  { label: '全部', value: 'all' },
  { label: '≤7天', value: 7 },
  { label: '≤30天', value: 30 },
  { label: '≤60天', value: 60 },
  { label: '≤90天', value: 90 },
];

export function ReminderCenterPage() {
  const navigate = useNavigate();
  const { getRemindersWithCertificate, markReminderRead, markReminderDismissed } =
    useAppStore();

  const [levelFilter, setLevelFilter] = useState<ReminderLevel | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allReminders = getRemindersWithCertificate();

  const filtered = allReminders.filter((r) => {
    if (levelFilter === 'all') return true;
    return r.level === levelFilter;
  });

  const grouped = REMINDER_LEVELS.reduce(
    (acc, level) => {
      acc[level] = filtered.filter((r) => r.level === level);
      return acc;
    },
    {} as Record<ReminderLevel, typeof filtered>
  );

  const stats = {
    total: allReminders.length,
    unread: allReminders.filter((r) => !r.isRead).length,
    expired: allReminders.filter((r) => r.daysRemaining < 0).length,
    urgent: allReminders.filter((r) => r.daysRemaining >= 0 && r.level === 7).length,
  };

  const handleView = (r: typeof allReminders[number]) => {
    markReminderRead(r.id);
    navigate(`/certificates/${r.certificateId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold text-gray-900 dark:text-white"
          style={{ fontFamily: 'Noto Serif SC, serif' }}
        >
          提醒中心
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          系统根据有效期自动计算并推送到期提醒
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="提醒总数" value={stats.total} icon={<Bell className="w-5 h-5" />} color="cyan" />
        <StatCard label="未读提醒" value={stats.unread} icon={<Filter className="w-5 h-5" />} color="violet" />
        <StatCard label="紧急提醒" value={stats.urgent} icon={<Clock className="w-5 h-5" />} color="orange" />
        <StatCard label="已过期" value={stats.expired} icon={<X className="w-5 h-5" />} color="red" />
      </div>

      <div className="flex flex-wrap gap-2">
        {levelFilters.map((f) => {
          const active = levelFilter === f.value;
          return (
            <button
              key={String(f.value)}
              onClick={() => setLevelFilter(f.value)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${active
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
              `}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${active ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {grouped[f.value]?.length || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-5">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            当前没有符合条件的提醒
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            证件状态良好，请保持关注
          </p>
        </div>
      ) : (
        <div className="relative pl-8 before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
          {REMINDER_LEVELS.map((level) => {
            const items = grouped[level];
            if (items.length === 0) return null;
            return (
              <div key={level} className="mb-8 last:mb-0">
                <div className="flex items-center gap-3 mb-4 -ml-8">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg text-white font-bold"
                    style={{ backgroundColor: getReminderColor(level, 5) }}
                  >
                    {level}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {getReminderLevelLabel(level)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      有效期剩余 ≤ {level} 天的证件，共 {items.length} 个
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((r) => {
                    const days = r.daysRemaining;
                    const currentLevel = getReminderLevel(days);
                    const color = getReminderColor(currentLevel, days);
                    const expanded = expandedId === r.id;
                    return (
                      <div
                        key={r.id}
                        className={`
                          relative ml-4 rounded-2xl border bg-white dark:bg-gray-800 overflow-hidden transition-all
                          ${r.isRead
                            ? 'border-gray-200 dark:border-gray-700 opacity-75'
                            : 'border-gray-200 dark:border-gray-700'
                          }
                          hover:shadow-lg
                        `}
                        style={{
                          boxShadow: !r.isRead ? `0 4px 14px ${color}15` : undefined,
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1.5"
                          style={{ backgroundColor: color }}
                        />

                        {!r.isRead && (
                          <div
                            className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: color }}
                          />
                        )}

                        <div className="p-5 pl-6">
                          <div
                            className="flex items-start justify-between gap-4 cursor-pointer"
                            onClick={() => setExpandedId(expanded ? null : r.id)}
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className="text-3xl drop-shadow-sm">
                                {CERTIFICATE_TYPE_EMOJI[r.certificate.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-gray-900 dark:text-white">
                                    {r.certificate.holderName} · {r.certificate.type}
                                  </h4>
                                  <span
                                    className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                                    style={{ backgroundColor: color }}
                                  >
                                    {days < 0 ? `已过期 ${Math.abs(days)} 天` : getReminderLabel(days)}
                                  </span>
                                  {!r.isRead && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-medium">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  有效期至：{formatDate(r.certificate.expiryDate)} · 发证机关：
                                  {r.certificate.issuer || '-'}
                                </p>
                              </div>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                              >
                                {expanded ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {expanded && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">证件号码</p>
                                  <p className="text-gray-800 dark:text-gray-200 font-mono truncate">
                                    {r.certificate.number}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">签发日期</p>
                                  <p className="text-gray-800 dark:text-gray-200">
                                    {r.certificate.issueDate ? formatDate(r.certificate.issueDate) : '-'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">剩余天数</p>
                                  <p
                                    className="font-bold"
                                    style={{ color }}
                                  >
                                    {calculateDaysRemaining(r.certificate.expiryDate)} 天
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs mb-0.5">照片存档</p>
                                  <p className="text-gray-800 dark:text-gray-200">
                                    {r.certificate.photos.length} 张
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleView(r)}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-colors shadow shadow-cyan-500/20"
                                >
                                  <Eye className="w-4 h-4" />
                                  查看详情
                                </button>
                                <button
                                  onClick={() => markReminderRead(r.id)}
                                  disabled={r.isRead}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-4 h-4" />
                                  标记已读
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm('确定要忽略此提醒吗？')) {
                                      markReminderDismissed(r.id, true);
                                    }
                                  }}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                  忽略提醒
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'cyan' | 'violet' | 'orange' | 'red';
}) {
  const colorMap = {
    cyan: 'from-cyan-500 to-blue-500 shadow-cyan-500/20',
    violet: 'from-violet-500 to-purple-500 shadow-violet-500/20',
    orange: 'from-amber-500 to-orange-500 shadow-orange-500/20',
    red: 'from-red-500 to-rose-500 shadow-red-500/20',
  };
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg ${colorMap[color]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
