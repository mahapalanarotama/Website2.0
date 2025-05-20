import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
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
  gender: text("gender"), // Tambah gender
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

// Perbaiki error .pick pada insertUserSchema
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Perbaiki error: Type 'string' is not assignable to type 'never'.
// Pastikan .omit() dan .pick() tidak menyebabkan type 'never'.
// Solusi: tambahkan z.object schema manual untuk insertMemberSchema, insertActivitySchema, dst.

export const insertMemberSchema = z.object({
  fullName: z.string(),
  fieldName: z.string(),
  batchName: z.string(),
  batchYear: z.number(),
  registrationNumber: z.string(),
  membershipStatus: z.string(),
  photoUrl: z.string().optional(),
  qrCode: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
});

export const insertActivitySchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  imageUrl: z.string().optional(),
  category: z.string(),
});

export const insertLearningModuleSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  link: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertLearningModule = z.infer<typeof insertLearningModuleSchema>;

export type User = typeof users.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type LearningModule = typeof learningModules.$inferSelect;
