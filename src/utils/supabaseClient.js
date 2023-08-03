import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPBASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY;

const supabaseClient = createClient(SUPABASE_URL, SUPBASE_ANON_KEY);

export default supabaseClient;