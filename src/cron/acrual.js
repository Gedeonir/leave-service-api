const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function accrueLeave() {
  const users = await prisma.leaveBalance.findMany();
  for (const user of users) {
    await prisma.leaveBalance.update({
      where: { userId: user.userId },
      data: {
        annual: {
          increment: 1.66
        }
      }
    });
  }
  console.log("Leave accrual done");
}

module.exports = accrueLeave;
