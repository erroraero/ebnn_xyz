import GuestbookClient from "./GuestbookClient";
import { getGuestbookNotes } from "@/app/actions/guestbook";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: "Guestbook | EBNN_CORE",
    description: "Leave a trace in the digital archive.",
};

export default async function GuestbookPage() {
    const initialNotes = await getGuestbookNotes();
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("guestbook_enabled").eq("id", "00000000-0000-0000-0000-000000000000").maybeSingle();

    return <GuestbookClient initialNotes={initialNotes} isEnabled={profile?.guestbook_enabled ?? true} />;
}
