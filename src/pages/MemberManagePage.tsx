import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  UserPlus,
  FileText,
  Download,
  Eye,
  StickyNote,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Member, RELATION_TYPES, RelationType } from '@/types';

export function MemberManagePage() {
  const navigate = useNavigate();
  const {
    members,
    certificates,
    addMember,
    updateMember,
    deleteMember,
    setFilters,
    exportMemberCertificates,
  } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    relation: RelationType;
    notes: string;
  }>({
    name: '',
    relation: '本人',
    notes: '',
  });

  const resetForm = () => {
    setForm({ name: '', relation: '本人', notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (m: Member) => {
    setForm({ name: m.name, relation: m.relation, notes: m.notes || '' });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      updateMember(editingId, {
        name: form.name.trim(),
        relation: form.relation,
        notes: form.notes.trim() || undefined,
      });
    } else {
      addMember({
        name: form.name.trim(),
        relation: form.relation,
        notes: form.notes.trim() || undefined,
      });
    }
    resetForm();
  };

  const handleDelete = (m: Member) => {
    const certCount = certificates.filter((c) => c.holderId === m.id).length;
    if (certCount > 0) {
      alert(`该成员下有 ${certCount} 个证件，请先处理相关证件后再删除。`);
      return;
    }
    if (confirm(`确定要删除成员「${m.name}」吗？`)) {
      deleteMember(m.id);
    }
  };

  const handleViewCerts = (m: Member) => {
    setFilters({ holderId: m.id, type: undefined, search: undefined });
    navigate('/certificates');
  };

  const handleExport = (m: Member) => {
    const text = exportMemberCertificates(m.id);
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${m.name}-证件清单.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const memberCertCount = (memberId: string) =>
    certificates.filter((c) => c.holderId === memberId).length;

  const avatarColors = [
    'from-rose-400 to-pink-500',
    'from-amber-400 to-orange-500',
    'from-emerald-400 to-teal-500',
    'from-cyan-400 to-blue-500',
    'from-violet-400 to-purple-500',
    'from-fuchsia-400 to-pink-500',
  ];

  const getAvatarColor = (name: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return avatarColors[(hash + idx) % avatarColors.length];
  };

  const relationColors: Record<RelationType, string> = {
    本人: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400',
    配偶: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
    父亲: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    母亲: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400',
    子女: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    其他: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            style={{ fontFamily: 'Noto Serif SC, serif' }}
          >
            家庭成员
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            已登记 {members.length} 位家庭成员，共关联 {certificates.length} 个证件
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          添加成员
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-cyan-200 dark:border-cyan-500/30 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-500/10 dark:to-gray-800 overflow-hidden">
          <div className="p-5 border-b border-cyan-100 dark:border-cyan-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {editingId ? '编辑成员' : '添加新成员'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                填写成员基本信息及家属档案备注
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="请输入姓名"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  与户主关系 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.relation}
                  onChange={(e) =>
                    setForm({ ...form, relation: e.target.value as RelationType })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                >
                  {RELATION_TYPES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-amber-500" />
                  家属档案备注
                </span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="例如：孩子护照有效期5年；老人证件统一保管；每年11月需办理居住证签注等..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                记录该家庭成员的证件管理要点，方便统一管理老人/孩子的证件
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors shadow shadow-cyan-500/20"
              >
                <Check className="w-4 h-4" />
                {editingId ? '保存修改' : '添加成员'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {members.length === 0 ? (
        <div className="py-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mb-2">
            还没有家庭成员信息
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
            添加家庭成员后，可以为他们分别录入证件
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            添加第一位成员
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member, idx) => {
            const certCount = memberCertCount(member.id);
            return (
              <div
                key={member.id}
                className="group rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getAvatarColor(
                        member.name,
                        idx
                      )} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${relationColors[member.relation]}`}
                      >
                        {member.relation}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(member)}
                      className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 flex items-center justify-center transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {member.notes && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <StickyNote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                        {member.notes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-cyan-500 shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">关联证件</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {certCount}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
                        个
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewCerts(member)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-medium text-sm hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    查看证件
                  </button>
                  <button
                    onClick={() => handleExport(member)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    导出清单
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {members.length > 0 && (
        <div className="text-center pt-4">
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-cyan-400 hover:text-cyan-500 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            继续添加成员
          </button>
        </div>
      )}
    </div>
  );
}
