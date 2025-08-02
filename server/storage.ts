import {
  users,
  patientProfiles,
  providerProfiles,
  healthJournalEntries,
  appointments,
  messages,
  medicalRecords,
  providerReviews,
  type User,
  type UpsertUser,
  type PatientProfile,
  type InsertPatientProfile,
  type ProviderProfile,
  type InsertProviderProfile,
  type HealthJournalEntry,
  type InsertHealthJournalEntry,
  type Appointment,
  type InsertAppointment,
  type Message,
  type InsertMessage,
  type MedicalRecord,
  type InsertMedicalRecord,
  type ProviderReview,
  type InsertProviderReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, or, sql, inArray } from "drizzle-orm";

export type CreateUser = {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  role?: "patient" | "provider" | "admin";
};

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: CreateUser): Promise<User>;
  
  // Patient operations
  getPatientProfile(userId: string): Promise<PatientProfile | undefined>;
  createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile>;
  updatePatientProfile(userId: string, profile: Partial<InsertPatientProfile>): Promise<PatientProfile>;
  
  // Provider operations
  getProviderProfile(userId: string): Promise<ProviderProfile | undefined>;
  getProviderProfileById(id: string): Promise<ProviderProfile | undefined>;
  createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile>;
  updateProviderProfile(userId: string, profile: Partial<InsertProviderProfile>): Promise<ProviderProfile>;
  searchProviders(filters: {
    specialty?: string;
    culturalBackground?: string;
    language?: string;
    location?: string;
  }): Promise<(ProviderProfile & { user: User })[]>;
  
  // Health journal operations
  createHealthJournalEntry(entry: InsertHealthJournalEntry): Promise<HealthJournalEntry>;
  getHealthJournalEntries(patientId: string, limit?: number): Promise<HealthJournalEntry[]>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(userId: string, role: "patient" | "provider"): Promise<(Appointment & { patient: PatientProfile & { user: User }, provider: ProviderProfile & { user: User } })[]>;
  getAppointmentById(id: string): Promise<(Appointment & { patient: PatientProfile & { user: User }, provider: ProviderProfile & { user: User } }) | undefined>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId1: string, userId2: string): Promise<(Message & { sender: User, receiver: User })[]>;
  getRecentMessages(userId: string): Promise<(Message & { sender: User, receiver: User })[]>;
  markMessagesAsRead(receiverId: string, senderId: string): Promise<void>;
  
  // Medical record operations
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;
  getMedicalRecords(patientId: string): Promise<(MedicalRecord & { provider?: ProviderProfile & { user: User } })[]>;
  
  // Review operations
  createProviderReview(review: InsertProviderReview): Promise<ProviderReview>;
  getProviderReviews(providerId: string): Promise<(ProviderReview & { patient: PatientProfile & { user: User } })[]>;
  updateProviderRating(providerId: string): Promise<void>;
  
  // Analytics
  getProviderAnalytics(providerId: string): Promise<{
    totalPatients: number;
    totalAppointments: number;
    avgRating: number;
    reviewCount: number;
    monthlyAppointments: { month: string; count: number }[];
  }>;
  
  // Admin operations
  getAllUsers(): Promise<(User & { patientProfile?: PatientProfile, providerProfile?: ProviderProfile })[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    totalPatients: number;
    totalProviders: number;
    totalAppointments: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: CreateUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Patient operations
  async getPatientProfile(userId: string): Promise<PatientProfile | undefined> {
    const [profile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, userId));
    return profile;
  }

  async createPatientProfile(profile: InsertPatientProfile): Promise<PatientProfile> {
    const [created] = await db
      .insert(patientProfiles)
      .values(profile)
      .returning();
    return created;
  }

  async updatePatientProfile(userId: string, profile: Partial<InsertPatientProfile>): Promise<PatientProfile> {
    const [updated] = await db
      .update(patientProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(patientProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Provider operations
  async getProviderProfile(userId: string): Promise<ProviderProfile | undefined> {
    const [profile] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, userId));
    return profile;
  }

  async getProviderProfileById(id: string): Promise<ProviderProfile | undefined> {
    const [profile] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.id, id));
    return profile;
  }

  async createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile> {
    const [created] = await db
      .insert(providerProfiles)
      .values(profile)
      .returning();
    return created;
  }

  async updateProviderProfile(userId: string, profile: Partial<InsertProviderProfile>): Promise<ProviderProfile> {
    const [updated] = await db
      .update(providerProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(providerProfiles.userId, userId))
      .returning();
    return updated;
  }

  async searchProviders(filters: {
    specialty?: string;
    culturalBackground?: string;
    language?: string;
    location?: string;
  }): Promise<(ProviderProfile & { user: User })[]> {
    let query = db
      .select()
      .from(providerProfiles)
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .where(eq(providerProfiles.isVerified, true));

    const conditions = [];

    if (filters.specialty) {
      conditions.push(like(providerProfiles.specialty, `%${filters.specialty}%`));
    }

    if (filters.culturalBackground) {
      conditions.push(sql`${providerProfiles.culturalBackgrounds} @> ARRAY[${filters.culturalBackground}]`);
    }

    if (filters.language) {
      conditions.push(sql`${providerProfiles.languagesSpoken} @> ARRAY[${filters.language}]`);
    }

    if (filters.location) {
      conditions.push(like(providerProfiles.location, `%${filters.location}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(providerProfiles.rating), desc(providerProfiles.reviewCount))
      .limit(50);

    return results.map(result => ({
      ...result.provider_profiles,
      user: result.users,
    }));
  }

  // Health journal operations
  async createHealthJournalEntry(entry: InsertHealthJournalEntry): Promise<HealthJournalEntry> {
    const [created] = await db
      .insert(healthJournalEntries)
      .values(entry)
      .returning();
    return created;
  }

  async getHealthJournalEntries(patientId: string, limit = 30): Promise<HealthJournalEntry[]> {
    return await db
      .select()
      .from(healthJournalEntries)
      .where(eq(healthJournalEntries.patientId, patientId))
      .orderBy(desc(healthJournalEntries.entryDate))
      .limit(limit);
  }

  // Appointment operations
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return created;
  }

  async getAppointments(userId: string, role: "patient" | "provider"): Promise<(Appointment & { patient: PatientProfile & { user: User }, provider: ProviderProfile & { user: User } })[]> {
    const userProfile = role === "patient" 
      ? await this.getPatientProfile(userId)
      : await this.getProviderProfile(userId);

    if (!userProfile) return [];

    const results = await db
      .select()
      .from(appointments)
      .innerJoin(patientProfiles, eq(appointments.patientId, patientProfiles.id))
      .innerJoin(providerProfiles, eq(appointments.providerId, providerProfiles.id))
      .innerJoin(users, eq(patientProfiles.userId, users.id))
      .innerJoin(
        { providerUsers: users },
        eq(providerProfiles.userId, sql`${users.id}`)
      )
      .where(
        role === "patient"
          ? eq(appointments.patientId, userProfile.id)
          : eq(appointments.providerId, userProfile.id)
      )
      .orderBy(asc(appointments.appointmentDate));

    return results.map(result => ({
      ...result.appointments,
      patient: {
        ...result.patient_profiles,
        user: result.users,
      },
      provider: {
        ...result.provider_profiles,
        user: result.providerUsers,
      },
    }));
  }

  async getAppointmentById(id: string): Promise<(Appointment & { patient: PatientProfile & { user: User }, provider: ProviderProfile & { user: User } }) | undefined> {
    const [result] = await db
      .select()
      .from(appointments)
      .innerJoin(patientProfiles, eq(appointments.patientId, patientProfiles.id))
      .innerJoin(providerProfiles, eq(appointments.providerId, providerProfiles.id))
      .innerJoin(users, eq(patientProfiles.userId, users.id))
      .innerJoin(
        { providerUsers: users },
        eq(providerProfiles.userId, sql`${users.id}`)
      )
      .where(eq(appointments.id, id));

    if (!result) return undefined;

    return {
      ...result.appointments,
      patient: {
        ...result.patient_profiles,
        user: result.users,
      },
      provider: {
        ...result.provider_profiles,
        user: result.providerUsers,
      },
    };
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment> {
    const [updated] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db
      .insert(messages)
      .values(message)
      .returning();
    return created;
  }

  async getMessages(userId1: string, userId2: string): Promise<(Message & { sender: User, receiver: User })[]> {
    const results = await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .innerJoin({ receiver: users }, eq(messages.receiverId, sql`${users.id}`))
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt));

    return results.map(result => ({
      ...result.messages,
      sender: result.users,
      receiver: result.receiver,
    }));
  }

  async getRecentMessages(userId: string): Promise<(Message & { sender: User, receiver: User })[]> {
    // Get the most recent message with each unique contact
    const results = await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .innerJoin({ receiver: users }, eq(messages.receiverId, sql`${users.id}`))
      .where(
        or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
      )
      .orderBy(desc(messages.createdAt))
      .limit(20);

    return results.map(result => ({
      ...result.messages,
      sender: result.users,
      receiver: result.receiver,
    }));
  }

  async markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.receiverId, receiverId),
          eq(messages.senderId, senderId),
          eq(messages.isRead, false)
        )
      );
  }

  // Medical record operations
  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [created] = await db
      .insert(medicalRecords)
      .values(record)
      .returning();
    return created;
  }

  async getMedicalRecords(patientId: string): Promise<(MedicalRecord & { provider?: ProviderProfile & { user: User } })[]> {
    const results = await db
      .select()
      .from(medicalRecords)
      .leftJoin(providerProfiles, eq(medicalRecords.providerId, providerProfiles.id))
      .leftJoin(users, eq(providerProfiles.userId, users.id))
      .where(eq(medicalRecords.patientId, patientId))
      .orderBy(desc(medicalRecords.recordDate));

    return results.map(result => ({
      ...result.medical_records,
      provider: result.provider_profiles && result.users ? {
        ...result.provider_profiles,
        user: result.users,
      } : undefined,
    }));
  }

  // Review operations
  async createProviderReview(review: InsertProviderReview): Promise<ProviderReview> {
    const [created] = await db
      .insert(providerReviews)
      .values(review)
      .returning();
    
    // Update provider rating
    await this.updateProviderRating(review.providerId);
    
    return created;
  }

  async getProviderReviews(providerId: string): Promise<(ProviderReview & { patient: PatientProfile & { user: User } })[]> {
    const results = await db
      .select()
      .from(providerReviews)
      .innerJoin(patientProfiles, eq(providerReviews.patientId, patientProfiles.id))
      .innerJoin(users, eq(patientProfiles.userId, users.id))
      .where(eq(providerReviews.providerId, providerId))
      .orderBy(desc(providerReviews.createdAt));

    return results.map(result => ({
      ...result.provider_reviews,
      patient: {
        ...result.patient_profiles,
        user: result.users,
      },
    }));
  }

  async updateProviderRating(providerId: string): Promise<void> {
    const [result] = await db
      .select({
        avgRating: sql<number>`AVG(${providerReviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(providerReviews)
      .where(eq(providerReviews.providerId, providerId));

    if (result) {
      await db
        .update(providerProfiles)
        .set({
          rating: result.avgRating.toFixed(2),
          reviewCount: result.count,
        })
        .where(eq(providerProfiles.id, providerId));
    }
  }

  // Analytics
  async getProviderAnalytics(providerId: string): Promise<{
    totalPatients: number;
    totalAppointments: number;
    avgRating: number;
    reviewCount: number;
    monthlyAppointments: { month: string; count: number }[];
  }> {
    const [provider] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.id, providerId));

    if (!provider) {
      return {
        totalPatients: 0,
        totalAppointments: 0,
        avgRating: 0,
        reviewCount: 0,
        monthlyAppointments: [],
      };
    }

    const [totalAppointments] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(appointments)
      .where(eq(appointments.providerId, providerId));

    const [uniquePatients] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${appointments.patientId})` })
      .from(appointments)
      .where(eq(appointments.providerId, providerId));

    // Get monthly appointments for the last 12 months
    const monthlyResults = await db
      .select({
        month: sql<string>`TO_CHAR(${appointments.appointmentDate}, 'YYYY-MM')`,
        count: sql<number>`COUNT(*)`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.providerId, providerId),
          sql`${appointments.appointmentDate} >= NOW() - INTERVAL '12 months'`
        )
      )
      .groupBy(sql`TO_CHAR(${appointments.appointmentDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${appointments.appointmentDate}, 'YYYY-MM')`);

    return {
      totalPatients: uniquePatients.count,
      totalAppointments: totalAppointments.count,
      avgRating: parseFloat(provider.rating || "0"),
      reviewCount: provider.reviewCount || 0,
      monthlyAppointments: monthlyResults,
    };
  }

  // Admin operations
  async getAllUsers(): Promise<(User & { patientProfile?: PatientProfile, providerProfile?: ProviderProfile })[]> {
    const results = await db
      .select()
      .from(users)
      .leftJoin(patientProfiles, eq(users.id, patientProfiles.userId))
      .leftJoin(providerProfiles, eq(users.id, providerProfiles.userId))
      .orderBy(desc(users.createdAt));

    return results.map(result => ({
      ...result.users,
      patientProfile: result.patient_profiles || undefined,
      providerProfile: result.provider_profiles || undefined,
    }));
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    totalPatients: number;
    totalProviders: number;
    totalAppointments: number;
  }> {
    const [totalUsers] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users);

    const [totalPatients] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(patientProfiles);

    const [totalProviders] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(providerProfiles);

    const [totalAppointments] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(appointments);

    return {
      totalUsers: totalUsers.count,
      totalPatients: totalPatients.count,
      totalProviders: totalProviders.count,
      totalAppointments: totalAppointments.count,
    };
  }
}

export const storage = new DatabaseStorage();
