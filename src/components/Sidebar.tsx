import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Bell,
  Users,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/dashboard', label: '仪表板', icon: LayoutDashboard },
  { path: '/certificates', label: '证件管理', icon: FileText },
  { path: '/certificates/new', label: '新增证件', icon: Plus },
  { path: '/reminders', label: '提醒中心', icon: Bell },
  { path: '/members', label: '家庭成员', icon: Users },
];

export function Sidebar() {
  const location = useLocation();
  const activeRemindersCount = useAppStore((s) => s.getActiveRemindersCount());

  return (
    <aside className="hidden lg:flex w-64 flex-col h-screen bg-gradient-to-b from-[#1e3a5f] to-[#0f1f33] text-white sticky top-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide" style={{ fontFamily: 'Noto Serif SC, serif' }}>
              证件管家
            </h1>
            <p className="text-xs text-cyan-300/70">CertVault</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.path === location.pathname ||
            (item.path === '/certificates' && location.pathname.startsWith('/certificates/'));
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isActive
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-300'} transition-colors`} />
              <span>{item.label}</span>
              {item.path === '/reminders' && activeRemindersCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-500/40">
                  {activeRemindersCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-xs text-white/60 mb-2">💡 温馨提示</p>
          <p className="text-xs text-white/80 leading-relaxed">
            请定期更新证件信息，确保数据准确。照片存储在本地浏览器中，请定期备份。
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const location = useLocation();
  const activeRemindersCount = useAppStore((s) => s.getActiveRemindersCount());

  const mobileItems = navItems.slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex justify-around items-center py-2">
        {mobileItems.map((item) => {
          const isActive =
            item.path === location.pathname ||
            (item.path === '/certificates' && location.pathname.startsWith('/certificates/'));
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors
                ${isActive ? 'text-cyan-600' : 'text-gray-500'}
              `}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.path === '/reminders' && activeRemindersCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeRemindersCount > 9 ? '9+' : activeRemindersCount}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
