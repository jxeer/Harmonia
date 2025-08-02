import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { requireAuth } from "./simpleAuth";
import { authRoutes } from "./authRoutes";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import {
  insertPatientProfileSchema,
  insertProviderProfileSchema,
  insertHealthJournalEntrySchema,
  insertAppointmentSchema,
  insertMessageSchema,
  insertMedicalRecordSchema,
  insertProviderReviewSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Import session middleware
  const session = (await import('express-session')).default;
  const createMemoryStore = (await import('memorystore')).default;
  const MemoryStore = createMemoryStore(session);
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'harmonia-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  }));

  // Auth routes
  app.use('/api/auth', authRoutes);

  // Patient profile routes
  app.post('/api/patient/onboarding', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = insertPatientProfileSchema.parse({
        ...req.body,
        userId,
      });

      const profile = await storage.createPatientProfile(profileData);
      
      // Mark user as onboarded
      await storage.upsertUser({
        id: userId,
        isOnboarded: true,
        role: "patient",
      });

      res.json(profile);
    } catch (error) {
      console.error("Error creating patient profile:", error);
      res.status(500).json({ message: "Failed to create patient profile" });
    }
  });

  app.put('/api/patient/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = insertPatientProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updatePatientProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating patient profile:", error);
      res.status(500).json({ message: "Failed to update patient profile" });
    }
  });

  // Provider profile routes
  app.post('/api/provider/onboarding', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = insertProviderProfileSchema.parse({
        ...req.body,
        userId,
      });

      const profile = await storage.createProviderProfile(profileData);
      
      // Mark user as onboarded
      await storage.upsertUser({
        id: userId,
        isOnboarded: true,
        role: "provider",
      });

      res.json(profile);
    } catch (error) {
      console.error("Error creating provider profile:", error);
      res.status(500).json({ message: "Failed to create provider profile" });
    }
  });

  app.put('/api/provider/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = insertProviderProfileSchema.partial().parse(req.body);
      
      const profile = await storage.updateProviderProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating provider profile:", error);
      res.status(500).json({ message: "Failed to update provider profile" });
    }
  });

  // Provider search
  app.get('/api/providers/search', requireAuth, async (req, res) => {
    try {
      const { specialty, culturalBackground, language, location } = req.query;
      
      const providers = await storage.searchProviders({
        specialty: specialty as string,
        culturalBackground: culturalBackground as string,
        language: language as string,
        location: location as string,
      });
      
      res.json(providers);
    } catch (error) {
      console.error("Error searching providers:", error);
      res.status(500).json({ message: "Failed to search providers" });
    }
  });

  // Health journal routes
  app.post('/api/health-journal', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const patientProfile = await storage.getPatientProfile(userId);
      
      if (!patientProfile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const entryData = insertHealthJournalEntrySchema.parse({
        ...req.body,
        patientId: patientProfile.id,
      });

      const entry = await storage.createHealthJournalEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating health journal entry:", error);
      res.status(500).json({ message: "Failed to create health journal entry" });
    }
  });

  app.get('/api/health-journal', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const patientProfile = await storage.getPatientProfile(userId);
      
      if (!patientProfile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const entries = await storage.getHealthJournalEntries(patientProfile.id);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching health journal entries:", error);
      res.status(500).json({ message: "Failed to fetch health journal entries" });
    }
  });

  // Appointment routes
  app.post('/api/appointments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const patientProfile = await storage.getPatientProfile(userId);
      
      if (!patientProfile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        patientId: patientProfile.id,
      });

      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.get('/api/appointments', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const appointments = await storage.getAppointments(userId, user.role as "patient" | "provider");
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.put('/api/appointments/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      
      const appointment = await storage.updateAppointment(id, appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Message routes
  app.post('/api/messages', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });

      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          const clientData = (client as any).userId;
          if (clientData === message.receiverId || clientData === message.senderId) {
            client.send(JSON.stringify({
              type: 'new_message',
              data: message,
            }));
          }
        }
      });

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/messages/:userId', requireAuth, async (req: any, res) => {
    try {
      const senderId = req.user.id;
      const { userId: receiverId } = req.params;
      
      const messages = await storage.getMessages(senderId, receiverId);
      
      // Mark messages as read
      await storage.markMessagesAsRead(senderId, receiverId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/messages', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messages = await storage.getRecentMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      res.status(500).json({ message: "Failed to fetch recent messages" });
    }
  });

  // Medical records routes
  app.post('/api/medical-records', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let patientId: string;
      if (user.role === "patient") {
        const patientProfile = await storage.getPatientProfile(userId);
        if (!patientProfile) {
          return res.status(404).json({ message: "Patient profile not found" });
        }
        patientId = patientProfile.id;
      } else {
        // Provider uploading record for patient
        patientId = req.body.patientId;
        if (!patientId) {
          return res.status(400).json({ message: "Patient ID required" });
        }
      }

      const recordData = insertMedicalRecordSchema.parse({
        ...req.body,
        patientId,
      });

      const record = await storage.createMedicalRecord(recordData);
      res.json(record);
    } catch (error) {
      console.error("Error creating medical record:", error);
      res.status(500).json({ message: "Failed to create medical record" });
    }
  });

  app.get('/api/medical-records', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const patientProfile = await storage.getPatientProfile(userId);
      
      if (!patientProfile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const records = await storage.getMedicalRecords(patientProfile.id);
      res.json(records);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ message: "Failed to fetch medical records" });
    }
  });

  // Review routes
  app.post('/api/reviews', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const patientProfile = await storage.getPatientProfile(userId);
      
      if (!patientProfile) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      const reviewData = insertProviderReviewSchema.parse({
        ...req.body,
        patientId: patientProfile.id,
      });

      const review = await storage.createProviderReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/reviews/:providerId', async (req, res) => {
    try {
      const { providerId } = req.params;
      const reviews = await storage.getProviderReviews(providerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Provider analytics
  app.get('/api/provider/analytics', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const providerProfile = await storage.getProviderProfile(userId);
      
      if (!providerProfile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }

      const analytics = await storage.getProviderAnalytics(providerProfile.id);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching provider analytics:", error);
      res.status(500).json({ message: "Failed to fetch provider analytics" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Object storage routes for medical records
  app.get("/objects/:objectPath(*)", requireAuth, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/medical-record-files", requireAuth, async (req: any, res) => {
    if (!req.body.fileURL) {
      return res.status(400).json({ error: "fileURL is required" });
    }

    const userId = req.user?.claims?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.fileURL,
        {
          owner: userId,
          visibility: "private", // Medical records should be private
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting medical record file:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth') {
          // Store user ID on connection for message routing
          (ws as any).userId = data.userId;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
