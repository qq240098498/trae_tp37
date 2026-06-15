import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, AlertTriangle, Clock, Plus, ArrowRight, Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { StatsCard } from '@/components/StatsCard';
import { CertificateCard } from '@/components/CertificateCard';
import { calculateDaysRemaining, getReminderLevel, getReminderLabel } from '@/utils/dateUtils';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    certificates,
    members,
    getExpiringCertificates,
    getRemindersWithCertificate,
  } = useAppStore();

  const stats = useMemo(() => {
    const expiring = getRemindersWithCertificate();
    const soonExpiring = expiring.filter((r) => r.daysRemaining > 0);
    const expired = expiring.filter((r) => r.daysRemaining < 0);
    return {
      total: certificates.length,
      soonExpiring: soonExpiring.length,
      expired: expired.length,
      members: members.length,
    };
  }, [certificates, members, getRemindersWithCertificate]);

  const topExpiring = useMemo(() => {
    return getExpiringCertificates(5);
  }, [getExpiringCertificates]);

  const urgentReminders = useMemo(() => {
    return getRemindersWithCertificate().slice(0, 3);
  }, [getRemindersWithCertificate]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            仪表板
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            欢迎使用证件管家，以下是您的证件状态概览
          </p>
        </div>
        <button
          onClick={() => navigate('/certificates/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          新增证件
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="证件总数"
          value={stats.total}
          icon={<FileText className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
          subtitle="家庭成员所有证件"
          onClick={() => navigate('/certificates')}
        />
        <StatsCard
          title="即将到期"
          value={stats.soonExpiring}
          icon={<Clock className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          subtitle="90天内需要续期"
          onClick={() => navigate('/reminders')}
        />
        <StatsCard
          title="已过期"
          value={stats.expired}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-red-500 to-rose-600"
          subtitle="请尽快办理续期"
          onClick={() => navigate('/reminders')}
        />
        <StatsCard
          title="家庭成员"
          value={stats.members}
          icon={<Users className="w-6 h-6" />}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          subtitle="已登记的家庭成员"
          onClick={() => navigate('/members')}
        />
      </div>

      {urgentReminders.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-red-200 dark:border-red-500/30 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/5 dark:to-orange-500/5">
          <div className="p-5 border-b border-red-100 dark:border-red-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-red-500 animate-bounce" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">紧急提醒</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  以下证件需要尽快处理
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/reminders')}
              className="text-sm text-red-600 dark:text-red-400 font-medium hover:underline flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-red-100 dark:divide-red-500/10">
            {urgentReminders.map((r) => {
              const days = r.daysRemaining;
              const level = getReminderLevel(days);
              const colorMap: Record<number, string> = {
                7: 'bg-red-500',
                30: 'bg-orange-500',
                60: 'bg-yellow-500',
                90: 'bg-green-500',
              };
              return (
                <div
                  key={r.id}
                  onClick={() => navigate(`/certificates/${r.certificateId}`)}
                  className="p-4 flex items-center gap-4 hover:bg-white/60 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${level ? colorMap[level] : 'bg-gray-400'} animate-ping`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {r.certificate.holderName} · {r.certificate.type}
                      </span>
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${days < 0 ? 'bg-red-500 text-white' : level === 7 ? 'bg-red-500 text-white' : level === 30 ? 'bg-orange-500 text-white' : level === 60 ? 'bg-yellow-500 text-gray-900' : 'bg-green-500 text-white'}
                      `}>
                        {getReminderLabel(days)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      号码: {r.certificate.number.slice(-4)} · 发证: {r.certificate.issuer || '-'}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            即将到期证件
          </h2>
          <button
            onClick={() => navigate('/certificates')}
            className="text-sm text-cyan-600 dark:text-cyan-400 font-medium hover:underline flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {topExpiring.length === 0 ? (
          <div className="py-16 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              很棒！近期没有需要续期的证件
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              请定期返回查看证件状态
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topExpiring.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
