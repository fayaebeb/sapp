import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import fetch from "node-fetch";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messages = await storage.getUserMessages(req.user.id);
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const result = insertMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    const message = await storage.createMessage(req.user.id, result.data);
    res.status(201).json(message);
  });

  // Proxy endpoint for Langflow API
  app.post("/api/langflow/:langflowId/run/:flowId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { langflowId, flowId } = req.params;
    const langflowToken = process.env.VITE_LANGFLOW_TOKEN;

    try {
      console.log('Sending request to Langflow API with body:', JSON.stringify(req.body, null, 2));

      const response = await fetch(
        `https://api.langflow.astra.datastax.com/lf/${langflowId}/api/v1/run/${flowId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${langflowToken}`
          },
          body: JSON.stringify(req.body)
        }
      );

      const data = await response.json();
      console.log('Langflow API Response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.detail || "Failed to process message");
      }

      // Extract the message from the response
      if (data?.outputs?.[0]?.outputs?.[0]?.message?.text) {
        data.result = data.outputs[0].outputs[0].message.text;
      } else if (data?.outputs?.[0]?.message?.text) {
        data.result = data.outputs[0].message.text;
      }

      res.json(data);
    } catch (error) {
      console.error("Langflow API error:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}