import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const userRoleEnum = pgEnum("user_role", ["patient", "provider", "admin"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "confirmed", "completed", "cancelled"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);
export const recordTypeEnum = pgEnum("record_type", ["lab_result", "prescription", "imaging", "consultation_note", "other"]);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").default("patient").notNull(),
  isOnboarded: boolean("is_onboarded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patient profiles
export const patientProfiles = pgTable("patient_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender"),
  culturalBackground: varchar("cultural_background"),
  primaryLanguage: varchar("primary_language"),
  secondaryLanguages: text("secondary_languages").array(),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  medicalConditions: text("medical_conditions").array(),
  medications: text("medications").array(),
  allergies: text("allergies").array(),
  culturalPractices: text("cultural_practices"),
  dietaryRestrictions: text("dietary_restrictions"),
  insuranceProvider: varchar("insurance_provider"),
  insurancePolicyNumber: varchar("insurance_policy_number"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider profiles
export const providerProfiles = pgTable("provider_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  specialty: varchar("specialty").notNull(),
  culturalBackgrounds: text("cultural_backgrounds").array(),
  languagesSpoken: text("languages_spoken").array(),
  licenseNumber: varchar("license_number"),
  yearsOfExperience: integer("years_of_experience"),
  education: text("education"),
  certifications: text("certifications").array(),
  bio: text("bio"),
  culturalCompetencyStatement: text("cultural_competency_statement"),
  telehealth: boolean("telehealth").default(false),
  inPerson: boolean("in_person").default(false),
  acceptsInsurance: boolean("accepts_insurance").default(false),
  location: varchar("location"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviewCount: integer("review_count").default(0),
  subscriptionTier: varchar("subscription_tier").default("basic"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health journal entries
export const healthJournalEntries = pgTable("health_journal_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patientProfiles.id, { onDelete: "cascade" }),
  entryDate: timestamp("entry_date").notNull(),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  bloodGlucose: integer("blood_glucose"),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  weightUnit: varchar("weight_unit").default("lbs"),
  mood: varchar("mood"),
  sleepHours: decimal("sleep_hours", { precision: 3, scale: 1 }),
  sleepQuality: varchar("sleep_quality"),
  physicalActivity: text("physical_activity"),
  traditionalPractices: text("traditional_practices"),
  communityConnection: text("community_connection"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patientProfiles.id),
  providerId: varchar("provider_id").notNull().references(() => providerProfiles.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(30), // minutes
  type: varchar("type").notNull(), // "consultation", "follow-up", "check-up"
  status: appointmentStatusEnum("status").default("scheduled"),
  isVirtual: boolean("is_virtual").default(false),
  meetingLink: varchar("meeting_link"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  content: text("content").notNull(),
  status: messageStatusEnum("status").default("sent"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical records
export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patientProfiles.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id").references(() => providerProfiles.id),
  title: varchar("title").notNull(),
  description: text("description"),
  recordType: recordTypeEnum("record_type").notNull(),
  fileUrl: varchar("file_url"),
  fileName: varchar("file_name"),
  fileSize: integer("file_size"),
  recordDate: timestamp("record_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Provider reviews
export const providerReviews = pgTable("provider_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patientProfiles.id),
  providerId: varchar("provider_id").notNull().references(() => providerProfiles.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  rating: integer("rating").notNull(), // 1-5
  culturalCompetencyRating: integer("cultural_competency_rating").notNull(), // 1-5
  comment: text("comment"),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  patientProfile: one(patientProfiles, {
    fields: [users.id],
    references: [patientProfiles.userId],
  }),
  providerProfile: one(providerProfiles, {
    fields: [users.id],
    references: [providerProfiles.userId],
  }),
}));

export const patientProfilesRelations = relations(patientProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [patientProfiles.userId],
    references: [users.id],
  }),
  healthJournalEntries: many(healthJournalEntries),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  reviews: many(providerReviews),
}));

export const providerProfilesRelations = relations(providerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [providerProfiles.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
  reviews: many(providerReviews),
}));

export const healthJournalEntriesRelations = relations(healthJournalEntries, ({ one }) => ({
  patient: one(patientProfiles, {
    fields: [healthJournalEntries.patientId],
    references: [patientProfiles.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patientProfiles, {
    fields: [appointments.patientId],
    references: [patientProfiles.id],
  }),
  provider: one(providerProfiles, {
    fields: [appointments.providerId],
    references: [providerProfiles.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
  appointment: one(appointments, {
    fields: [messages.appointmentId],
    references: [appointments.id],
  }),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  patient: one(patientProfiles, {
    fields: [medicalRecords.patientId],
    references: [patientProfiles.id],
  }),
  provider: one(providerProfiles, {
    fields: [medicalRecords.providerId],
    references: [providerProfiles.id],
  }),
}));

export const providerReviewsRelations = relations(providerReviews, ({ one }) => ({
  patient: one(patientProfiles, {
    fields: [providerReviews.patientId],
    references: [providerReviews.id],
  }),
  provider: one(providerProfiles, {
    fields: [providerReviews.providerId],
    references: [providerReviews.id],
  }),
  appointment: one(appointments, {
    fields: [providerReviews.appointmentId],
    references: [appointments.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientProfileSchema = createInsertSchema(patientProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProviderProfileSchema = createInsertSchema(providerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthJournalEntrySchema = createInsertSchema(healthJournalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({
  id: true,
  createdAt: true,
});

export const insertProviderReviewSchema = createInsertSchema(providerReviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;
export type PatientProfile = typeof patientProfiles.$inferSelect;
export type InsertProviderProfile = z.infer<typeof insertProviderProfileSchema>;
export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type InsertHealthJournalEntry = z.infer<typeof insertHealthJournalEntrySchema>;
export type HealthJournalEntry = typeof healthJournalEntries.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertProviderReview = z.infer<typeof insertProviderReviewSchema>;
export type ProviderReview = typeof providerReviews.$inferSelect;
