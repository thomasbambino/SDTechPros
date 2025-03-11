import { createInitialAdmin } from "./auth";
import { storage } from "./storage";

async function resetAdmin() {
  const hashedPassword = await createInitialAdmin();
  
  const admin = await storage.createUser({
    email: "admin@sdtechpros.com",
    password: hashedPassword,
    name: "System Admin",
    role: "admin"
  });
  
  console.log("Created admin user:", { ...admin, password: "[REDACTED]" });
}

resetAdmin().catch(console.error);
