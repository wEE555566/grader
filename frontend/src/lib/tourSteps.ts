import type { TourStep } from '@/components/OnboardingTour';

/* ================================================================
   Tour Steps for each page
   ================================================================ */

/**
 * Workspace page tour — explains the workspace dashboard.
 * Target selectors use `[data-tour="..."]` attributes that must be
 * added to the corresponding UI elements.
 */
export const workspaceTourSteps: TourStep[] = [
  {
    targetSelector: '[data-tour="create-workspace"]',
    title: '🆕 สร้างพื้นที่ทำงาน',
    description: 'กดปุ่มนี้เพื่อสร้างพื้นที่ทำงานใหม่ สำหรับจัดกลุ่มข้อสอบของคุณ เช่น แยกเป็นรายวิชาหรือรายชั้นเรียน',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="workspace-card"]',
    title: '📁 การ์ดพื้นที่ทำงาน',
    description: 'แต่ละการ์ดคือพื้นที่ทำงานของคุณ กดเพื่อเข้าไปดูข้อสอบ สร้างข้อสอบใหม่ หรือจัดการชุดข้อสอบ',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="sidebar-nav"]',
    title: '📋 เมนูนำทาง',
    description: 'เมนูด้านซ้ายจะพาคุณไปยังฟีเจอร์ต่างๆ เช่น คลังข้อสอบ ประวัติ รายงาน ประเมินคุณภาพ และอื่นๆ',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="sidebar-create"]',
    title: '✨ สร้างข้อสอบด้วย AI',
    description: 'กดปุ่มนี้เพื่อเริ่มสร้างข้อสอบใหม่ ระบบ AI จะช่วยสร้างข้อสอบจากเนื้อหาที่คุณใส่ได้ทั้งปรนัยและข้อเขียน',
    position: 'right',
  },
];

/**
 * Repository page tour — explains the public exam set repository.
 */
export const repositoryTourSteps: TourStep[] = [
  {
    targetSelector: '[data-tour="repo-search"]',
    title: '🔍 ค้นหาข้อสอบ',
    description: 'พิมพ์คำค้นหาเพื่อหาชุดข้อสอบจากคลังสาธารณะ สามารถค้นหาตามชื่อ หัวข้อ หรือเนื้อหาได้',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="repo-card"]',
    title: '📄 การ์ดชุดข้อสอบ',
    description: 'แต่ละการ์ดคือชุดข้อสอบที่ถูกเผยแพร่จากผู้ใช้อื่น คุณสามารถดูรายละเอียด หรือ Clone มาใช้งานได้',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="repo-filter"]',
    title: '🏷️ ตัวกรอง',
    description: 'ใช้ตัวกรองเพื่อจำกัดผลลัพธ์ตามประเภท หัวข้อ หรือสิทธิ์การใช้งาน (Creative Commons)',
    position: 'bottom',
  },
];

/**
 * Generator page tour — explains the AI quiz generator.
 */
export const generatorTourSteps: TourStep[] = [
  {
    targetSelector: '[data-tour="gen-title"]',
    title: '📌 ชื่อชุดข้อสอบ',
    description: 'ตั้งชื่อชุดข้อสอบเพื่อจัดหมวดหมู่ เช่น "ข้อสอบบท 3 เรื่องพลังงาน"',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="gen-content"]',
    title: '📄 เนื้อหาสำหรับออกข้อสอบ',
    description: 'ใส่เนื้อหาที่ต้องการออกข้อสอบ ยิ่งเนื้อหาละเอียดมากเท่าไหร่ AI จะยิ่งสร้างข้อสอบได้ดีขึ้น รองรับทั้งพิมพ์เองและอัปโหลดเอกสาร',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="gen-type"]',
    title: '📝 เลือกประเภทข้อสอบ',
    description: 'เลือกระหว่างปรนัย (MCQ) ที่มีตัวเลือก หรือข้อเขียน (Essay) ที่นักเรียนเขียนตอบเอง พร้อมเกณฑ์การตรวจอัตโนมัติ',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="gen-style"]',
    title: '🎨 รูปแบบการออกข้อสอบ',
    description: 'เลือกรูปแบบตามต้องการ: ตรงประเด็น, วิเคราะห์, สถานการณ์จริง, ท้าทาย หรือกำหนดเอง',
    position: 'top',
  },
  {
    targetSelector: '[data-tour="gen-options"]',
    title: '🔧 ตัวเลือกเพิ่มเติม',
    description: 'กำหนดจำนวนข้อ จำนวนตัวเลือก และระดับพฤติกรรมตาม Bloom\'s Taxonomy (ความจำ → การสร้างสรรค์)',
    position: 'top',
  },
  {
    targetSelector: '[data-tour="gen-submit"]',
    title: '🤖 เริ่มสร้างข้อสอบ',
    description: 'กดปุ่มนี้เพื่อให้ AI สร้างข้อสอบอัจฉริยะ อาจใช้เวลาสักครู่ขึ้นอยู่กับจำนวนข้อ',
    position: 'top',
  },
];
