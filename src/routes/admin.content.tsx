import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import type { CmsContentKind } from "@/lib/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Layers,
  Sparkles,
  GraduationCap,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Plus,
  Edit2,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Star,
  ArrowUpDown,
  Clock,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  component: AdminContentPage,
});

interface BaseCmsItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  published: boolean;
  featured: boolean;
  sort_order: number;
  category?: string;
  level?: string;
  duration?: string;
  mode?: string;
  tagline?: string;
  description?: string;
  outcomes?: string[];
  curriculum?: string[];
  modules?: string[];
  topics?: string[];
  highlights?: string[];
  prerequisites?: string | string[];
  careers?: string[];
  ideal_for?: string[];
  price_note?: string;
  regular_fee?: number;
  offer_fee?: number;
  currency?: string;
  billing_period?: string;
  delivery_options?: string;
  pricing_notes?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at: string;
  updated_at: string;
}

export function AdminContentPage() {
  const { admin, isLoading: authLoading, logout, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const canMutate = admin?.role === "owner" || admin?.role === "admin";

  // Tab state
  const [activeKind, setActiveKind] = useState<CmsContentKind>("courses");

  // Filter states
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Data states
  const [items, setItems] = useState<BaseCmsItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit/Create Modal state
  const [isEditing, setIsEditing] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BaseCmsItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form edit fields
  const [formFields, setFormFields] = useState<Record<string, any>>({});

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (publishedFilter !== "all") params.set("published", publishedFilter);
      if (featuredFilter !== "all") params.set("featured", featuredFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/content/${activeKind}?${params.toString()}`, {
        headers: getAuthHeader(),
      });

      const json = await res.json();
      if (json.ok) {
        setItems(json.data || []);
        setTotalCount(json.total || 0);
      } else {
        const err = json.error || "Failed to load content.";
        setFetchError(err);
        toast.error(err);
      }
    } catch (err: any) {
      const msg = err?.message || "Network error loading content.";
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [activeKind, search, publishedFilter, featuredFilter, categoryFilter, getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchItems();
    }
  }, [admin, fetchItems]);

  const handleKindChange = (kind: CmsContentKind) => {
    setActiveKind(kind);
    setCategoryFilter("all");
    setSearch("");
  };

  const openEditModal = (item: BaseCmsItem) => {
    setSelectedItem(item);
    setIsNewItem(false);
    setFormFields({
      slug: item.slug || "",
      title: item.title || "",
      summary: item.summary || "",
      published: Boolean(item.published),
      featured: Boolean(item.featured),
      sort_order: item.sort_order ?? 0,
      category: item.category || "",
      level: item.level || "",
      duration: item.duration || "",
      mode: item.mode || "",
      tagline: item.tagline || "",
      description: item.description || "",
      outcomesText: Array.isArray(item.outcomes) ? item.outcomes.join("\n") : "",
      curriculumText: Array.isArray(item.curriculum) ? item.curriculum.join("\n") : "",
      modulesText: Array.isArray(item.modules) ? item.modules.join("\n") : "",
      topicsText: Array.isArray(item.topics) ? item.topics.join("\n") : "",
      highlightsText: Array.isArray(item.highlights) ? item.highlights.join("\n") : "",
      prerequisites: typeof item.prerequisites === "string" ? item.prerequisites : Array.isArray(item.prerequisites) ? item.prerequisites.join("\n") : "",
      careersText: Array.isArray(item.careers) ? item.careers.join("\n") : "",
      idealForText: Array.isArray(item.ideal_for) ? item.ideal_for.join("\n") : "",
      price_note: item.price_note || "",
      regular_fee: item.regular_fee ?? 0,
      offer_fee: item.offer_fee ?? 0,
      currency: item.currency || "PKR",
      billing_period: item.billing_period || "month",
      delivery_options: item.delivery_options || "",
      pricing_notes: item.pricing_notes || "",
      seo_title: item.seo_title || "",
      seo_description: item.seo_description || "",
    });
    setIsEditing(true);
  };

  const openCreateModal = () => {
    if (!canMutate) {
      toast.error("Access denied. Admissions role has read-only CMS access.");
      return;
    }
    setSelectedItem(null);
    setIsNewItem(true);
    setFormFields({
      slug: "",
      title: "",
      summary: "",
      published: true,
      featured: false,
      sort_order: totalCount + 1,
      category: activeKind === "courses" ? "Programming" : activeKind === "tutoring" ? "Academic" : "",
      level: activeKind === "courses" ? "Beginner" : "All levels",
      duration: activeKind === "courses" ? "6-8 Weeks" : "Custom",
      mode: "Live online · One-to-one available · Group batches when scheduled",
      tagline: "",
      description: "",
      outcomesText: "",
      curriculumText: "",
      modulesText: "",
      topicsText: "",
      highlightsText: "",
      prerequisites: "",
      careersText: "",
      idealForText: "",
      price_note: "Affordable fee · Flexible monthly/one-time plan",
      regular_fee: 15000,
      offer_fee: 10000,
      currency: "PKR",
      billing_period: "month",
      delivery_options: "One-to-One Private Tuition & Small Custom Batches",
      pricing_notes: "Customized hourly or monthly packages available",
      seo_title: "",
      seo_description: "",
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMutate) {
      toast.error("Access denied. Admissions role has read-only CMS access.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, any> = {
        title: formFields.title?.trim(),
        summary: formFields.summary?.trim(),
        published: Boolean(formFields.published),
        featured: Boolean(formFields.featured),
        sort_order: Number(formFields.sort_order) || 0,
        seo_title: formFields.seo_title?.trim() || null,
        seo_description: formFields.seo_description?.trim() || null,
      };

      if (isNewItem) {
        payload.slug = formFields.slug?.trim().toLowerCase();
      }

      if (activeKind === "courses") {
        payload.category = formFields.category;
        payload.level = formFields.level?.trim();
        payload.duration = formFields.duration?.trim();
        payload.mode = formFields.mode?.trim();
        payload.tagline = formFields.tagline?.trim() || "";
        payload.description = formFields.description?.trim();
        payload.price_note = formFields.price_note?.trim();
        payload.prerequisites = formFields.prerequisites?.trim() || null;
        payload.outcomes = formFields.outcomesText
          ? formFields.outcomesText.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
        payload.curriculum = formFields.curriculumText
          ? formFields.curriculumText.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
      } else if (activeKind === "specializations") {
        payload.category = formFields.category || "Specialization";
        payload.tagline = formFields.tagline?.trim() || "";
        payload.description = formFields.description?.trim();
        payload.duration = formFields.duration?.trim();
        payload.level = formFields.level?.trim() || "Beginner to Advanced";
        payload.modules = formFields.modulesText
          ? formFields.modulesText.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
        payload.outcomes = formFields.outcomesText
          ? formFields.outcomesText.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
        payload.careers = formFields.careersText
          ? formFields.careersText.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
      } else if (activeKind === "live-offers") {
        payload.short_title = formFields.title?.trim();
        payload.status = "active";
        payload.audience = "Students & Career Switchers";
        payload.age_or_education_level = formFields.level || "Grade 8+ / College";
        payload.duration = formFields.duration?.trim();
        payload.format = "Live Online Interactive Cohort";
        payload.regular_fee = Number(formFields.regular_fee) || 0;
        payload.offer_fee = Number(formFields.offer_fee) || 0;
        payload.currency = formFields.currency || "PKR";
        payload.billing_period = formFields.billing_period || "month";
        payload.tagline = formFields.tagline?.trim() || "";
        payload.description = formFields.description?.trim();
        payload.highlights = formFields.highlightsText
          ? formFields.highlightsText.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
        payload.prerequisites = formFields.prerequisites
          ? formFields.prerequisites.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
        payload.ideal_for = formFields.idealForText
          ? formFields.idealForText.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
      } else if (activeKind === "tutoring") {
        payload.category = formFields.category || "Academic";
        payload.level = formFields.level?.trim();
        payload.audience = "Primary to College";
        payload.topics = formFields.topicsText
          ? formFields.topicsText.split("\n").map((s: string) => s.trim()).filter(Boolean)
          : [];
        payload.delivery_options = formFields.delivery_options?.trim();
        payload.pricing_notes = formFields.pricing_notes?.trim();
      }

      const url = isNewItem
        ? `/api/admin/content/${activeKind}`
        : `/api/admin/content/${activeKind}/${selectedItem?.id}`;
      const method = isNewItem ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.ok) {
        toast.success(isNewItem ? "Content item created." : "Content updated successfully.");
        setIsEditing(false);
        fetchItems();
      } else {
        toast.error(json.error || (json.issues ? json.issues[0]?.message : "Operation failed"));
      }
    } catch {
      toast.error("Network error while saving content.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickTogglePublish = async (item: BaseCmsItem) => {
    if (!canMutate) {
      toast.error("Access denied. Admissions role has read-only access.");
      return;
    }
    const newStatus = !item.published;
    try {
      const res = await fetch(`/api/admin/content/${activeKind}/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ published: newStatus }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(newStatus ? `"${item.title}" published.` : `"${item.title}" moved to draft.`);
        fetchItems();
      } else {
        toast.error(json.error || "Toggle failed.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const handleQuickToggleFeatured = async (item: BaseCmsItem) => {
    if (!canMutate) {
      toast.error("Access denied. Admissions role has read-only access.");
      return;
    }
    const newFeatured = !item.featured;
    try {
      const res = await fetch(`/api/admin/content/${activeKind}/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ featured: newFeatured }),
      });
      const json = await res.json();
      if (json.ok) {
        toast.success(newFeatured ? `"${item.title}" marked as Featured.` : `"${item.title}" removed from Featured.`);
        fetchItems();
      } else {
        toast.error(json.error || "Toggle failed.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const getPublicUrl = (kind: CmsContentKind, slug: string) => {
    switch (kind) {
      case "courses":
        return `/courses/${slug}`;
      case "specializations":
        return `/specializations/${slug}`;
      case "live-offers":
        return `/live-batches/${slug}`;
      case "tutoring":
        return `/tutoring`;
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070F2B]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008DDA]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#0B192C] text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-[#008DDA] to-[#41B3A2] text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-base text-white">TBOS Academy</span>
                <span className="ml-2 text-xs font-semibold text-[#41B3A2] uppercase tracking-wider">Content CMS</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/admin/admissions"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                All Admissions
              </Link>
              <Link
                to="/admin/demos"
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Demo Pipeline
              </Link>
              <Link
                to="/admin/content"
                className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                Content CMS
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-white">{admin?.email}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                Role: {admin?.role} {!canMutate && "(Read-Only)"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchItems()}
              disabled={isLoading}
              className="text-slate-300 hover:text-white hover:bg-white/10 h-8 px-2.5"
              title="Refresh Catalog"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                navigate({ to: "/admin/login" });
              }}
              className="border-white/10 bg-white/5 text-slate-200 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 h-8 text-xs font-medium gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Content Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => handleKindChange("courses")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeKind === "courses"
                  ? "bg-[#008DDA] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Technical Courses</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeKind === "courses" ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                32
              </span>
            </button>

            <button
              onClick={() => handleKindChange("specializations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeKind === "specializations"
                  ? "bg-[#008DDA] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Specializations</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeKind === "specializations" ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                10
              </span>
            </button>

            <button
              onClick={() => handleKindChange("live-offers")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeKind === "live-offers"
                  ? "bg-[#008DDA] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Live Offers</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeKind === "live-offers" ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                3
              </span>
            </button>

            <button
              onClick={() => handleKindChange("tutoring")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeKind === "tutoring"
                  ? "bg-[#008DDA] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Tutoring Subjects</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeKind === "tutoring" ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                12
              </span>
            </button>
          </div>

          <div>
            {canMutate ? (
              <Button
                onClick={openCreateModal}
                className="bg-[#41B3A2] hover:bg-[#349887] text-white shadow-sm gap-1.5 text-xs font-semibold h-9"
              >
                <Plus className="h-4 w-4" />
                <span>New {activeKind === "courses" ? "Course" : activeKind === "specializations" ? "Specialization" : activeKind === "live-offers" ? "Live Offer" : "Subject"}</span>
              </Button>
            ) : (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-xs px-2.5 py-1">
                Read-Only (Admissions Role)
              </Badge>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Search ${activeKind} by title, slug, summary...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-[#008DDA]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm focus:border-[#008DDA] focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>

            {/* Featured Filter */}
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm focus:border-[#008DDA] focus:outline-none"
            >
              <option value="all">All Visibility</option>
              <option value="true">Featured Only</option>
              <option value="false">Standard Only</option>
            </select>

            {/* Category Filter for Courses */}
            {activeKind === "courses" && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm focus:border-[#008DDA] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Database">Database</option>
                <option value="Data & AI">Data & AI</option>
              </select>
            )}

            {/* Category Filter for Tutoring */}
            {activeKind === "tutoring" && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm focus:border-[#008DDA] focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Academic">Academic</option>
                <option value="Quran & Islamic Studies">Quran & Islamic Studies</option>
              </select>
            )}
          </div>
        </div>

        {/* Content Table / Cards */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#008DDA]" />
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">Error Loading Content</h3>
              <p className="text-xs text-slate-500 mt-1">{fetchError}</p>
              <Button onClick={() => fetchItems()} variant="outline" size="sm" className="mt-4 text-xs">
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <AlertTriangle className="h-10 w-10 text-slate-400 mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">No items found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Title & Slug</th>
                    <th className="py-3 px-4">Category / Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4">SEO Config</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        #{item.sort_order ?? 0}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {item.published && (
                            <a
                              href={getPublicUrl(activeKind, item.slug)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-[#008DDA] transition-colors"
                              title="View public live page"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">/{item.slug}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {item.category || item.level || "General"}
                        </span>
                        {item.duration && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{item.duration}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePublish(item)}
                          disabled={!canMutate}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                            item.published
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          }`}
                        >
                          {item.published ? (
                            <>
                              <Eye className="h-3 w-3" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleFeatured(item)}
                          disabled={!canMutate}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                            item.featured
                              ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 font-semibold"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <Star className={`h-3 w-3 ${item.featured ? "fill-purple-500 text-purple-600" : "text-slate-400"}`} />
                          <span>{item.featured ? "Featured" : "Standard"}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(item.updated_at || item.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        {item.seo_title || item.seo_description ? (
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px]">
                            Custom SEO
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-slate-400">Default</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="h-8 text-xs font-medium text-[#008DDA] hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Slide-over / Modal for Create & Edit */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-[#0B192C] text-white">
              <div>
                <h2 className="text-base font-bold">
                  {isNewItem ? `Create New ${activeKind.replace("-", " ")}` : `Edit ${selectedItem?.title}`}
                </h2>
                <p className="text-xs text-slate-300">
                  {isNewItem ? "Fill details to publish or stage as draft" : `Slug: /${formFields.slug}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {!canMutate && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>You have read-only access (Admissions role). Save is disabled.</span>
                </div>
              )}

              {/* Publication Status & Visibility Switches */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formFields.published)}
                    onChange={(e) => setFormFields({ ...formFields, published: e.target.checked })}
                    disabled={!canMutate}
                    className="h-4 w-4 rounded border-slate-300 text-[#008DDA] focus:ring-[#008DDA]"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">Published</span>
                    <span className="text-[10px] text-slate-500">Live on public site</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formFields.featured)}
                    onChange={(e) => setFormFields({ ...formFields, featured: e.target.checked })}
                    disabled={!canMutate}
                    className="h-4 w-4 rounded border-slate-300 text-[#008DDA] focus:ring-[#008DDA]"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">Featured</span>
                    <span className="text-[10px] text-slate-500">Highlighted badges</span>
                  </div>
                </label>

                <div>
                  <Label className="text-[10px] font-semibold text-slate-700">Sort Order</Label>
                  <Input
                    type="number"
                    value={formFields.sort_order}
                    onChange={(e) => setFormFields({ ...formFields, sort_order: parseInt(e.target.value, 10) || 0 })}
                    disabled={!canMutate}
                    className="h-7 text-xs mt-1"
                  />
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold text-slate-700">Title *</Label>
                  <Input
                    value={formFields.title}
                    onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                    required
                    disabled={!canMutate}
                    className="mt-1"
                    placeholder="e.g. Master Python Programming"
                  />
                </div>
                <div>
                  <Label className="font-semibold text-slate-700">
                    Slug * {isNewItem ? "(lowercase with hyphens)" : "(Unique identifier)"}
                  </Label>
                  <Input
                    value={formFields.slug}
                    onChange={(e) => setFormFields({ ...formFields, slug: e.target.value })}
                    required
                    disabled={!canMutate || !isNewItem}
                    className={`mt-1 font-mono ${!isNewItem ? "bg-slate-50 text-slate-500" : ""}`}
                    placeholder="e.g. master-python"
                  />
                </div>
              </div>

              {/* Category, Level, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="font-semibold text-slate-700">Category</Label>
                  {activeKind === "courses" ? (
                    <select
                      value={formFields.category}
                      onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                      disabled={!canMutate}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-xs"
                    >
                      <option value="Programming">Programming</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Database">Database</option>
                      <option value="Data & AI">Data & AI</option>
                    </select>
                  ) : activeKind === "tutoring" ? (
                    <select
                      value={formFields.category}
                      onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                      disabled={!canMutate}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white p-2 text-xs"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Quran & Islamic Studies">Quran & Islamic Studies</option>
                    </select>
                  ) : (
                    <Input
                      value={formFields.category}
                      onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                      disabled={!canMutate}
                      className="mt-1"
                      placeholder="Specialization / Live Cohort"
                    />
                  )}
                </div>

                <div>
                  <Label className="font-semibold text-slate-700">Level / Target Audience</Label>
                  <Input
                    value={formFields.level}
                    onChange={(e) => setFormFields({ ...formFields, level: e.target.value })}
                    disabled={!canMutate}
                    className="mt-1"
                    placeholder="e.g. Beginner to Advanced"
                  />
                </div>

                <div>
                  <Label className="font-semibold text-slate-700">Duration</Label>
                  <Input
                    value={formFields.duration}
                    onChange={(e) => setFormFields({ ...formFields, duration: e.target.value })}
                    disabled={!canMutate}
                    className="mt-1"
                    placeholder="e.g. 6-8 Weeks"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <Label className="font-semibold text-slate-700">Tagline</Label>
                <Input
                  value={formFields.tagline}
                  onChange={(e) => setFormFields({ ...formFields, tagline: e.target.value })}
                  disabled={!canMutate}
                  className="mt-1"
                  placeholder="Punchy one-line highlight for cards and headers"
                />
              </div>

              {/* Summary */}
              <div>
                <Label className="font-semibold text-slate-700">Summary *</Label>
                <Textarea
                  value={formFields.summary}
                  onChange={(e) => setFormFields({ ...formFields, summary: e.target.value })}
                  required
                  rows={2}
                  disabled={!canMutate}
                  className="mt-1"
                  placeholder="Concise 1-2 sentence overview shown in listings and previews"
                />
              </div>

              {/* Description */}
              {activeKind !== "tutoring" && (
                <div>
                  <Label className="font-semibold text-slate-700">Full Description</Label>
                  <Textarea
                    value={formFields.description}
                    onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                    rows={4}
                    disabled={!canMutate}
                    className="mt-1 font-mono text-[11px]"
                    placeholder="In-depth program description for syllabus and detail page"
                  />
                </div>
              )}

              {/* Array items: Outcomes / Curriculum / Modules / Topics (one per line) */}
              {activeKind === "courses" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-slate-700">Learning Outcomes (1 per line)</Label>
                    <Textarea
                      value={formFields.outcomesText}
                      onChange={(e) => setFormFields({ ...formFields, outcomesText: e.target.value })}
                      rows={4}
                      disabled={!canMutate}
                      className="mt-1"
                      placeholder="Write real code&#10;Build end-to-end projects"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-slate-700">Curriculum Topics (1 per line)</Label>
                    <Textarea
                      value={formFields.curriculumText}
                      onChange={(e) => setFormFields({ ...formFields, curriculumText: e.target.value })}
                      rows={4}
                      disabled={!canMutate}
                      className="mt-1"
                      placeholder="Module 1: Syntax & Basics&#10;Module 2: Advanced OOP"
                    />
                  </div>
                </div>
              )}

              {activeKind === "specializations" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-slate-700">Modules (1 per line)</Label>
                    <Textarea
                      value={formFields.modulesText}
                      onChange={(e) => setFormFields({ ...formFields, modulesText: e.target.value })}
                      rows={4}
                      disabled={!canMutate}
                      className="mt-1"
                      placeholder="Python Core&#10;Django Web Framework&#10;PostgreSQL Database"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-slate-700">Career Paths (1 per line)</Label>
                    <Textarea
                      value={formFields.careersText}
                      onChange={(e) => setFormFields({ ...formFields, careersText: e.target.value })}
                      rows={4}
                      disabled={!canMutate}
                      className="mt-1"
                      placeholder="Junior Full-Stack Engineer&#10;Backend Developer"
                    />
                  </div>
                </div>
              )}

              {activeKind === "live-offers" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold text-slate-700">Cohort Highlights (1 per line)</Label>
                    <Textarea
                      value={formFields.highlightsText}
                      onChange={(e) => setFormFields({ ...formFields, highlightsText: e.target.value })}
                      rows={4}
                      disabled={!canMutate}
                      className="mt-1"
                      placeholder="2x Live Classes Weekly&#10;Real-Time Code Reviews"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold text-slate-700">Pricing (PKR)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <span className="text-[10px] text-slate-500">Regular Fee</span>
                        <Input
                          type="number"
                          value={formFields.regular_fee}
                          onChange={(e) => setFormFields({ ...formFields, regular_fee: e.target.value })}
                          disabled={!canMutate}
                          className="mt-0.5"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Offer Fee</span>
                        <Input
                          type="number"
                          value={formFields.offer_fee}
                          onChange={(e) => setFormFields({ ...formFields, offer_fee: e.target.value })}
                          disabled={!canMutate}
                          className="mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeKind === "tutoring" && (
                <div>
                  <Label className="font-semibold text-slate-700">Topics Covered (1 per line)</Label>
                  <Textarea
                    value={formFields.topicsText}
                    onChange={(e) => setFormFields({ ...formFields, topicsText: e.target.value })}
                    rows={4}
                    disabled={!canMutate}
                    className="mt-1"
                    placeholder="Tajweed & Correct Pronunciation&#10;Hifz-ul-Quran Tracking"
                  />
                </div>
              )}

              {/* SEO Configuration Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">SEO & Metadata</span>
                  <span className="text-[10px] text-slate-500">Overrides default catalog meta tags</span>
                </div>
                <div>
                  <Label className="text-slate-600 font-medium">SEO Meta Title</Label>
                  <Input
                    value={formFields.seo_title}
                    onChange={(e) => setFormFields({ ...formFields, seo_title: e.target.value })}
                    disabled={!canMutate}
                    className="mt-1 bg-white"
                    placeholder="e.g. Master Python Programming Course in Rawalpindi & Islamabad | TBOS Academy"
                  />
                </div>
                <div>
                  <Label className="text-slate-600 font-medium">SEO Meta Description</Label>
                  <Textarea
                    value={formFields.seo_description}
                    onChange={(e) => setFormFields({ ...formFields, seo_description: e.target.value })}
                    rows={2}
                    disabled={!canMutate}
                    className="mt-1 bg-white"
                    placeholder="e.g. Hands-on Python training with certified mentors. Live online interactive cohort."
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                {canMutate && (
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#008DDA] hover:bg-[#0073b3] text-white h-9 text-xs font-semibold gap-1.5 px-5"
                  >
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{isNewItem ? "Create Item" : "Save Changes"}</span>
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
