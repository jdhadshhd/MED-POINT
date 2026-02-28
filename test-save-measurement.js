// سكربت اختبار إضافة قياس صحي لمريض بالاسم
// شغّله: node test-save-measurement.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // غيّر الاسم حسب الموجود في قاعدة البيانات
  const patientName = "John Doe";

  // ابحث عن المريض بالاسم
  const user = await prisma.user.findFirst({ where: { name: patientName } });
  if (!user) {
    console.log('❌ لم يتم العثور على مريض بهذا الاسم:', patientName);
    return;
  }

  // أضف قياس صحي
  const measurement = await prisma.healthMeasurement.create({
    data: {
      patientId: user.id,
      weight: 70,
      height: 170,
      muacValue: 12.0,
      muacStatus: 'YELLOW',
      bmi: 24.2,
      notes: 'Test measurement',
    }
  });
  console.log('✅ تم إضافة القياس بنجاح:', measurement);
}

main().catch(console.error).finally(() => prisma.$disconnect());
