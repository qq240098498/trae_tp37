import { CertificateType } from '@/types';

export interface RenewalGuide {
  steps: string;
  location: string;
  fee: string;
  duration: string;
  validityYears: number;
  materials: string[];
  tips: string[];
}

const GUIDES: Record<CertificateType, RenewalGuide[]> = {
  身份证: [
    {
      steps: '携带旧证+户口本到户籍所在地派出所办理换领',
      location: '全国通用',
      fee: '20元（丢失补领40元）',
      duration: '15-30个工作日',
      validityYears: 20,
      materials: ['旧身份证原件', '户口本原件', '近期免冠照片（现场可拍）'],
      tips: ['可提前3个月办理换证', '部分地区支持异地换领', '临时身份证3个工作日内可取'],
    },
    {
      steps: '异地换领：携带居住证+旧证+户口本到居住地派出所',
      location: '异地办理',
      fee: '20元（丢失补领40元）',
      duration: '30-60个工作日',
      validityYears: 20,
      materials: ['旧身份证原件', '户口本原件', '居住证', '近期免冠照片（现场可拍）'],
      tips: ['需提前确认当地是否支持异地办理', '部分城市开通了线上预约', '办理期间可申领临时身份证'],
    },
  ],
  护照: [
    {
      steps: '携带旧护照+身份证+户口本到出入境管理处办理',
      location: '全国通用',
      fee: '120元',
      duration: '7-15个工作日',
      validityYears: 10,
      materials: ['旧护照原件', '身份证原件及复印件', '户口本原件及复印件', '近期2寸白底照片'],
      tips: ['可提前1年办理换发', '部分城市支持网上预约', '换发后旧护照会被剪角注销'],
    },
  ],
  驾驶证: [
    {
      steps: '携带旧证+身份证+体检证明到车管所或交警大队办理',
      location: '全国通用',
      fee: '10元',
      duration: '1个工作日',
      validityYears: 10,
      materials: ['旧驾驶证原件', '身份证原件', '县级或以上医院体检证明', '1寸白底照片'],
      tips: ['可提前90天办理换证', '支持交管12123 APP线上换证', '逾期未换证超过1年需重考科目一'],
    },
    {
      steps: '通过交管12123 APP线上办理换证',
      location: '线上办理',
      fee: '10元+邮寄费',
      duration: '3-5个工作日（邮寄）',
      validityYears: 10,
      materials: ['旧驾驶证', '在线体检（指定医院）', '电子照片'],
      tips: ['需先完成线上体检', '仅限本人办理', '支持邮寄到家'],
    },
  ],
  港澳通行证: [
    {
      steps: '携带旧证+身份证到出入境管理处办理换发',
      location: '全国通用',
      fee: '60元（换发）+签注费15元/次',
      duration: '7-10个工作日',
      validityYears: 10,
      materials: ['旧通行证原件', '身份证原件及复印件', '近期2寸白底照片'],
      tips: ['可同时办理签注', '支持自助签注机即时办理签注', '部分城市支持线上申请'],
    },
  ],
  台湾通行证: [
    {
      steps: '携带旧证+身份证到出入境管理处办理换发',
      location: '全国通用',
      fee: '60元（换发）+签注费15元/次',
      duration: '7-10个工作日',
      validityYears: 10,
      materials: ['旧通行证原件', '身份证原件及复印件', '近期2寸白底照片'],
      tips: ['需先确认入台证办理条件', '部分城市开放自由行', '签注有效期注意与通行证有效期区分'],
    },
  ],
  居住证: [
    {
      steps: '携带旧证+居住证明+身份证到居住地派出所办理签注/换领',
      location: '全国通用',
      fee: '免费',
      duration: '当场办结（签注）/ 15个工作日（换领）',
      validityYears: 1,
      materials: ['旧居住证', '身份证原件', '居住证明（租房合同/房产证等）', '就业证明或就读证明'],
      tips: ['每年需签注一次', '逾期未签注超过30天需重新申请', '部分地区支持线上签注'],
    },
  ],
  社保卡: [
    {
      steps: '携带旧卡+身份证到社保局或合作银行网点办理换卡',
      location: '全国通用',
      fee: '免费（部分银行收工本费约20元）',
      duration: '15-30个工作日',
      validityYears: 10,
      materials: ['旧社保卡', '身份证原件', '1寸白底照片'],
      tips: ['换卡期间旧卡可用', '部分银行支持即时制卡', '新卡需激活金融功能'],
    },
  ],
  银行卡: [
    {
      steps: '携带旧卡+身份证到开户银行网点办理换卡',
      location: '全国通用',
      fee: '5-20元（部分银行免费）',
      duration: '当场办结（同号换卡7-15个工作日）',
      validityYears: 5,
      materials: ['旧银行卡', '身份证原件'],
      tips: ['同号换卡可保留原有账号', '信用卡到期银行会自动寄送新卡', '换卡后需更新绑定的第三方支付'],
    },
  ],
  其他: [
    {
      steps: '请联系发证机关了解具体换证流程',
      location: '通用',
      fee: '以发证机关公示为准',
      duration: '以发证机关公示为准',
      validityYears: 5,
      materials: ['旧证件原件', '身份证明文件'],
      tips: ['建议提前1-3个月办理换证', '办理前可先电话咨询发证机关'],
    },
  ],
};

export function getRenewalGuides(type: CertificateType): RenewalGuide[] {
  return GUIDES[type] || GUIDES['其他'];
}

export function getRenewalGuideByLocation(type: CertificateType, location?: string): RenewalGuide | null {
  const guides = getRenewalGuides(type);
  if (!location || guides.length === 0) return guides[0] || null;
  const match = guides.find((g) => g.location === location);
  return match || guides[0];
}

export function getValidityYears(type: CertificateType): number {
  const guides = getRenewalGuides(type);
  return guides[0]?.validityYears || 5;
}

export const LOCATION_OPTIONS = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '天津',
  '重庆',
  '成都',
  '杭州',
  '南京',
  '武汉',
  '其他城市',
];
