const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  // تحديد نوع المحرك صراحة
  __internal: {
    engine: {
      type: 'binary' // أو 'library' حسب نظامك
    }
  }
})

module.exports = prisma