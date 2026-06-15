import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PhotoUploader } from '@/components/PhotoUploader';
import { DatePicker } from '@/components/DatePicker';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_TYPE_EMOJI,
  Certificate,
  CertificatePhoto,
  CertificateType,
  Member,
  RELATION_TYPES,
  RelationType,
} from '@/types';

interface FormState {
  type: CertificateType;
  holderId: string;
  holderName: string;
  number: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  isPermanent: boolean;
  notes: string;
  photos: CertificatePhoto[];
  newMemberName: string;
  newMemberRelation: RelationType;
  useNewMember: boolean;
}

export function CertificateFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const {
    members,
    certificates,
    addMember,
    addCertificate,
    updateCertificate,
  } = useAppStore();

  const editingCert = isEdit
    ? certificates.find((c) => c.id === id)
    : undefined;

  const [form, setForm] = useState<FormState>({
    type: editingCert?.type || '身份证',
    holderId: editingCert?.holderId || (members[0]?.id || ''),
    holderName: editingCert?.holderName || (members[0]?.name || ''),
    number: editingCert?.number || '',
    issuer: editingCert?.issuer || '',
    issueDate: editingCert?.issueDate || '',
    expiryDate: editingCert?.expiryDate || '',
    isPermanent: editingCert?.isPermanent || false,
    notes: editingCert?.notes || '',
    photos: editingCert?.photos || [],
    newMemberName: '',
    newMemberRelation: '本人',
    useNewMember: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && !editingCert) {
      navigate('/certificates', { replace: true });
    }
  }, [isEdit, editingCert, navigate]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'holderId' && !f.useNewMember) {
        const m = members.find((m) => m.id === value);
        if (m) {
          next.holderName = m.name;
        }
      }
      return next;
    });
    if (errors[key as string]) {
      setErrors((e) => ({ ...e, [key as string]: '' }));
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.type) e.type = '请选择证件类型';
    if (form.useNewMember) {
      if (!form.newMemberName.trim()) e.newMemberName = '请输入成员姓名';
    } else {
      if (!form.holderId) e.holderId = '请选择持证人';
    }
    if (!form.number.trim()) e.number = '请输入证件号码';
    if (!form.issuer.trim()) e.issuer = '请输入发证机关';
    if (!form.isPermanent && !form.expiryDate) e.expiryDate = '请选择有效期截止日期';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalHolderId = form.holderId;
    let finalHolderName = form.holderName;

    if (form.useNewMember && form.newMemberName.trim()) {
      const newMember: Omit<Member, 'id' | 'createdAt'> = {
        name: form.newMemberName.trim(),
        relation: form.newMemberRelation,
      };
      const tempId = 'temp-' + Date.now();
      const membersBefore = useAppStore.getState().members;
      addMember(newMember);
      const membersAfter = useAppStore.getState().members;
      const added = membersAfter.find(
        (m) => !membersBefore.find((bm) => bm.id === m.id) && m.name === form.newMemberName.trim()
      );
      if (added) {
        finalHolderId = added.id;
        finalHolderName = added.name;
      } else {
        finalHolderId = tempId;
        finalHolderName = form.newMemberName.trim();
      }
    }

    const data = {
      type: form.type,
      holderId: finalHolderId,
      holderName: finalHolderName,
      number: form.number.trim(),
      issuer: form.issuer.trim(),
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      isPermanent: form.isPermanent,
      notes: form.notes.trim() || undefined,
      photos: form.photos,
    };

    if (isEdit && id) {
      updateCertificate(id, data);
    } else {
      addCertificate(data);
    }
    navigate('/certificates');
  };

  if (isEdit && !editingCert) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            {isEdit ? '编辑证件' : '新增证件'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isEdit ? '修改证件信息，支持续期更新' : '录入家庭成员的重要证件信息'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">基本信息</h2>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                证件类型 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CERTIFICATE_TYPES.map((type) => {
                  const selected = form.type === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => updateField('type', type)}
                      className={`
                        flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
                        ${selected
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <span className="text-2xl">{CERTIFICATE_TYPE_EMOJI[type]}</span>
                      <span
                        className={`text-xs font-medium ${selected ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-600 dark:text-gray-400'}`}
                      >
                        {type}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.type && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.type}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                持证人 <span className="text-red-500">*</span>
              </label>

              {!form.useNewMember ? (
                <div className="space-y-3">
                  <select
                    value={form.holderId}
                    onChange={(e) => updateField('holderId', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                  >
                    <option value="">请选择家庭成员</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}（{m.relation}）
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateField('useNewMember', true)}
                    className="text-sm text-cyan-600 dark:text-cyan-400 font-medium hover:underline"
                  >
                    + 添加新家庭成员
                  </button>
                  {errors.holderId && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.holderId}</p>}
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-200 dark:border-cyan-500/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">姓名</label>
                      <input
                        type="text"
                        value={form.newMemberName}
                        onChange={(e) => updateField('newMemberName', e.target.value)}
                        placeholder="输入成员姓名"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                      />
                      {errors.newMemberName && <p className="mt-1 text-xs text-red-500">{errors.newMemberName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">关系</label>
                      <select
                        value={form.newMemberRelation}
                        onChange={(e) => updateField('newMemberRelation', e.target.value as RelationType)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                      >
                        {RELATION_TYPES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateField('useNewMember', false)}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ← 从已有成员中选择
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                证件号码 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.number}
                onChange={(e) => updateField('number', e.target.value)}
                placeholder="请输入完整的证件号码"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
              {errors.number && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                发证机关 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.issuer}
                onChange={(e) => updateField('issuer', e.target.value)}
                placeholder="如：北京市公安局XX分局"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
              />
              {errors.issuer && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.issuer}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white">有效期信息</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPermanent}
                onChange={(e) => updateField('isPermanent', e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">长期有效</span>
            </label>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <DatePicker
              label="签发日期（选填）"
              value={form.issueDate}
              onChange={(d) => updateField('issueDate', d)}
              max={form.expiryDate || undefined}
            />
            {!form.isPermanent ? (
              <DatePicker
                label={`有效期至 ${errors.expiryDate ? '' : '*'}`}
                value={form.expiryDate}
                onChange={(d) => updateField('expiryDate', d)}
                min={form.issueDate || undefined}
              />
            ) : (
              <div className="flex items-end">
                <div className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm italic flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  该证件为长期有效，无需续期
                </div>
              </div>
            )}
            {errors.expiryDate && (
              <p className="md:col-span-2 -mt-3 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />{errors.expiryDate}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">备注信息</h2>
          </div>
          <div className="p-6">
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="可填写备注信息，如银行卡密码提示、办理地点等（非必填）"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">证件照片 / 扫描件</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              支持上传证件的正反面照片、扫描件，用于电子化存档，数据仅保存在本地
            </p>
          </div>
          <div className="p-6">
            <PhotoUploader
              photos={form.photos}
              onChange={(photos) => updateField('photos', photos)}
              maxCount={5}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
          >
            <Save className="w-5 h-5" />
            {isEdit ? '保存修改' : '保存证件'}
          </button>
        </div>
      </form>
    </div>
  );
}
