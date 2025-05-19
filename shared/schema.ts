import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  fieldName: text("field_name").notNull(),
  batchName: text("batch_name").notNull(),
  batchYear: integer("batch_year").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  membershipStatus: text("membership_status").notNull(),
  photoUrl: text("photo_url"),
  qrCode: text("qr_code"),
  email: text("email"),
  phone: text("phone"),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
});

export const learningModules = pgTable("learning_modules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  link: text("link").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export const insertLearningModuleSchema = createInsertSchema(learningModules).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertLearningModule = z.infer<typeof insertLearningModuleSchema>;

export type User = typeof users.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type LearningModule = typeof learningModules.$inferSelect;
