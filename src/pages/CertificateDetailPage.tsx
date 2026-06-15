import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  Hash,
  User,
  FileText,
  Image as ImageIcon,
  Clock,
  MapPin,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PhotoViewer } from '@/components/PhotoViewer';
import { DatePicker } from '@/components/DatePicker';
import {
  CERTIFICATE_TYPE_EMOJI,
} from '@/types';
import {
  calculateDaysRemaining,
  formatDate,
  getReminderBgClass,
  getReminderLevel,
  getReminderLabel,
  getReminderTextClass,
} from '@/utils/dateUtils';
import { formatFileSize } from '@/utils/imageUtils';
import {
  getRenewalGuides,
  getRenewalGuideByLocation,
  getValidityYears,
  RenewalGuide,
} from '@/utils/renewalGuide';

export function CertificateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCertificate, deleteCertificate, completeRenewal } = useAppStore();
  const cert = id ? getCertificate(id) : undefined;

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [showRenewalGuide, setShowRenewalGuide] = useState(false);
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [renewalDate, setRenewalDate] = useState('');

  if (!cert) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-5">
          <FileText className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">证件不存在</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">该证件可能已被删除或不存在</p>
        <button
          onClick={() => navigate('/certificates')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
        >
          返回证件列表
        </button>
      </div>
    );
  }

  const days = cert.isPermanent ? Infinity : calculateDaysRemaining(cert.expiryDate);
  const level = cert.isPermanent ? null : getReminderLevel(days);
  const renewalGuides = getRenewalGuides(cert.type);
  const matchedGuide = getRenewalGuideByLocation(cert.type, cert.location);
  const validityYears = getValidityYears(cert.type);

  const handleDelete = () => {
    if (confirm('确定要删除该证件吗？此操作无法撤销。')) {
      deleteCertificate(cert.id);
      navigate('/certificates');
    }
  };

  const handleRenewalComplete = () => {
    if (!renewalDate || !id) return;
    completeRenewal(id, renewalDate);
    setShowRenewalForm(false);
    setRenewalDate('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-5xl drop-shadow-sm">{CERTIFICATE_TYPE_EMOJI[cert.type]}</div>
            <div>
              <h1
                className="text-3xl font-bold text-gray-900 dark:text-white"
                style={{ fontFamily: 'Noto Serif SC, serif' }}
              >
                {cert.type}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                {cert.holderName}
                {!cert.isPermanent && (
                  <>
                    <span className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                    <span className={getReminderTextClass(level, days)}>
                      {getReminderLabel(days)}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/certificates/${cert.id}/edit`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      {!cert.isPermanent && (
        <div
          className={`
            rounded-2xl p-5 border backdrop-blur-sm
            ${getReminderBgClass(level, days)}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${days < 0
                  ? 'bg-red-500/20'
                  : level === 7
                    ? 'bg-red-500/20'
                    : level === 30
                      ? 'bg-orange-500/20'
                      : level === 60
                        ? 'bg-yellow-500/20'
                        : level === 90
                          ? 'bg-green-500/20'
                          : 'bg-gray-500/20'
                }
              `}>
                <Clock className={`w-6 h-6 ${getReminderTextClass(level, days)}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${getReminderTextClass(level, days)}`}>
                  {cert.isPermanent ? '长期有效' : getReminderLabel(days)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  有效期至：{formatDate(cert.expiryDate)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => navigate(`/certificates/${cert.id}/edit`)}
                className={`text-sm font-medium ${getReminderTextClass(level, days)} hover:underline`}
              >
                更新证件信息 →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">证件信息</h2>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow icon={<Hash className="w-4 h-4" />} label="证件号码" value={cert.number} mono />
            <InfoRow icon={<Building2 className="w-4 h-4" />} label="发证机关" value={cert.issuer || '-'} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="所在地" value={cert.location || '未填写'} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">日期信息</h2>
          </div>
          <div className="p-5 space-y-4">
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="签发日期" value={cert.issueDate ? formatDate(cert.issueDate) : '-'} />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="有效期至"
              value={cert.isPermanent ? '长期有效' : formatDate(cert.expiryDate)}
            />
            {cert.renewalCompletedDate && (
              <InfoRow
                icon={<CheckCircle2 className="w-4 h-4" />}
                label="换证完成日期"
                value={formatDate(cert.renewalCompletedDate)}
              />
            )}
          </div>
        </div>
      </div>

      {cert.notes && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">备注信息</h2>
          </div>
          <div className="p-5">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {cert.notes}
            </p>
          </div>
        </div>
      )}

      {!cert.isPermanent && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRenewalGuide(!showRenewalGuide)}
            className="w-full px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-500" />
              换证指南
              <span className="font-normal text-gray-400 text-xs">（{cert.type}到期换领流程）</span>
            </h2>
            {showRenewalGuide ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showRenewalGuide && (
            <div className="p-5 space-y-5">
              {renewalGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className={`
                    rounded-xl p-4 border transition-colors
                    ${matchedGuide?.steps === guide.steps
                      ? 'border-cyan-300 bg-cyan-50/50 dark:border-cyan-500/30 dark:bg-cyan-500/5'
                      : 'border-gray-200 dark:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                      {guide.location}
                    </span>
                    {matchedGuide?.steps === guide.steps && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300">
                        匹配当前所在地
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">换证流程</p>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{guide.steps}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">工本费</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{guide.fee}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">办理时限</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{guide.duration}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">有效期</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{guide.validityYears}年</p>
                      </div>
                    </div>

                    {guide.materials.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">所需材料</p>
                        <div className="flex flex-wrap gap-1.5">
                          {guide.materials.map((mat, mIdx) => (
                            <span
                              key={mIdx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20"
                            >
                              <FileCheck className="w-3 h-3" />
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {guide.tips.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">温馨提示</p>
                        <ul className="space-y-1">
                          {guide.tips.map((tip, tIdx) => (
                            <li key={tIdx} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                              <span className="text-cyan-500 mt-0.5 flex-shrink-0">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                {cert.renewalCompletedDate ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">已记录换证完成</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        换证完成日期：{formatDate(cert.renewalCompletedDate)}，
                        新有效期至：{formatDate(cert.expiryDate)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {!showRenewalForm ? (
                      <button
                        onClick={() => setShowRenewalForm(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        记录换证完成
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20 space-y-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">记录换证完成日期</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          系统将根据证件类型自动计算新的有效期（{cert.type}有效期{validityYears}年）
                        </p>
                        <DatePicker
                          label="换证完成日期"
                          value={renewalDate}
                          onChange={setRenewalDate}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleRenewalComplete}
                            disabled={!renewalDate}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            确认完成
                          </button>
                          <button
                            onClick={() => {
                              setShowRenewalForm(false);
                              setRenewalDate('');
                            }}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            证件照片 ({cert.photos.length})
          </h2>
          {cert.photos.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">点击图片查看大图</span>
          )}
        </div>
        <div className="p-5">
          {cert.photos.length === 0 ? (
            <div className="py-10 text-center rounded-xl bg-gray-50 dark:bg-gray-700/30 border-2 border-dashed border-gray-200 dark:border-gray-600">
              <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                该证件暂无照片存档
              </p>
              <button
                onClick={() => navigate(`/certificates/${cert.id}/edit`)}
                className="mt-3 text-sm text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
              >
                + 上传照片
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cert.photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => setViewerIndex(idx)}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <img
                    src={photo.data}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-xs truncate">{photo.name}</p>
                    <p className="text-white/70 text-[10px]">{formatFileSize(photo.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewerIndex !== null && (
        <PhotoViewer
          photos={cert.photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
        <p className={`text-gray-900 dark:text-white font-medium break-all ${mono ? 'font-mono text-sm' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
