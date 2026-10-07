import { createInsertSchema } from "drizzle-zod";
import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const postsTable = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  caption: text("caption").notNull().default(""),
  objectPath: varchar("object_path", { length: 512 }).notNull().unique(),
  mediaType: mediaTypeEnum("media_type").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  authorId: varchar("author_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type PostRecord = typeof postsTable.$inferSelect;
