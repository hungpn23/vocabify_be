import { UserRole } from "@common/enums";
import { Notification, User } from "@db/entities";
import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";

export class DatabaseSeeder extends Seeder {
	async run(em: EntityManager) {
		console.time("🌱 Seeding database");

		const adminUser = em.create(User, {
			username: "admin",
			email: "admin@example.com",
			password: "Password@123",
			emailVerified: true,
			role: UserRole.ADMIN,
		});

		const demoUser = em.create(User, {
			username: "demo_user",
			email: "demo@example.com",
			password: "Password@123",
			emailVerified: true,
			role: UserRole.USER,
		});

		em.create(Notification, {
			type: "system",
			content: "Welcome to the NestJS boilerplate project.",
			actor: adminUser,
			recipient: demoUser,
		});

		await em.flush();

		console.timeEnd("🌱 Seeding database");
	}
}
