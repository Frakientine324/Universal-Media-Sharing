import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const objectUploadsTable = pgTable("object_uploads", {
  objectPath: varchar("object_path", { length: 512 }).primaryKey(),
  ownerId: varchar("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  postId: uuid("post_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const insertObjectUploadSchema = createInsertSchema(objectUploadsTable).omit({
  createdAt: true,
});
export type InsertObjectUpload = z.infer<typeof insertObjectUploadSchema>;
export type ObjectUpload = typeof objectUploadsTable.$inferSelect;
