import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertActivitySchema, insertLearningModuleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  
  // Members routes
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getAllMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.getMemberById(id);
      
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const validatedData = insertMemberSchema.parse(req.body);
      const newMember = await storage.createMember(validatedData);
      res.status(201).json(newMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid member data", errors: (error as z.ZodError).errors });
      }
      res.status(500).json({ message: "Failed to create member" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      let activities = await storage.getAllActivities();
      // Sort by date descending (terbaru di depan)
      activities = activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      // Limit jika ada query limit
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      if (limit) activities = activities.slice(0, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/activities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivityById(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const newActivity = await storage.createActivity(validatedData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: (error as z.ZodError).errors });
      }
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Learning modules routes
  app.get("/api/learning-modules", async (req, res) => {
    try {
      let modules = await storage.getAllLearningModules();
      // Sort by id descending (terbaru di depan, karena learning module tidak punya date)
      modules = modules.sort((a, b) => b.id - a.id);
      // Limit jika ada query limit
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      if (limit) modules = modules.slice(0, limit);
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning modules" });
    }
  });

  app.get("/api/learning-modules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const module = await storage.getLearningModuleById(id);
      
      if (!module) {
        return res.status(404).json({ message: "Learning module not found" });
      }
      
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch learning module" });
    }
  });

  app.post("/api/learning-modules", async (req, res) => {
    try {
      const validatedData = insertLearningModuleSchema.parse(req.body);
      const newModule = await storage.createLearningModule(validatedData);
      res.status(201).json(newModule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid learning module data", errors: (error as z.ZodError).errors });
      }
      res.status(500).json({ message: "Failed to create learning module" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
