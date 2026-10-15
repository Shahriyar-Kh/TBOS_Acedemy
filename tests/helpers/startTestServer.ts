import { createSupabaseTestServer } from "./supabaseTestServer";

const server = createSupabaseTestServer({ port: 54321 });
server
  .start()
  .then(() => {
    console.log("Supabase test server listening on http://127.0.0.1:54321");
  })
  .catch((err) => {
    console.error("Failed to start supabase test server:", err);
    process.exit(1);
  });
