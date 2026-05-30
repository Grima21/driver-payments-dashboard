import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ixnlvofaqqslvkpqlrhv.supabase.co";
const supabaseKey = "sb_publishable_18wLG22xnhiyjVKHrumEOQ_u1IOHALZ";

export const supabase = createClient(supabaseUrl, supabaseKey);
