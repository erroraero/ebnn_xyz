import ContactClient from "./ContactClient";
import { createClient } from "@/utils/supabase/server";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Contact Core | EBNN_CORE",
    description: "Contact the sovereign architect.",
};

export default async function ContactPage() {
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("contact_enabled").eq("id", "00000000-0000-0000-0000-000000000000").maybeSingle();

    return <ContactClient isEnabled={profile?.contact_enabled ?? true} />;
}
