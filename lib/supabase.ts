import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://nquphfdjvljysievugju.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xdXBoZmRqdmxqeXNpZXZ1Z2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODkzODAsImV4cCI6MjA5NjU2NTM4MH0.msoIG9MRYbdBOVUyEZNnyjPtGI5JsQmp1utEKGO7_vI"
);