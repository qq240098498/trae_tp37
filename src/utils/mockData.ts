import { Certificate, Member, RelationType } from '@/types';
import { addDaysISO, generateId, todayISO } from './dateUtils';

export function generateMockMembers(): Member[] {
  const now = todayISO();
  return [
    {
      id: generateId(),
      name: '张伟',
      relation: '本人',
      createdAt: now,
    },
    {
      id: generateId(),
      name: '李静',
      relation: '配偶',
      createdAt: now,
    },
    {
      id: generateId(),
      name: '张小明',
      relation: '子女',
      createdAt: now,
    },
    {
      id: generateId(),
      name: '张建国',
      relation: '父亲',
      createdAt: now,
    },
  ];
}

export function generateMockCertificates(members: Member[]): Certificate[] {
  const now = todayISO();
  const memberMap = new Map<RelationType, Member>(members.map((m) => [m.relation as RelationType, m]));

  const getMember = (relation: RelationType): Member | undefined => memberMap.get(relation);

  const certs: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'photos'>[] = [
    {
      type: '身份证',
      holderId: getMember('本人')?.id || '',
      holderName: getMember('本人')?.name || '',
      number: '110101199001011234',
      issuer: '北京市公安局朝阳分局',
      issueDate: addDaysISO(now, -365 * 5),
      expiryDate: addDaysISO(now, 60),
      isPermanent: false,
      notes: '户籍地：北京市朝阳区',
    },
    {
      type: '护照',
      holderId: getMember('本人')?.id || '',
      holderName: getMember('本人')?.name || '',
      number: 'E12345678',
      issuer: '国家移民管理局',
      issueDate: addDaysISO(now, -365 * 2),
      expiryDate: addDaysISO(now, 8),
      isPermanent: false,
      notes: '准备办理续签',
    },
    {
      type: '驾驶证',
      holderId: getMember('本人')?.id || '',
      holderName: getMember('本人')?.name || '',
      number: '110101199001011234',
      issuer: '北京市公安局交通管理局',
      issueDate: addDaysISO(now, -365 * 3),
      expiryDate: addDaysISO(now, 365 * 3),
      isPermanent: false,
      notes: 'C1驾照',
    },
    {
      type: '银行卡',
      holderId: getMember('本人')?.id || '',
      holderName: getMember('本人')?.name || '',
      number: '6222021234567890123',
      issuer: '中国工商银行',
      issueDate: addDaysISO(now, -365 * 4),
      expiryDate: addDaysISO(now, 200),
      isPermanent: false,
      notes: '储蓄卡，工资卡',
    },
    {
      type: '社保卡',
      holderId: getMember('配偶')?.id || '',
      holderName: getMember('配偶')?.name || '',
      number: '110101900001123456',
      issuer: '北京市人力资源和社会保障局',
      issueDate: addDaysISO(now, -365 * 6),
      expiryDate: addDaysISO(now, 40),
      isPermanent: false,
    },
    {
      type: '身份证',
      holderId: getMember('子女')?.id || '',
      holderName: getMember('子女')?.name || '',
      number: '110101201505054321',
      issuer: '北京市公安局朝阳分局',
      issueDate: addDaysISO(now, -365),
      expiryDate: addDaysISO(now, 15),
      isPermanent: false,
      notes: '未成年，5年有效期',
    },
    {
      type: '居住证',
      holderId: getMember('父亲')?.id || '',
      holderName: getMember('父亲')?.name || '',
      number: '110105202000012345',
      issuer: '北京市公安局朝阳分局',
      issueDate: addDaysISO(now, -365),
      expiryDate: addDaysISO(now, 5),
      isPermanent: false,
      notes: '每年签注一次',
    },
    {
      type: '港澳通行证',
      holderId: getMember('配偶')?.id || '',
      holderName: getMember('配偶')?.name || '',
      number: 'C87654321',
      issuer: '国家移民管理局',
      issueDate: addDaysISO(now, -365 * 4),
      expiryDate: addDaysISO(now, 120),
      isPermanent: false,
    },
  ];

  return certs.map((c) => ({
    ...c,
    id: generateId(),
    photos: [],
    createdAt: now,
    updatedAt: now,
  }));
}
