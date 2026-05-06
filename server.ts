import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "data.json");

// Initial data structure
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    reports: [],
    users: [
      { id: "admin-1", name: "Admin User", email: "admin@barangay.gov", role: "admin" }
    ]
  }, null, 2));
}

function getDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/reports", (req, res) => {
    const db = getDB();
    res.json(db.reports);
  });

  app.post("/api/reports", (req, res) => {
    const db = getDB();
    const newReport = {
      ...req.body,
      id: `rep-${Date.now()}`,
      status: "pending",
      priority: "medium", // AI will re-classify this later
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.reports.push(newReport);
    saveDB(db);
    res.status(201).json(newReport);
  });

  app.patch("/api/reports/:id", (req, res) => {
    const db = getDB();
    const index = db.reports.findIndex((r: any) => r.id === req.params.id);
    if (index !== -1) {
      db.reports[index] = { ...db.reports[index], ...req.body, updatedAt: new Date().toISOString() };
      saveDB(db);
      res.json(db.reports[index]);
    } else {
      res.status(404).json({ error: "Report not found" });
    }
  });

  app.get("/api/analytics/summary", (req, res) => {
    const db = getDB();
    const reports = db.reports;
    
    const summary = {
      total: reports.length,
      pending: reports.filter((r: any) => r.status === "pending").length,
      resolved: reports.filter((r: any) => r.status === "resolved").length,
      byType: reports.reduce((acc: any, r: any) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {})
    };
    res.json(summary);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
