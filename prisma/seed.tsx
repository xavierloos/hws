// import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client'
import bcrypt from "bcryptjs";
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Pa$$w0rd!', 10);
  // const users = Array.from({ length: 10 }, (_, i) => ({
  //   username: `john${i}`,
  //   name: `john ${i}`,
  //   email: `john${i}@dummydata.com`,
  //   emailVerified: false,
  //   isActive: true,
  //   image: 'clvr3c08j0005xa9cy3rh0g4u.jpeg',
  //   password: hashedPassword,
  //   about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  //   tel: '0123456789',
  //   birthday: new Date("1990-01-01").toISOString(),
  //   role: undefined,
  //   permission: undefined,
  //   otpEnabled: false,
  //   emailNotificationsEnabled: false,
  //   smsNotificationsEnabled: false,
  // }));

  const tasks = Array.from({ length: 5 }, (_, i) => ({
    name: `Create new user onboarding flow ${i}`,
    type: 'Bug',
    priority: { name: 'High', color: 'danger' },
    dueDate: `2025-0${i++}-01`,
    assignedIds: ['cm1p7zb310000kfk2zsnpu0di', 'cm1p7zb330001kfk2b744eech'],
    description: "Design and implement a user-friendly onboarding process",
    status: { name: "In Progress", color: "yellow" },
    createdBy: "john0@dummydata.com",
    createdAt: new Date(`2024-0${i++}-01`).toISOString(),
    modifiedAt: new Date(`2024-0${i++}-01`).toISOString(),
  }));

  try {
    // await prisma.$executeRawUnsafe('TRUNCATE TABLE "task" CASCADE');
    await prisma.task.createMany({
      data: tasks,
    });
    // await prisma.user.createMany({
    //   data: users,
    // });
    console.log("Seeded successfully!");
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();