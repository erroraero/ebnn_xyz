"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Trash2, Save, LogOut, Image, Layout,
    Loader2, ArrowLeft, ExternalLink, RefreshCw, Upload, Eye,
    Search, MapPin, CheckCircle2, AlertCircle, X
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { updateProfile, uploadAvatar } from "@/app/actions/profile";
import { addLink, removeLink, updateLink } from "@/app/actions/links";
import { uploadMedia, deleteMedia } from "@/app/actions/gallery";
import { uploadMusic, uploadMusicCover, uploadCustomLinkIcon } from "@/app/actions/music";
import { deleteGuestbookNotes, deleteAllGuestbookNotes } from "@/app/actions/guestbook";
import { deleteContactSubmission } from "@/app/actions/contact";
import { Music, Github, Instagram, Twitter, Mail, Disc, MessageSquare, Clock, Paperclip, Download } from "lucide-react";
import Link from "next/link";
import { BioClient } from "../BioClient";

// Premium Toast Component
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 glass rounded-2xl border ${type === 'success' ? 'border-white/20' : 'border-red-500/50'} min-w-[320px] shadow-2xl shadow-black`}
        >
            {type === 'success' ? <CheckCircle2 className="w-5 h-5 text-white" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
            <span className="text-sm font-black font-outfit uppercase tracking-tighter flex-1">{message}</span>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white/40" />
            </button>
        </motion.div>
    );
}

export default function BioAdminClient({ initialProfile, initialLinks, initialGallery }: { initialProfile: any, initialLinks: any[], initialGallery: any[] }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'gallery' | 'music' | 'guestbook' | 'contact' | 'preview'>('profile');
    const [profile, setProfile] = useState({
        handle: initialProfile?.handle || "ebnn",
        bio: initialProfile?.bio || "",
        discord_id: initialProfile?.discord_id || "",
        location_lat: initialProfile?.location_lat || 28.6139,
        location_lon: initialProfile?.location_lon || 77.2090,
        location_name: initialProfile?.location_name || "Delhi, India",
        avatar_url: initialProfile?.avatar_url || "",
        music_title: initialProfile?.music_title || "",
        music_artist: initialProfile?.music_artist || "",
        music_url: initialProfile?.music_url || "",
        music_cover_url: initialProfile?.music_cover_url || "",
        music_enabled: initialProfile?.music_enabled || false,
        guestbook_enabled: initialProfile?.guestbook_enabled ?? true,
        contact_enabled: initialProfile?.contact_enabled ?? true
    });
    const [guestbookNotes, setGuestbookNotes] = useState<any[]>([]);
    const [contactSubmissions, setContactSubmissions] = useState<any[]>([]);
    const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
    const [links, setLinks] = useState((initialLinks || []).map(link => ({
        ...link,
        name: link.name || "",
        url: link.url || "",
        icon: link.icon || "",
        custom_icon_url: link.custom_icon_url || ""
    })));
    const [gallery, setGallery] = useState(initialGallery || []);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Location Search State
    const [locationSearch, setLocationSearch] = useState("");
    const [locationResults, setLocationResults] = useState<any[]>([]);
    const [searchingLocation, setSearchingLocation] = useState(false);

    useEffect(() => {
        if (activeTab === 'guestbook') {
            fetchGuestbook();
        }
        if (activeTab === 'contact') {
            fetchContacts();
        }
    }, [activeTab]);

    const fetchContacts = async () => {
        const { data } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
        setContactSubmissions(data || []);
    };

    const fetchGuestbook = async () => {
        const { data } = await supabase.from('guestbook').select('*').order('created_at', { ascending: false });
        setGuestbookNotes(data || []);
    };

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const handleAddLink = async () => {
        setLoading(true);
        const res = await addLink("New Link", "https://", "ExternalLink");
        if (res.success) {
            window.location.reload();
        } else {
            showToast(res.error || "Failed to add link", 'error');
        }
        setLoading(false);
    };

    const handleRemoveLink = async (id: string) => {
        if (confirm("De-link this resource?")) {
            setLoading(true);
            const res = await removeLink(id);
            if (res.success) {
                setLinks(links.filter(l => l.id !== id));
                showToast("Resource Terminated");
            } else {
                showToast(res.error || "Failed to remove link", 'error');
            }
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        const formData = new FormData();
        Object.entries(profile).forEach(([key, value]) => formData.append(key, value as string));

        const res = await updateProfile(formData);
        if (res.success) {
            showToast("Configuration Synchronized.");
        } else {
            showToast(res.error || "Synchronization Failed", 'error');
        }
        setLoading(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const res = await uploadAvatar(file);
        if (res.success && res.url) {
            setProfile({ ...profile, avatar_url: res.url });
            showToast("Identity Portrait Updated");
        } else {
            showToast(res.error || "Upload Failed", 'error');
        }
        setLoading(false);
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const res = await uploadMedia(file);
        if (res.success) {
            window.location.reload();
        } else {
            showToast(res.error || "Gallery Upload Failed", 'error');
        }
        setLoading(false);
    };

    const handleDeleteGallery = async (id: string, url: string) => {
        if (confirm("Delete this media from gallery?")) {
            setLoading(true);
            const res = await deleteMedia(id, url);
            if (res.success) {
                setGallery(gallery.filter(m => m.id !== id));
                showToast("Archive Entry Purged");
            } else {
                showToast(res.error || "Deletion Failed", 'error');
            }
            setLoading(false);
        }
    };

    const searchLocations = async () => {
        if (locationSearch.length < 2) return;
        setSearchingLocation(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationSearch)}&limit=5`);
            const data = await res.json();
            setLocationResults(data);
        } catch (err) {
            console.error(err);
        }
        setSearchingLocation(false);
    };

    const selectLocation = (loc: any) => {
        setProfile({
            ...profile,
            location_name: loc.display_name.split(',')[0] + ', ' + (loc.address?.country || loc.display_name.split(',').pop()).trim(),
            location_lat: parseFloat(loc.lat),
            location_lon: parseFloat(loc.lon)
        });
        setLocationResults([]);
        setLocationSearch("");
        showToast("Location Registered");
    };

    const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        const res = await uploadMusic(file);
        if (res.success && res.url) {
            setProfile({ ...profile, music_url: res.url });
            showToast("Frequency Uploaded");
        } else {
            showToast(res.error || "Broadcast Failed", 'error');
        }
        setLoading(false);
    };

    const handleMusicCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        const res = await uploadMusicCover(file);
        if (res.success && res.url) {
            setProfile({ ...profile, music_cover_url: res.url });
            showToast("Cover Visual Applied");
        } else {
            showToast(res.error || "Upload Failed", 'error');
        }
        setLoading(false);
    };

    const handleCustomLinkIconUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        const res = await uploadCustomLinkIcon(file);
        if (res.success && res.url) {
            const newLinks = [...links];
            newLinks[index].custom_icon_url = res.url;
            newLinks[index].icon = "Custom";
            setLinks(newLinks);
            await updateLink(newLinks[index].id, newLinks[index].name, newLinks[index].url, "Custom", res.url);
            showToast("Custom Icon Synchronized");
        } else {
            showToast(res.error || "Icon Upload Failed", 'error');
        }
        setLoading(false);
    };

    const applyLinkTemplate = async (index: number, type: 'Github' | 'Instagram' | 'Discord' | 'Mail') => {
        const templates = {
            Github: { name: "Github", icon: "Github", url: "https://github.com/" },
            Instagram: { name: "Instagram", icon: "Instagram", url: "https://instagram.com/" },
            Discord: { name: "Discord", icon: "Twitter", url: "https://discord.gg/" },
            Mail: { name: "Mail", icon: "Mail", url: "mailto:" },
        };
        const t = templates[type];
        const newLinks = [...links];
        newLinks[index] = { ...newLinks[index], ...t, custom_icon_url: "" };
        setLinks(newLinks);
        await updateLink(newLinks[index].id, t.name, t.url, t.icon, "");
        showToast(`${type} Template Applied`);
    };

    const handleNoteDelete = async (ids: string[]) => {
        if (!confirm(`Delete ${ids.length === 1 ? 'this note' : ids.length + ' notes'}?`)) return;
        setLoading(true);
        const res = await deleteGuestbookNotes(ids);
        if (res.success) {
            setGuestbookNotes(guestbookNotes.filter(n => !ids.includes(n.id)));
            setSelectedNotes([]);
            showToast("Archive Entry Terminated");
        }
        setLoading(false);
    };

    const handleClearGuestbook = async () => {
        if (!confirm("CRITICAL: Wipe entire guestbook history? This cannot be undone.")) return;
        setLoading(true);
        const res = await deleteAllGuestbookNotes();
        if (res.success) {
            setGuestbookNotes([]);
            showToast("Digital Archive Purged");
        }
        setLoading(false);
    };

    const handleContactDelete = async (id: string) => {
        if (!confirm("Terminate this contact record?")) return;
        setLoading(true);
        const res = await deleteContactSubmission(id);
        if (res.success) {
            setContactSubmissions(contactSubmissions.filter(c => c.id !== id));
            showToast("Transmission Log Purged");
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <main className="min-h-screen bg-black text-white font-inter selection:bg-white/20 relative">
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-6 py-12">

                {/* Superior Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-20">
                    <div className="space-y-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase font-black tracking-widest mb-4">
                            <ArrowLeft className="w-4 h-4" /> Go back
                        </Link>
                        <h1 className="text-5xl font-black font-outfit uppercase tracking-tighter">Configuration Synchronized</h1>
                        <p className="text-white/40 font-medium italic tracking-wide">Orchestrate your digital sovereign presence.</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 glass rounded-2xl hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest border border-white/5 text-white/60"
                        >
                            Terminate Session
                        </button>
                    </div>
                </header>

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 mt-12">

                    {/* Navigation Sidebar / Mobile Scroll */}
                    <nav className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide sticky top-4 z-30 bg-black/50 backdrop-blur-md lg:bg-transparent lg:static">
                        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<RefreshCw className="w-4 h-4" />} label="Metadata" />
                        <TabButton active={activeTab === 'links'} onClick={() => setActiveTab('links')} icon={<Layout className="w-4 h-4" />} label="Links" />
                        <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon={<Image className="w-4 h-4" />} label="Gallery" />
                        <TabButton active={activeTab === 'music'} onClick={() => setActiveTab('music')} icon={<Music className="w-4 h-4" />} label="Music" />
                        <TabButton active={activeTab === 'guestbook'} onClick={() => setActiveTab('guestbook')} icon={<MessageSquare className="w-4 h-4" />} label="Guestbook" />
                        <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} icon={<Mail className="w-4 h-4" />} label="Contacts" />
                        <TabButton active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} icon={<Eye className="w-4 h-4" />} label="Preview" />
                    </nav>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.section
                                    key="profile"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-12 pb-24"
                                >
                                    {/* Portrait Upload */}
                                    <div className="p-6 md:p-10 glass rounded-[2.5rem] md:rounded-[3rem] border-white/5 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                                        <label className="relative group cursor-pointer">
                                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/30">
                                                {profile.avatar_url ? (
                                                    <img src={profile.avatar_url} className="w-full h-full object-cover grayscale" />
                                                ) : (
                                                    <Upload className="w-8 h-8 text-white/20 group-hover:scale-110 group-hover:text-white transition-all" />
                                                )}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                        </label>
                                        <div className="space-y-4 text-center md:text-left">
                                            <h2 className="text-xl md:text-2xl font-black font-outfit uppercase tracking-tighter">Identify Node</h2>
                                            <p className="text-xs md:text-sm text-white/40 max-w-xs leading-relaxed">System-wide identification used across all linked bio nodes.</p>
                                            <label className="inline-flex cursor-pointer px-6 py-2 bg-white text-black text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all">
                                                {loading && activeTab === 'profile' ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Select File"}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Metadata Fields */}
                                    <div className="p-6 md:p-10 glass rounded-[2.5rem] md:rounded-[3rem] border-white/5 space-y-6 md:space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Instance Handle</label>
                                                <input
                                                    className="w-full bg-white/5 px-6 py-4 rounded-2xl border border-white/5 outline-none focus:border-white/20 transition-all font-outfit font-bold"
                                                    value={profile.handle}
                                                    onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Universal Identity ID</label>
                                                <input
                                                    className="w-full bg-white/5 px-6 py-4 rounded-2xl border border-white/5 outline-none focus:border-white/20 transition-all font-outfit font-bold"
                                                    value={profile.discord_id}
                                                    placeholder="Discord User ID"
                                                    onChange={(e) => setProfile({ ...profile, discord_id: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Location Search Field */}
                                        <div className="space-y-2 relative">
                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Geographic Coordinates ({profile.location_name})</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                                    <input
                                                        className="w-full bg-white/5 pl-12 pr-6 py-4 rounded-2xl border border-white/5 outline-none focus:border-white/20 transition-all italic font-medium"
                                                        placeholder="Search location (e.g. Hyderabad, India)"
                                                        value={locationSearch}
                                                        onChange={(e) => setLocationSearch(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && searchLocations()}
                                                    />
                                                </div>
                                                <button
                                                    onClick={searchLocations}
                                                    className="px-6 glass rounded-2xl border border-white/5 hover:bg-white/5 transition-all"
                                                >
                                                    {searchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            {/* Location Results Dropdown */}
                                            <AnimatePresence>
                                                {locationResults.length > 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute z-50 w-full mt-2 glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-3xl"
                                                    >
                                                        {locationResults.map((loc, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => selectLocation(loc)}
                                                                className="w-full px-6 py-4 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 text-sm font-medium flex items-center gap-3"
                                                            >
                                                                <MapPin className="w-3 h-3 text-white/20" />
                                                                <span className="truncate">{loc.display_name}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">System Logs / Bio</label>
                                            <textarea
                                                className="w-full bg-white/5 px-6 py-4 rounded-3xl border border-white/5 outline-none focus:border-white/20 transition-all min-h-[140px] italic font-medium"
                                                value={profile.bio}
                                                placeholder="Enter a descriptive bio..."
                                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={loading}
                                                className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : "Deploy Metadata"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === 'links' && (
                                <motion.section
                                    key="links"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="flex justify-between items-center mb-12">
                                        <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter">Routing Hub</h2>
                                        <button
                                            onClick={handleAddLink}
                                            className="p-4 glass rounded-2xl hover:bg-white/5 transition-all border border-white/5"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {links.map((link, i) => (
                                            <motion.div
                                                layout
                                                key={link.id || i}
                                                className="p-6 md:p-8 glass rounded-[2.5rem] md:rounded-[3.5rem] border-white/5 flex flex-col gap-6 md:gap-8 group"
                                            >
                                                <div className="flex flex-col lg:flex-row items-center gap-6 md:gap-8">
                                                    {/* Custom Icon Upload */}
                                                    <div className="space-y-4 text-center shrink-0">
                                                        <label className="relative group/icon cursor-pointer block">
                                                            <div className="w-20 h-20 glass rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover/icon:border-white/30">
                                                                {link.custom_icon_url ? (
                                                                    <img src={link.custom_icon_url} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Upload className="w-6 h-6 text-white/20" />
                                                                )}
                                                            </div>
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCustomLinkIconUpload(i, e)} />
                                                        </label>
                                                        <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Icon</p>
                                                    </div>

                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest">Label</label>
                                                            <input
                                                                className="w-full bg-white/5 px-6 py-4 rounded-xl border border-white/5 text-sm font-black font-outfit uppercase outline-none focus:border-white/20 transition-all font-outfit"
                                                                value={link.name}
                                                                placeholder="Label"
                                                                onBlur={async () => {
                                                                    const res = await updateLink(link.id, link.name, link.url, link.icon, link.custom_icon_url);
                                                                    if (res.success) showToast("Resource Saved");
                                                                }}
                                                                onChange={(e) => {
                                                                    const newLinks = [...links];
                                                                    newLinks[i].name = e.target.value;
                                                                    setLinks(newLinks);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] uppercase font-black text-white/30 tracking-widest">Endpoint</label>
                                                            <input
                                                                className="w-full bg-white/5 px-6 py-4 rounded-xl border border-white/5 text-sm outline-none focus:border-white/20 transition-all italic text-white/60"
                                                                value={link.url}
                                                                placeholder="Destination URL"
                                                                onBlur={async () => {
                                                                    const res = await updateLink(link.id, link.name, link.url, link.icon, link.custom_icon_url);
                                                                    if (res.success) showToast("Endpoint Synchronized");
                                                                }}
                                                                onChange={(e) => {
                                                                    const newLinks = [...links];
                                                                    newLinks[i].url = e.target.value;
                                                                    setLinks(newLinks);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveLink(link.id)}
                                                        className="p-6 text-white/20 hover:text-white transition-all glass rounded-[2rem] border border-white/5"
                                                    >
                                                        <Trash2 className="w-6 h-6" />
                                                    </button>
                                                </div>

                                                {/* Templates Hub */}
                                                <div className="pt-6 border-t border-white/5 flex flex-wrap gap-4 items-center">
                                                    <span className="text-[10px] uppercase font-black text-white/10 tracking-[0.3em] mr-4">Presets</span>
                                                    <TemplateBtn icon={<Github className="w-4 h-4" />} onClick={() => applyLinkTemplate(i, 'Github')} />
                                                    <TemplateBtn icon={<Instagram className="w-4 h-4" />} onClick={() => applyLinkTemplate(i, 'Instagram')} />
                                                    <TemplateBtn icon={<Disc className="w-4 h-4" />} onClick={() => applyLinkTemplate(i, 'Discord')} />
                                                    <TemplateBtn icon={<Mail className="w-4 h-4" />} onClick={() => applyLinkTemplate(i, 'Mail')} />
                                                </div>
                                            </motion.div>
                                        ))}

                                        {links.length === 0 && (
                                            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                                                <p className="text-white/20 uppercase font-black tracking-widest text-xs italic">Transmission offline: No routes found.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === 'gallery' && (
                                <motion.section
                                    key="gallery"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="flex justify-between items-center mb-12">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter">Media Repository</h2>
                                            <p className="text-white/40 text-sm italic">Images and videos for your sovereign presence.</p>
                                        </div>
                                        <label className="p-4 glass rounded-2xl hover:bg-white/5 transition-all border border-white/5 cursor-pointer">
                                            {loading && activeTab === 'gallery' ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Plus className="w-6 h-6" />}
                                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleGalleryUpload} disabled={loading} />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                                        {gallery.map((media) => (
                                            <div key={media.id} className="relative group aspect-square glass rounded-xl md:rounded-3xl overflow-hidden border border-white/5">
                                                {media.type === 'video' ? (
                                                    <video src={media.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                ) : (
                                                    <img src={media.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                                )}

                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                    <button
                                                        onClick={() => handleDeleteGallery(media.id, media.url)}
                                                        className="p-3 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {gallery.length === 0 && (
                                            <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
                                                <p className="text-white/20 uppercase font-black tracking-widest text-xs italic">Repository Empty: No media found.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === 'music' && (
                                <motion.section
                                    key="music"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-12"
                                >
                                    <div className="flex justify-between items-center mb-12">
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter">Current Freq</h2>
                                            <p className="text-white/40 text-sm italic">Broadcasting your sonic identity.</p>
                                        </div>
                                        <button
                                            onClick={() => setProfile({ ...profile, music_enabled: !profile.music_enabled })}
                                            className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border ${profile.music_enabled ? 'bg-white text-black border-white' : 'glass border-white/5 text-white/40'}`}
                                        >
                                            {profile.music_enabled ? 'Vitals Online' : 'Transmission Offline'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div className="p-10 glass rounded-[3rem] border-white/5 flex flex-col items-center gap-8">
                                                <label className="relative group cursor-pointer block">
                                                    <div className="w-48 h-48 glass rounded-[2.5rem] border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/30 shadow-2xl">
                                                        {profile.music_cover_url ? (
                                                            <img src={profile.music_cover_url} className={`w-full h-full object-cover transition-all ${profile.music_enabled ? 'animate-spin-slow' : 'grayscale'}`} />
                                                        ) : (
                                                            <Disc className="w-12 h-12 text-white/10" />
                                                        )}
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleMusicCoverUpload} />
                                                </label>
                                                <div className="text-center space-y-2">
                                                    <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Cover Art</h3>
                                                    <p className="text-[10px] text-white/20 max-w-[180px]">High fidelity square aspect recommended.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="p-10 glass rounded-[3rem] border-white/5 space-y-8">
                                                <div className="space-y-4 text-center pb-8 border-b border-white/5">
                                                    <label className="inline-flex cursor-pointer px-10 py-5 bg-white text-black text-xs font-black uppercase tracking-[0.2em] rounded-full hover:scale-105 transition-all shadow-xl shadow-white/5">
                                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Inject Frequency (MP3)"}
                                                        <input type="file" className="hidden" accept="audio/mpeg" onChange={handleMusicUpload} />
                                                    </label>
                                                    {profile.music_url && <p className="text-[10px] text-white/20 truncate">ID: {profile.music_url.split('/').pop()}</p>}
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Composition Title</label>
                                                        <input
                                                            className="w-full bg-white/5 px-6 py-4 rounded-2xl border border-white/5 outline-none focus:border-white/20 transition-all font-outfit"
                                                            value={profile.music_title}
                                                            placeholder="e.g., Midnight Protocol"
                                                            onChange={(e) => setProfile({ ...profile, music_title: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] uppercase font-black text-white/30 tracking-widest ml-1">Orchestrator / Artist</label>
                                                        <input
                                                            className="w-full bg-white/5 px-6 py-4 rounded-2xl border border-white/5 outline-none focus:border-white/20 transition-all font-outfit"
                                                            value={profile.music_artist}
                                                            placeholder="e.g., EBNN_CORE"
                                                            onChange={(e) => setProfile({ ...profile, music_artist: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pr-4">
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-12 py-6 bg-white text-black rounded-full font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition-all shadow-2xl"
                                        >
                                            Save Broadcast Config
                                        </button>
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === 'guestbook' && (
                                <motion.section
                                    key="guestbook"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-12 pb-24"
                                >
                                    <div className="flex justify-between items-end px-2">
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter">Guestbook Management</h2>
                                            <p className="text-white/40 text-xs italic">Moderate public traces and archive entries.</p>
                                        </div>
                                        {selectedNotes.length > 0 && (
                                            <button 
                                                onClick={() => handleNoteDelete(selectedNotes)}
                                                className="px-6 py-3 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-red-500/20 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Purge Selection ({selectedNotes.length})
                                            </button>
                                        )}
                                    </div>

                                    <div className="glass rounded-[3rem] p-8 md:p-12 border border-white/5 space-y-10">
                                        <div className="flex items-center justify-between p-6 glass rounded-3xl border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${profile.guestbook_enabled ? 'bg-white text-black' : 'bg-white/5 text-white/20'}`}>
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase tracking-widest">Protocol Status</h3>
                                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{profile.guestbook_enabled ? 'Frequency Open' : 'Frequency Sealed'}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newValue = !profile.guestbook_enabled;
                                                    setProfile({ ...profile, guestbook_enabled: newValue });
                                                    // Auto save for simple toggles
                                                    const fd = new FormData();
                                                    Object.entries({ ...profile, guestbook_enabled: newValue }).forEach(([k, v]) => fd.append(k, String(v)));
                                                    updateProfile(fd).then(r => r.success && showToast(newValue ? "Guestbook Activated" : "Guestbook Offline"));
                                                }}
                                                className={`px-6 py-3 rounded-full font-black uppercase tracking-widest text-[9px] transition-all border ${profile.guestbook_enabled ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10'}`}
                                            >
                                                {profile.guestbook_enabled ? 'Disable' : 'Enable'}
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-4">
                                                <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-white/20 italic">Global Archive</h3>
                                                <button onClick={handleClearGuestbook} className="text-[9px] font-black uppercase text-red-500/40 hover:text-red-500 transition-colors tracking-widest">Clear All Data</button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                                                {guestbookNotes.length === 0 ? (
                                                    <div className="p-12 text-center glass rounded-3xl border-dashed border-white/10 opacity-30 italic text-xs uppercase font-black tracking-widest">Archive is empty</div>
                                                ) : (
                                                    guestbookNotes.map(note => (
                                                        <div 
                                                            key={note.id} 
                                                            className={`p-5 glass rounded-2xl border transition-all cursor-pointer group flex items-start gap-4 ${selectedNotes.includes(note.id) ? 'border-white/40 bg-white/5' : 'border-white/5 hover:border-white/10'}`}
                                                            onClick={() => {
                                                                if (selectedNotes.includes(note.id)) setSelectedNotes(selectedNotes.filter(id => id !== note.id));
                                                                else setSelectedNotes([...selectedNotes, note.id]);
                                                            }}
                                                        >
                                                            <div className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedNotes.includes(note.id) ? 'bg-white border-white' : 'border-white/20'}`}>
                                                                {selectedNotes.includes(note.id) && <div className="w-2 h-2 bg-black rounded-sm" />}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h4 className="text-xs font-black uppercase tracking-widest">{note.name}</h4>
                                                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                                                                            <Clock className="w-2.5 h-2.5" /> {new Date(note.created_at).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleNoteDelete([note.id]); }}
                                                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                                <p className="text-[11px] text-white/40 font-medium leading-relaxed">{note.note}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}
                            {activeTab === 'contact' && (
                                <motion.section
                                    key="contact"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-12 pb-24"
                                >
                                    <div className="space-y-1 px-2">
                                        <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter">Direct Transmissions</h2>
                                        <p className="text-white/40 text-xs italic">Manage point-to-point communication logs.</p>
                                    </div>

                                    <div className="glass rounded-[3rem] p-8 md:p-12 border border-white/5 space-y-10">
                                        <div className="flex items-center justify-between p-6 glass rounded-3xl border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${profile.contact_enabled ? 'bg-white text-black' : 'bg-white/5 text-white/20'}`}>
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black uppercase tracking-widest">Incoming Signal</h3>
                                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{profile.contact_enabled ? 'Terminal Online' : 'Terminal Offline'}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newValue = !profile.contact_enabled;
                                                    setProfile({ ...profile, contact_enabled: newValue });
                                                    const fd = new FormData();
                                                    Object.entries({ ...profile, contact_enabled: newValue }).forEach(([k, v]) => fd.append(k, String(v)));
                                                    updateProfile(fd).then(r => r.success && showToast(newValue ? "Terminal Online" : "Terminal Offline"));
                                                }}
                                                className={`px-6 py-3 rounded-full font-black uppercase tracking-widest text-[9px] transition-all border ${profile.contact_enabled ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10'}`}
                                            >
                                                {profile.contact_enabled ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>

                                        <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-hide">
                                            {contactSubmissions.length === 0 ? (
                                                <div className="p-20 text-center glass rounded-3xl border-dashed border-white/10 opacity-30 italic text-xs uppercase font-black tracking-widest">No signals detected</div>
                                            ) : (
                                                contactSubmissions.map(msg => (
                                                    <div key={msg.id} className="p-8 glass rounded-[2.5rem] border border-white/5 space-y-6 relative group hover:border-white/10 transition-all">
                                                        <div className="flex justify-between items-start">
                                                            <div className="space-y-1">
                                                                <h4 className="text-base font-black font-outfit uppercase tracking-tighter">{msg.name}</h4>
                                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{msg.email}</p>
                                                            </div>
                                                            <div className="flex gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleContactDelete(msg.id)} className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-[11px] font-medium leading-relaxed text-white/60">
                                                            {msg.message}
                                                        </div>

                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/10">
                                                                <Clock className="w-3 h-3" /> {new Date(msg.created_at).toLocaleString()}
                                                            </div>
                                                            {msg.attachment_url && (
                                                                <a 
                                                                    href={msg.attachment_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-2 px-5 py-2 glass rounded-full border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:border-white/20 transition-all"
                                                                >
                                                                    <Paperclip className="w-3 h-3" /> Payload <Download className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {activeTab === 'preview' && (
                                <motion.section
                                    key="preview"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative max-w-sm mx-auto p-4 glass rounded-[4rem] border-white/10 shadow-2xl overflow-hidden min-h-[700px] flex flex-col pointer-events-none"
                                >
                                    <div className="absolute top-0 inset-x-0 h-8 bg-black/60 backdrop-blur z-20" />
                                    <div className="flex-1 overflow-y-auto scrollbar-hide py-12">
                                        <BioClient profile={profile} links={links} gallery={gallery} />
                                    </div>
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 glass rounded-full z-20 text-[10px] uppercase font-black tracking-widest border border-white/10">
                                        LIVE PREVIEW
                                    </div>
                                </motion.section>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </main>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 md:gap-4 p-3 md:p-5 rounded-2xl md:rounded-3xl transition-all font-outfit font-black uppercase tracking-tighter text-left border ${active ? 'bg-white text-black border-white' : 'glass border-white/5 text-white/40 hover:text-white hover:bg-white/5'} shrink-0`}
        >
            <div className={active ? 'text-black' : 'text-white/20'}>{icon}</div>
            <span className="text-xs md:text-sm whitespace-nowrap">{label}</span>
            {active && <motion.div layoutId="dot" className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-black ml-auto hidden md:block" />}
        </button>
    );
}

function TemplateBtn({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="p-3 glass rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-white/40 hover:text-white"
        >
            {icon}
        </button>
    );
}
