import { protectAdminPage } from "@/lib/auth-checks";
import BioAdminClient from "./BioAdminClient";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { CORE_IDENTITY_ID } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Configuration Synchronized | Admin",
    description: "System Command Center",
};

export default async function AdminPage() {
    await protectAdminPage(); 
    const supabase = await createClient();

    // Fetch Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", CORE_IDENTITY_ID)
        .maybeSingle(); // Better for dev if table is empty

    // Fetch Links
    const { data: links } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", CORE_IDENTITY_ID)
        .order("order_index", { ascending: true });

    // Fetch Gallery
    const { data: gallery } = await supabase
        .from("gallery")
        .select("*")
        .eq("user_id", CORE_IDENTITY_ID)
        .order("created_at", { ascending: false });

    return <BioAdminClient initialProfile={profile} initialLinks={links || []} initialGallery={gallery || []} />;
}
