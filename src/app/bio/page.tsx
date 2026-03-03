import { createClient } from "@/utils/supabase/server";
import { BioClient } from "./BioClient";
import { Metadata } from "next";
import { CORE_IDENTITY_ID } from "@/lib/constants";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Broadcasting Configuration | Sovereign Profile",
    description: "Digital presence established.",
};

export default async function BioPage() {
    const supabase = await createClient();

    // Fetch Public Profile: Hardcoded to the CORE_IDENTITY_ID
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", CORE_IDENTITY_ID)
        .maybeSingle();

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

    return <BioClient profile={profile} links={links || []} gallery={gallery || []} />;
}
