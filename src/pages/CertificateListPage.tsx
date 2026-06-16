import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  X,
  ChevronDown,
  User,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { CertificateCard } from '@/components/CertificateCard';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_TYPE_EMOJI,
  CertificateType,
  SortBy,
  SortOrder,
} from '@/types';

export function CertificateListPage() {
  const navigate = useNavigate();
  const {
    members,
    filters,
    sortBy,
    sortOrder,
    setFilters,
    setSort,
    getFilteredCertificates,
    deleteCertificate,
    exportMemberCertificates,
  } = useAppStore();

  const [showFilters, setShowFilters] = useState(false);

  const certificates = getFilteredCertificates();

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该证件吗？此操作无法撤销。')) {
      deleteCertificate(id);
    }
  };

  const handleExportCurrent = () => {
    if (!filters.holderId) return;
    const text = exportMemberCertificates(filters.holderId);
    if (!text) return;
    const member = members.find((m) => m.id === filters.holderId);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${member?.name || '成员'}-证件清单.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredMember = members.find((m) => m.id === filters.holderId);

  const sortOptions: { label: string; value: SortBy; order: SortOrder }[] = [
    { label: '有效期 近→远', value: 'expiry', order: 'asc' },
    { label: '有效期 远→近', value: 'expiry', order: 'desc' },
    { label: '录入时间 新→旧', value: 'created', order: 'desc' },
    { label: '录入时间 旧→新', value: 'created', order: 'asc' },
  ];

  const currentSortLabel = sortOptions.find(
    (o) => o.value === sortBy && o.order === sortOrder
  )?.label;

  return (
    <div className="space-y-6">
      {filteredMember && (
        <div className="rounded-2xl border border-cyan-200 dark:border-cyan-500/30 bg-gradient-to-r from-cyan-50 to-white dark:from-cyan-500/10 dark:to-gray-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilters({ holderId: undefined })}
                className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all"
                title="返回全部证件"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {filteredMember.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-500" />
                    {filteredMember.name}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({filteredMember.relation})
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    共 {certificates.length} 个证件
                  </p>
                </div>
              </div>
              {filteredMember.notes && (
                <div className="hidden lg:block ml-6 pl-6 border-l border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">档案备注：</span>
                    {filteredMember.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/certificates/new?holderId=${filteredMember.id}`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium text-sm shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                为TA添加证件
              </button>
              <button
                onClick={handleExportCurrent}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                导出清单
              </button>
            </div>
          </div>
          {filteredMember.notes && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                <span className="font-medium text-amber-600 dark:text-amber-400">📝 档案备注：</span>
                {filteredMember.notes}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            {filteredMember ? `${filteredMember.name} 的证件` : '证件管理'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            共 {certificates.length} 个证件，按
            <span className="font-medium text-cyan-600 dark:text-cyan-400">
              {' '}
              有效期剩余天数{' '}
            </span>
            排序
          </p>
        </div>
        <button
          onClick={() => navigate('/certificates/new')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          新增证件
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索证件类型、持证人、证件号码或发证机关..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: undefined })}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-xl border font-medium transition-all
            ${showFilters
              ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
            }
          `}
        >
          <Filter className="w-5 h-5" />
          筛选
          {(filters.type || filters.holderId) && (
            <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">
              {(filters.type ? 1 : 0) + (filters.holderId ? 1 : 0)}
            </span>
          )}
        </button>

        <div className="relative">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-') as [SortBy, SortOrder];
              setSort(by, order);
            }}
            className="appearance-none pl-5 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={`${o.value}-${o.order}`} value={`${o.value}-${o.order}`}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {showFilters && (
        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                证件类型
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ type: undefined })}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${!filters.type
                      ? 'bg-cyan-500 text-white shadow shadow-cyan-500/30'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }
                  `}
                >
                  全部
                </button>
                {CERTIFICATE_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilters({ type: type as CertificateType })}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                      ${filters.type === type
                        ? 'bg-cyan-500 text-white shadow shadow-cyan-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }
                    `}
                  >
                    <span>{CERTIFICATE_TYPE_EMOJI[type]}</span>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                持证人
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ holderId: undefined })}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                    ${!filters.holderId
                      ? 'bg-cyan-500 text-white shadow shadow-cyan-500/30'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }
                  `}
                >
                  全部
                </button>
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFilters({ holderId: m.id })}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${filters.holderId === m.id
                        ? 'bg-cyan-500 text-white shadow shadow-cyan-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      }
                    `}
                  >
                    {m.name} ({m.relation})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(filters.type || filters.holderId || filters.search) && (
            <button
              onClick={() =>
                setFilters({ type: undefined, holderId: undefined, search: undefined })
              }
              className="text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              清除全部筛选条件
            </button>
          )}
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="py-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            没有找到符合条件的证件
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 mb-6">
            尝试修改筛选条件或添加新的证件记录
          </p>
          <button
            onClick={() => navigate('/certificates/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            录入新证件
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
