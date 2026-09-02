import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? "changeme123";

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 10) },
  });
  console.log(`Admin ready: ${admin.email}`);

  const turf = await prisma.turf.upsert({
    where: { id: "turf-1" },
    update: {},
    create: { id: "turf-1", name: "Turf 1", description: "Main 5-a-side turf", isActive: true },
  });
  console.log(`Turf ready: ${turf.name}`);

  // 5:00 AM to 11:00 PM, 1.5-hour slots = exactly 12 slots per day.
  const SLOT_MINUTES = 90;
  const DAY_START_HOUR = 5;
  const DAY_END_HOUR = 23;
  const slotsPerDay = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES;

  console.log(`Creating ${slotsPerDay} slots per day...`);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() + dayOffset);

    console.log(`Day ${dayOffset}: ${day.toISOString().split('T')[0]}`);

    for (let i = 0; i < slotsPerDay; i++) {
      const start = new Date(day);
      start.setUTCHours(DAY_START_HOUR, 0, 0, 0);
      start.setUTCMinutes(start.getUTCMinutes() + i * SLOT_MINUTES);

      const end = new Date(start);
      end.setUTCMinutes(end.getUTCMinutes() + SLOT_MINUTES);

      try {
        await prisma.slot.create({
          data: { 
            turfId: turf.id, 
            date: day, 
            startTime: start, 
            endTime: end, 
            price: 1500,
            status: "AVAILABLE"
          },
        });
        console.log(`  Slot ${i+1}: ${start.toISOString().substring(11, 16)}`);
      } catch (err) {
        console.error(`Error at slot ${i}:`, err.message);
      }
    }
  }
  console.log(`Seed slots ready: ${slotsPerDay}/day for the next 7 days.`);
}

main()
  .catch((e) => { console.error("Main error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });