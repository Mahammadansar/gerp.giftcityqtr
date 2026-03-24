import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    ['manage', 'all'],
    ['read', 'dashboard'],
    ['read', 'erp'],
    ['write', 'erp'],
    ['approve', 'purchaseOrder'],
    ['read', 'sales'],
    ['read', 'purchasing'],
    ['read', 'inventory'],
    ['read', 'finance'],
    ['read', 'hr'],
    ['read', 'projects'],
    ['read', 'approvals'],
    ['read', 'settings'],
    ['manage', 'users']
  ];

  for (const [action, resource] of permissions) {
    await prisma.permission.upsert({
      where: { action_resource: { action, resource } },
      update: {},
      create: { action, resource }
    });
  }

  const org = await prisma.organization.upsert({
    where: { code: 'GCQ' },
    update: {},
    create: { name: 'Gift City Qatar', code: 'GCQ' }
  });

  const superAdminRole = await prisma.role.upsert({
    where: { orgId_name: { orgId: org.id, name: 'super_admin' } },
    update: {},
    create: { orgId: org.id, name: 'super_admin' }
  });

  const allPerms = await prisma.permission.findMany();
  for (const p of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: p.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: p.id }
    });
  }

  const passwordHash = await bcrypt.hash('Admin@12345', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@giftcity.qa' },
    update: { passwordHash, orgId: org.id, fullName: 'System Admin' },
    create: { orgId: org.id, fullName: 'System Admin', email: 'admin@giftcity.qa', passwordHash }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: superAdminRole.id }
  });

  await prisma.customer.createMany({
    data: [
      { orgId: org.id, name: 'Al Raha Events', email: 'ops@alraha.qa', phone: '5551001' },
      { orgId: org.id, name: 'Gulf Advertising LLC', email: 'contact@gulfad.qa', phone: '5551002' }
    ],
    skipDuplicates: true
  });

  console.log('Seed complete. Admin login: admin@giftcity.qa / Admin@12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
