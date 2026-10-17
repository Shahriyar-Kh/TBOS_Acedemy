import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { generateIcsCalendar, downloadIcsFile } from "@/lib/icalendar";
import { liveOffers } from "@/data/liveOffers";
import { specializations, getSpecializationMonthlyFee } from "@/data/specializations";
import { courses } from "@/data/courses";
import { tutoringSubjects } from "@/data/tutoring";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Calendar,
  Eye,
  FileSpreadsheet,
  Loader2,
  Mail,
  Phone,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Clock,
  Check,
  ExternalLink,
  Video,
  FileText,
  DollarSign,
  BookOpen,
  Edit3,
  Archive,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Students Roster & Operations") }),
  component: AdminStudentsPage,
});

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AdminStudentsPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, paused: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Batches for enrollment dropdown
  const [batches, setBatches] = useState<any[]>([]);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "enrollments" | "schedule" | "fees" | "attendance" | "tasks">("overview");

  // Multi-Section Wizard Form State (Section B)
  const initialWizardData = {
    // Step 1: Personal Details
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelationship: "Parent",
    emergencyContact: "",
    address: "",
    country: "Pakistan",
    city: "Lahore",
    timezone: "Asia/Karachi",
    status: "active" as const,
    notes: "",

    // Step 2: Program Enrollment
    programSlug: liveOffers[0]?.slug || "python-young-developers",
    programTitle: liveOffers[0]?.title || "Python Young Developers",
    programType: "live_batch" as "live_batch" | "specialization" | "course" | "tutoring",
    mode: "group" as "group" | "one_on_one",
    batchId: "",
    instructorId: "",
    instructorName: "",
    startDate: new Date().toISOString().split("T")[0],
    expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],

    // Step 3: Fee Plan
    planType: "monthly" as "monthly" | "one_time" | "custom",
    baseFee: liveOffers[0]?.offerFee || liveOffers[0]?.regularFee || 5000,
    discount: 0,
    billingDay: 1,
    createInitialInvoice: true,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],

    // Step 4: Schedule
    schedules: [
      { dayOfWeek: 1, startTime: "18:00", endTime: "19:30", meetingUrl: "https://meet.google.com/tbos-live", timezone: "Asia/Karachi" },
      { dayOfWeek: 3, startTime: "18:00", endTime: "19:30", meetingUrl: "https://meet.google.com/tbos-live", timezone: "Asia/Karachi" },
    ],
    generateWeeks: 4,
  };

  const [wizardData, setWizardData] = useState(initialWizardData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomProgram, setIsCustomProgram] = useState(false);

  // Edit Student Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    country: "Pakistan",
    timezone: "Asia/Karachi",
    dateOfBirth: "",
    age: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelationship: "",
    emergencyContact: "",
    billingDay: 1,
    status: "active",
    notes: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editDuplicateWarning, setEditDuplicateWarning] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Delete Safety Modal state
  const [showDeleteSafetyModal, setShowDeleteSafetyModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);
  const [deleteBlockReason, setDeleteBlockReason] = useState<string | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  // Archive / Restore Modal state
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [studentToArchive, setStudentToArchive] = useState<any | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);

  // Proactive duplicate detection when editing email/phone
  useEffect(() => {
    if (!showEditModal || !editFormData.id) return;
    if (!editFormData.email?.trim() && !editFormData.phone?.trim()) {
      setEditDuplicateWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDuplicate(true);
      try {
        const params = new URLSearchParams();
        params.set("action", "check-duplicate");
        if (editFormData.email?.trim()) params.set("email", editFormData.email.trim());
        if (editFormData.phone?.trim()) params.set("phone", editFormData.phone.trim());
        params.set("excludeStudentId", editFormData.id);

        const res = await fetch(`/api/admin/students?${params.toString()}`, {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.isDuplicate) {
            setEditDuplicateWarning(
              `Duplicate alert: matches student ${data.existingStudent?.student_id || ""} (${data.existingStudent?.full_name || ""}) by ${data.matchedBy}.`
            );
          } else {
            setEditDuplicateWarning(null);
          }
        }
      } catch {
        // ignore network error
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [editFormData.email, editFormData.phone, editFormData.id, showEditModal, getAuthHeader]);

  const handleOpenEditModal = (student: any) => {
    setEditFormData({
      id: student.id,
      fullName: student.full_name || "",
      email: student.email || "",
      phone: student.phone || "",
      whatsapp: student.whatsapp || "",
      address: student.address || "",
      city: student.city || "",
      country: student.country || "Pakistan",
      timezone: student.timezone || "Asia/Karachi",
      dateOfBirth: student.date_of_birth ? student.date_of_birth.split("T")[0] : "",
      age: student.age ? String(student.age) : "",
      guardianName: student.guardian_name || "",
      guardianPhone: student.guardian_phone || "",
      guardianRelationship: student.guardian_relationship || "",
      emergencyContact: student.emergency_contact || "",
      billingDay: student.billing_day || 1,
      status: student.status || "active",
      notes: student.notes || "",
    });
    setEditDuplicateWarning(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;
    setIsSavingEdit(true);
    try {
      const payload: Record<string, any> = {
        fullName: editFormData.fullName.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        whatsapp: editFormData.whatsapp ? editFormData.whatsapp.trim() : null,
        address: editFormData.address ? editFormData.address.trim() : null,
        city: editFormData.city ? editFormData.city.trim() : null,
        country: editFormData.country || "Pakistan",
        timezone: editFormData.timezone || "Asia/Karachi",
        dateOfBirth: editFormData.dateOfBirth || null,
        age: editFormData.age ? Number(editFormData.age) : null,
        guardianName: editFormData.guardianName ? editFormData.guardianName.trim() : null,
        guardianPhone: editFormData.guardianPhone ? editFormData.guardianPhone.trim() : null,
        guardianRelationship: editFormData.guardianRelationship || null,
        emergencyContact: editFormData.emergencyContact ? editFormData.emergencyContact.trim() : null,
        billingDay: Number(editFormData.billingDay),
        status: editFormData.status,
        notes: editFormData.notes ? editFormData.notes.trim() : null,
      };

      const res = await fetch(`/api/admin/students/${editFormData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(`Student ${data.student?.full_name || ""} updated successfully!`);
        setShowEditModal(false);
        fetchStudents();
        if (selectedStudentId === editFormData.id) {
          loadStudentProfile(editFormData.id);
        }
      } else {
        toast.error(data.error || "Failed to update student");
      }
    } catch {
      toast.error("Network error while updating student");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleQuickStatusChange = async (studentId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ action: "update-status", status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        toast.success(`Student status updated to ${newStatus}`);
        fetchStudents();
        if (selectedStudentId === studentId) {
          loadStudentProfile(studentId);
        }
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch {
      toast.error("Network error updating status");
    }
  };

  const handleOpenArchiveModal = (student: any) => {
    setStudentToArchive(student);
    setArchiveReason("Archived by administrator");
    setShowArchiveModal(true);
  };

  const handleConfirmArchive = async () => {
    if (!studentToArchive) return;
    setIsArchiving(true);
    try {
      const res = await fetch(`/api/admin/students/${studentToArchive.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ action: "archive", reason: archiveReason.trim() }),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success(`Student ${studentToArchive.full_name} archived successfully.`);
        setShowArchiveModal(false);
        fetchStudents();
        if (selectedStudentId === studentToArchive.id) {
          loadStudentProfile(studentToArchive.id);
        }
      } else {
        toast.error(data.error || "Failed to archive student");
      }
    } catch {
      toast.error("Network error archiving student");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRestoreStudent = async (studentId: string) => {
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success("Student restored to active status!");
        fetchStudents();
        if (selectedStudentId === studentId) {
          loadStudentProfile(studentId);
        }
      } else {
        toast.error(data.error || "Failed to restore student");
      }
    } catch {
      toast.error("Network error restoring student");
    }
  };

  const handleOpenDeleteModal = (student: any) => {
    setStudentToDelete(student);
    setDeleteBlockReason(null);
    setShowDeleteSafetyModal(true);
  };

  const handleConfirmDelete = async (permanent: boolean) => {
    if (!studentToDelete) return;
    setIsDeletingStudent(true);
    setDeleteBlockReason(null);
    try {
      const res = await fetch(`/api/admin/students/${studentToDelete.id}?permanent=${permanent}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success(permanent ? "Student permanently deleted" : "Student safely archived");
        setShowDeleteSafetyModal(false);
        if (selectedStudentId === studentToDelete.id) {
          setSelectedStudentId(null);
        }
        fetchStudents();
      } else if (res.status === 409) {
        setDeleteBlockReason(data.error || "Cannot permanently delete student because financial or attendance records exist.");
      } else {
        toast.error(data.error || "Failed to delete student");
      }
    } catch {
      toast.error("Network error during student deletion");
    } finally {
      setIsDeletingStudent(false);
    }
  };

  // Dynamic Canonical Program Catalog derived from website sources
  const getCatalogForType = useCallback(
    (type: "live_batch" | "specialization" | "course" | "tutoring") => {
      if (type === "live_batch") {
        return liveOffers.map((o) => ({
          slug: o.slug,
          title: o.title,
          fee: o.offerFee || o.regularFee || 0,
        }));
      }
      if (type === "specialization") {
        return specializations.map((s) => ({
          slug: s.slug,
          title: s.title,
          fee: getSpecializationMonthlyFee(s.slug),
        }));
      }
      if (type === "course") {
        return courses.map((c) => ({
          slug: c.slug,
          title: `${c.title} (${c.category})`,
          fee: 0, // Single course fees not fixed/decided
        }));
      }
      if (type === "tutoring") {
        return tutoringSubjects.map((t) => ({
          slug: t.slug,
          title: `${t.title} (${t.category})`,
          fee: 0, // Manual fee entry
        }));
      }
      return [];
    },
    []
  );

  const programCatalog = useMemo(
    () => getCatalogForType(wizardData.programType),
    [wizardData.programType, getCatalogForType]
  );

  const handleBatchSelect = (batchId: string) => {
    if (!batchId) {
      setWizardData((prev) => ({ ...prev, batchId: "", mode: "one_on_one" }));
      return;
    }
    const b = batches.find((item) => item.id === batchId);
    if (b) {
      setWizardData((prev) => ({
        ...prev,
        batchId: b.id,
        programSlug: b.program_slug || prev.programSlug,
        programTitle: b.program_title || b.name,
        programType: (b.program_type as any) || "live_batch",
        mode: "group",
        instructorId: b.instructor_id || prev.instructorId,
        instructorName: b.instructor_name || prev.instructorName,
        startDate: b.start_date ? b.start_date.split("T")[0] : prev.startDate,
        expectedEndDate: b.expected_end_date ? b.expected_end_date.split("T")[0] : prev.expectedEndDate,
      }));
    }
  };

  // Inline Quick Task inside Drawer
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<any | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "25");

      const res = await fetch(`/api/admin/students?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setTotalCount(data.totalCount || 0);
        setStats(data.stats || { total: 0, active: 0, paused: 0, completed: 0 });
      }
    } catch {
      toast.error("Failed to load students roster");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchStudents();
      fetch("/api/admin/batches", { headers: getAuthHeader() })
        .then((res) => (res.ok ? res.json() : { batches: [] }))
        .then((data) => setBatches(data.batches || []))
        .catch(() => {});
    }
  }, [admin, fetchStudents, getAuthHeader]);

  const loadStudentProfile = async (id: string) => {
    setSelectedStudentId(id);
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setStudentDetail(data);
      }
    } catch {
      toast.error("Failed to load student details");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateStudentFull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (wizardStep < 4) {
      return;
    }
    if (!wizardData.fullName || !wizardData.email || !wizardData.phone) {
      toast.error("Full name, email, and phone number are required.");
      setWizardStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const agreedFee = Math.max(0, Number(wizardData.baseFee) - Number(wizardData.discount || 0));
      const payload = {
        action: "create-student-full",
        fullName: wizardData.fullName.trim(),
        email: wizardData.email.trim(),
        phone: wizardData.phone.trim(),
        whatsapp: wizardData.whatsapp ? wizardData.whatsapp.trim() : wizardData.phone.trim(),
        guardianName: wizardData.guardianName ? wizardData.guardianName.trim() : null,
        guardianPhone: wizardData.guardianPhone ? wizardData.guardianPhone.trim() : null,
        guardianRelationship: wizardData.guardianRelationship || null,
        emergencyContact: wizardData.emergencyContact ? wizardData.emergencyContact.trim() : null,
        country: wizardData.country || "Pakistan",
        city: wizardData.city ? wizardData.city.trim() : null,
        timezone: wizardData.timezone || "Asia/Karachi",
        status: wizardData.status,
        notes: wizardData.notes ? wizardData.notes.trim() : null,

        programSlug: wizardData.programSlug,
        programTitle: wizardData.programTitle,
        programType: wizardData.programType,
        mode: wizardData.mode,
        batchId: wizardData.batchId || null,
        instructorId: wizardData.instructorId || null,
        startDate: wizardData.startDate,
        expectedEndDate: wizardData.expectedEndDate || null,
        agreedFee,
        discount: Number(wizardData.discount || 0),

        planType: wizardData.planType,
        billingDay: Number(wizardData.billingDay),
        createInitialInvoice: wizardData.createInitialInvoice,
        dueDate: wizardData.createInitialInvoice ? wizardData.dueDate : null,

        schedules: wizardData.schedules.map((s) => ({
          dayOfWeek: Number(s.dayOfWeek),
          startTime: s.startTime,
          endTime: s.endTime,
          meetingUrl: s.meetingUrl ? s.meetingUrl.trim() : null,
          timezone: s.timezone || "Asia/Karachi",
        })),
        generateWeeks: Number(wizardData.generateWeeks),
      };

      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success(`Student ${data.student?.student_id || ""} successfully registered with active plan!`);
        setShowAddModal(false);
        setWizardStep(1);
        setWizardData(initialWizardData);
        fetchStudents();
        if (data.student?.id) {
          loadStudentProfile(data.student.id);
        }
      } else {
        toast.error(data.error || "Failed to create student");
      }
    } catch {
      toast.error("Network error while creating student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSlot = () => {
    setWizardData((prev) => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        { dayOfWeek: 5, startTime: "18:00", endTime: "19:30", meetingUrl: "https://meet.google.com/tbos-live", timezone: "Asia/Karachi" },
      ],
    }));
  };

  const handleRemoveSlot = (index: number) => {
    setWizardData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index),
    }));
  };

  const handleDownloadStudentIcs = () => {
    if (!studentDetail || !studentDetail.student) return;
    const student = studentDetail.student;
    const sessions = studentDetail.sessions || [];

    if (sessions.length === 0) {
      toast.info("No scheduled class sessions found to export.");
      return;
    }

    const events = sessions.map((s: any) => ({
      id: s.id,
      title: `${s.title} (${student.full_name})`,
      description: `TBOS Academy Class Session. Instructor: ${s.instructor_name || "TBOS Mentor"}`,
      sessionDate: s.session_date,
      startTime: s.start_time,
      endTime: s.end_time,
      meetingLink: s.meeting_link || undefined,
      instructorName: s.instructor_name || undefined,
      batchOrStudentName: student.full_name,
    }));

    const ics = generateIcsCalendar(events);
    downloadIcsFile(ics, `${student.student_id}-schedule.ics`);
    toast.success("Schedule downloaded (.ics format)");
  };

  const handleAddQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !selectedStudentId) return;
    setIsAddingTask(true);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          title: quickTaskTitle.trim(),
          studentId: selectedStudentId,
          priority: "medium",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success("Task added for student!");
        setQuickTaskTitle("");
        loadStudentProfile(selectedStudentId);
      } else {
        toast.error(data.error || "Failed to create task");
      }
    } catch {
      toast.error("Network error adding task");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV file is empty or missing headers");
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cols[idx] || "";
        });
        rows.push(rowObj);
      }
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleImportCsv = async () => {
    if (csvRows.length === 0) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ action: "import-csv", rows: csvRows }),
      });
      const data = await res.json();
      if (data.ok) {
        setImportSummary(data);
        toast.success(`Import complete: ${data.importedCount} student(s) imported.`);
        fetchStudents();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch {
      toast.error("Network error during CSV import");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      "fullName,email,phone,whatsapp,guardianName,guardianPhone,country,city,status,billingDay,notes\n" +
      "Ahmed Khan,ahmed@example.com,+923001234567,+923001234567,Khan Senior,+923007654321,Pakistan,Lahore,active,1,Full-Stack Web\n" +
      "Ayesha Noor,ayesha@example.com,+923219876543,+923219876543,, ,Pakistan,Karachi,active,5,Python Beginner\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tbos_students_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout
      title="Students Management & Roster"
      description="Roster of all enrolled students, individual profile history, billing schedules, and CSV import."
      onRefresh={fetchStudents}
      isRefreshing={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setWizardStep(1);
              setShowAddModal(true);
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white gap-1.5 text-xs font-medium shadow-sm"
          >
            <UserPlus className="h-3.5 w-3.5" /> Complete Registration Wizard
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-1.5 text-xs font-medium"
          >
            <Upload className="h-3.5 w-3.5" /> Import CSV
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Statistics Pill Ribbons */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Total Enrolled</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
            <span className="text-xs font-semibold text-emerald-800">Active Learners</span>
            <div className="mt-1 text-2xl font-bold text-emerald-700">{stats.active}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
            <span className="text-xs font-semibold text-amber-800">Paused / On Hold</span>
            <div className="mt-1 text-2xl font-bold text-amber-700">{stats.paused}</div>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm">
            <span className="text-xs font-semibold text-sky-800">Graduated</span>
            <div className="mt-1 text-2xl font-bold text-sky-700">{stats.completed}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-white border-slate-300"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Country / City</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Billing Day</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-600 mb-2" />
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {st.student_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{st.full_name}</div>
                        {st.guardian_name && (
                          <div className="text-[11px] text-slate-500">Guardian: {st.guardian_name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800">{st.email}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{st.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {st.city ? `${st.city}, ${st.country}` : st.country}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant={st.status === "active" ? "default" : "secondary"}
                            className={`text-[10px] uppercase font-mono font-bold ${
                              st.status === "active"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : st.status === "graduated" || st.status === "completed"
                                ? "bg-sky-100 text-sky-800 border-sky-300"
                                : st.status === "on_hold" || st.status === "paused"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : st.status === "withdrawn" || st.status === "dropped"
                                ? "bg-orange-100 text-orange-800 border-orange-300"
                                : st.status === "archived"
                                ? "bg-slate-200 text-slate-800 border-slate-300"
                                : ""
                            }`}
                          >
                            {st.status}
                          </Badge>
                          <select
                            value={st.status}
                            onChange={(e) => handleQuickStatusChange(st.id, e.target.value)}
                            title="Quick Status Change"
                            className="h-6 text-[10px] bg-slate-50 border border-slate-200 rounded px-1 text-slate-600 hover:border-slate-400 focus:outline-none"
                          >
                            <option value="active">Active</option>
                            <option value="on_hold">On Hold</option>
                            <option value="graduated">Graduated</option>
                            <option value="withdrawn">Withdrawn</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        Day {st.billing_day} of month
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadStudentProfile(st.id)}
                            className="h-7 px-2 text-xs text-sky-700 hover:text-sky-800 hover:bg-sky-50 font-medium"
                            title="View Profile"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> Profile
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(st)}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            title="Edit Details"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          {st.status === "archived" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreStudent(st.id)}
                              className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Restore Student"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenArchiveModal(st)}
                              className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Archive Student"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(st)}
                            className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            title="Delete Student"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Complete Multi-Section Student Wizard Modal (Section B) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-sky-600" />
                  New Student Registration Wizard
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Atomically register personal profile, enrollment, billing plan, and weekly class timetable.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, label: "Personal Details" },
                  { step: 2, label: "Program Enrollment" },
                  { step: 3, label: "Fee & Billing Plan" },
                  { step: 4, label: "Timetable Schedule" },
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setWizardStep(s.step as any)}
                    className="flex items-center gap-2 text-left group"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        wizardStep === s.step
                          ? "bg-sky-600 text-white"
                          : wizardStep > s.step
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {wizardStep > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:inline ${
                        wizardStep === s.step ? "text-slate-900 font-bold" : "text-slate-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step Body */}
            <form onSubmit={handleCreateStudentFull} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* STEP 1: Personal Details */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold text-slate-700">Full Name *</Label>
                      <Input
                        required
                        value={wizardData.fullName}
                        onChange={(e) => setWizardData({ ...wizardData, fullName: e.target.value })}
                        placeholder="e.g. Bilal Hassan"
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Email Address *</Label>
                      <Input
                        required
                        type="email"
                        value={wizardData.email}
                        onChange={(e) => setWizardData({ ...wizardData, email: e.target.value })}
                        placeholder="bilal@example.com"
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Phone Number *</Label>
                      <Input
                        required
                        value={wizardData.phone}
                        onChange={(e) => setWizardData({ ...wizardData, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">WhatsApp (if different)</Label>
                      <Input
                        value={wizardData.whatsapp}
                        onChange={(e) => setWizardData({ ...wizardData, whatsapp: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Emergency Contact</Label>
                      <Input
                        value={wizardData.emergencyContact}
                        onChange={(e) => setWizardData({ ...wizardData, emergencyContact: e.target.value })}
                        placeholder="Contact name and phone"
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
                    <span className="font-semibold text-slate-800 block text-xs">Guardian Information (Minors & Dependents)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[11px] text-slate-600">Guardian Name</Label>
                        <Input
                          value={wizardData.guardianName}
                          onChange={(e) => setWizardData({ ...wizardData, guardianName: e.target.value })}
                          placeholder="e.g. Tariq Hassan"
                          className="mt-1 h-8 text-xs bg-white border-slate-300"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-600">Guardian Phone</Label>
                        <Input
                          value={wizardData.guardianPhone}
                          onChange={(e) => setWizardData({ ...wizardData, guardianPhone: e.target.value })}
                          placeholder="+92 321 9876543"
                          className="mt-1 h-8 text-xs bg-white border-slate-300"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-slate-600">Relationship</Label>
                        <select
                          value={wizardData.guardianRelationship}
                          onChange={(e) => setWizardData({ ...wizardData, guardianRelationship: e.target.value })}
                          className="mt-1 w-full h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800"
                        >
                          <option value="Parent">Parent</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Guardian">Guardian</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Country</Label>
                      <Input
                        value={wizardData.country}
                        onChange={(e) => setWizardData({ ...wizardData, country: e.target.value })}
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">City</Label>
                      <Input
                        value={wizardData.city}
                        onChange={(e) => setWizardData({ ...wizardData, city: e.target.value })}
                        placeholder="Lahore, Karachi..."
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Timezone</Label>
                      <select
                        value={wizardData.timezone}
                        onChange={(e) => setWizardData({ ...wizardData, timezone: e.target.value })}
                        className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800"
                      >
                        <option value="Asia/Karachi">Asia/Karachi (PKT)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Program Enrollment */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Program Track</Label>
                      <select
                        value={wizardData.programType}
                        onChange={(e) => {
                          const newType = e.target.value as "live_batch" | "specialization" | "course" | "tutoring";
                          const newCatalog = getCatalogForType(newType);
                          const first = newCatalog[0];
                          setIsCustomProgram(false);
                          setWizardData((prev) => ({
                            ...prev,
                            programType: newType,
                            programTitle: first ? first.title : "",
                            programSlug: first ? first.slug : "",
                            baseFee: first ? first.fee : 0,
                          }));
                        }}
                        className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-800"
                      >
                        <option value="live_batch">Live Group Batch</option>
                        <option value="tutoring">1-on-1 Dedicated Tutoring</option>
                        <option value="specialization">Career Specialization</option>
                        <option value="course">Single Course</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Delivery Mode</Label>
                      <select
                        value={wizardData.mode}
                        onChange={(e) => setWizardData({ ...wizardData, mode: e.target.value as any })}
                        className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-800"
                      >
                        <option value="group">Group Cohort</option>
                        <option value="one_on_one">1-on-1 Individual</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold text-slate-700">Program / Course Offering *</Label>
                      <select
                        value={isCustomProgram ? "custom" : wizardData.programTitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "custom") {
                            setIsCustomProgram(true);
                            setWizardData({
                              ...wizardData,
                              programTitle: "Custom Training Program",
                              programSlug: "custom-training-program",
                            });
                          } else {
                            setIsCustomProgram(false);
                            const found = programCatalog.find((p) => p.title === val);
                            setWizardData({
                              ...wizardData,
                              programTitle: val,
                              programSlug: found ? found.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                              baseFee: found ? found.fee : wizardData.baseFee,
                            });
                          }
                        }}
                        className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-800 font-medium"
                      >
                        {programCatalog.map((p) => (
                          <option key={p.slug} value={p.title}>
                            {p.fee > 0 ? `${p.title} (PKR ${p.fee.toLocaleString()})` : `${p.title} (Fee TBD / Manual)`}
                          </option>
                        ))}
                        <option value="custom">-- Custom Training Program (Manual) --</option>
                      </select>
                      {isCustomProgram && (
                        <div className="mt-2">
                          <Label className="text-xs font-semibold text-slate-700">Custom Program Title</Label>
                          <Input
                            type="text"
                            placeholder="Enter custom training program title..."
                            value={wizardData.programTitle}
                            onChange={(e) =>
                              setWizardData({
                                ...wizardData,
                                programTitle: e.target.value,
                                programSlug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                              })
                            }
                            className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                          />
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <Label className="text-xs font-semibold text-slate-700">Assign to Cohort / Batch (Optional)</Label>
                      <select
                        value={wizardData.batchId}
                        onChange={(e) => handleBatchSelect(e.target.value)}
                        className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-800"
                      >
                        <option value="">None / Standalone 1-on-1 Student</option>
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} {b.batch_code ? `(${b.batch_code})` : ""} - {b.program_type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Start Date</Label>
                      <Input
                        type="date"
                        value={wizardData.startDate}
                        onChange={(e) => setWizardData({ ...wizardData, startDate: e.target.value })}
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Expected End Date</Label>
                      <Input
                        type="date"
                        value={wizardData.expectedEndDate}
                        onChange={(e) => setWizardData({ ...wizardData, expectedEndDate: e.target.value })}
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Fee & Billing Plan */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Plan Type</Label>
                      <select
                        value={wizardData.planType}
                        onChange={(e) => setWizardData({ ...wizardData, planType: e.target.value as any })}
                        className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-800"
                      >
                        <option value="monthly">Monthly Recurring Dues</option>
                        <option value="one_time">One-Time Full Payment</option>
                        <option value="custom">Custom Milestone Plan</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Monthly Billing Day (1-28)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        value={wizardData.billingDay}
                        onChange={(e) => setWizardData({ ...wizardData, billingDay: Number(e.target.value) })}
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Base Fee (PKR) *</Label>
                      <Input
                        type="number"
                        min={0}
                        value={wizardData.baseFee}
                        onChange={(e) => setWizardData({ ...wizardData, baseFee: Number(e.target.value) })}
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-700">Discount Amount (PKR)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={wizardData.discount}
                        onChange={(e) => setWizardData({ ...wizardData, discount: Number(e.target.value) })}
                        className="mt-1 h-9 bg-white border-slate-300 text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* Net Fee Highlight Card */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-emerald-800">Net Agreed Fee (Charged to Student)</span>
                      <p className="text-xs text-emerald-700 mt-0.5">Calculated as Base Fee minus Discount</p>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-800">
                      PKR {Math.max(0, wizardData.baseFee - wizardData.discount).toLocaleString()}
                    </div>
                  </div>

                  {/* Initial Invoice Checkbox */}
                  <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wizardData.createInitialInvoice}
                        onChange={(e) => setWizardData({ ...wizardData, createInitialInvoice: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Generate first fee invoice immediately upon creation
                      </span>
                    </label>

                    {wizardData.createInitialInvoice && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-4">
                        <Label className="text-xs text-slate-600 font-medium">Initial Invoice Due Date:</Label>
                        <Input
                          type="date"
                          value={wizardData.dueDate}
                          onChange={(e) => setWizardData({ ...wizardData, dueDate: e.target.value })}
                          className="w-44 h-8 text-xs bg-white border-slate-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Timetable & Recurring Class Schedule */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">Weekly Recurring Class Slots</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        These slots define the student's recurring weekly timetable and generate live class sessions.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddSlot}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Slot
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {wizardData.schedules.length === 0 ? (
                      <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-slate-500">
                        No recurring class slots configured. Click "Add Slot" above.
                      </div>
                    ) : (
                      wizardData.schedules.map((slot, index) => (
                        <div
                          key={index}
                          className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-wrap sm:flex-nowrap items-center gap-2.5"
                        >
                          <div className="w-full sm:w-36">
                            <Label className="text-[10px] text-slate-500">Day of Week</Label>
                            <select
                              value={slot.dayOfWeek}
                              onChange={(e) => {
                                const newSchedules = [...wizardData.schedules];
                                newSchedules[index].dayOfWeek = Number(e.target.value);
                                setWizardData({ ...wizardData, schedules: newSchedules });
                              }}
                              className="mt-0.5 w-full h-8 text-xs rounded border border-slate-300 bg-white px-2 text-slate-800"
                            >
                              {DAY_NAMES.map((name, dIdx) => (
                                <option key={dIdx} value={dIdx}>
                                  {name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-28">
                            <Label className="text-[10px] text-slate-500">Start Time</Label>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => {
                                const newSchedules = [...wizardData.schedules];
                                newSchedules[index].startTime = e.target.value;
                                setWizardData({ ...wizardData, schedules: newSchedules });
                              }}
                              className="mt-0.5 h-8 text-xs bg-white border-slate-300"
                            />
                          </div>

                          <div className="w-28">
                            <Label className="text-[10px] text-slate-500">End Time</Label>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => {
                                const newSchedules = [...wizardData.schedules];
                                newSchedules[index].endTime = e.target.value;
                                setWizardData({ ...wizardData, schedules: newSchedules });
                              }}
                              className="mt-0.5 h-8 text-xs bg-white border-slate-300"
                            />
                          </div>

                          <div className="flex-1 min-w-[150px]">
                            <Label className="text-[10px] text-slate-500">Live Meeting Link</Label>
                            <Input
                              type="url"
                              value={slot.meetingUrl}
                              onChange={(e) => {
                                const newSchedules = [...wizardData.schedules];
                                newSchedules[index].meetingUrl = e.target.value;
                                setWizardData({ ...wizardData, schedules: newSchedules });
                              }}
                              placeholder="https://meet.google.com/..."
                              className="mt-0.5 h-8 text-xs bg-white border-slate-300"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(index)}
                            className="mt-4 p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3.5 bg-white flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">Generate Upfront Sessions in Timetable</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Creates dated class session occurrences on the timetable immediately.
                      </p>
                    </div>
                    <select
                      value={wizardData.generateWeeks}
                      onChange={(e) => setWizardData({ ...wizardData, generateWeeks: Number(e.target.value) })}
                      className="h-8 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 font-mono"
                    >
                      <option value={2}>2 weeks upfront</option>
                      <option value={4}>4 weeks upfront</option>
                      <option value={8}>8 weeks upfront</option>
                      <option value={12}>12 weeks upfront</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Wizard Footer Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
                {wizardStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-1 text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                  >
                    Cancel
                  </Button>
                )}

                {wizardStep < 4 ? (
                  <Button
                    key="wizard-next-btn"
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (wizardStep === 1 && (!wizardData.fullName || !wizardData.email || !wizardData.phone)) {
                        toast.error("Please fill in Full Name, Email, and Phone number.");
                        return;
                      }
                      setWizardStep((prev) => (prev + 1) as any);
                    }}
                    className="bg-sky-600 hover:bg-sky-700 text-white gap-1 text-xs font-medium"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    key="wizard-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs font-semibold shadow-sm"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    Complete Registration & Setup System
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Bulk CSV Student Import</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 flex items-center justify-between text-sky-900">
                <div>
                  <p className="font-semibold">Download CSV Template</p>
                  <p className="text-[11px] text-sky-700">Includes verified columns: name, email, phone, billingDay...</p>
                </div>
                <Button size="sm" variant="outline" onClick={downloadCsvTemplate} className="gap-1 text-xs border-sky-300">
                  <Download className="h-3.5 w-3.5" /> Template
                </Button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <Input type="file" accept=".csv" onChange={handleCsvFileChange} className="hidden" id="csv-upload" />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Click to choose CSV file</p>
                  <p className="text-[11px] text-slate-400 mt-1">{csvFile ? csvFile.name : "or drag and drop here"}</p>
                </label>
              </div>

              {csvRows.length > 0 && (
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div className="font-semibold text-slate-900">Preview: {csvRows.length} rows detected</div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    Sample: {csvRows[0].fullName || csvRows[0].name} ({csvRows[0].email})
                  </div>
                </div>
              )}

              {importSummary && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                  <p className="font-bold">Import Completed</p>
                  <p className="text-xs">Successfully created: {importSummary.importedCount} student(s)</p>
                  {importSummary.failedCount > 0 && (
                    <p className="text-xs text-rose-600 mt-1">Failed/Duplicate: {importSummary.failedCount} row(s)</p>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowImportModal(false)} className="border-slate-300">
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={csvRows.length === 0 || isImporting}
                  onClick={handleImportCsv}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  {isImporting ? "Processing..." : `Import ${csvRows.length} Students`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Student Profile Drawer (Section G) */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {isDetailLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600 mr-2" />
                Loading student records...
              </div>
            ) : !studentDetail?.student ? (
              <div className="p-6 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-500 mb-2" />
                Student record not found.
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedStudentId(null)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-sky-300 font-bold">
                        {studentDetail.student.student_id}
                      </span>
                      <Badge className="text-[10px] uppercase font-mono font-bold bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        {studentDetail.student.status}
                      </Badge>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{studentDetail.student.full_name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditModal(studentDetail.student)}
                      className="h-8 px-2.5 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-sky-300" /> Edit
                    </Button>
                    {studentDetail.student.status === "archived" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreStudent(studentDetail.student.id)}
                        className="h-8 px-2.5 text-xs bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border-emerald-700/50 gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-400" /> Restore
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenArchiveModal(studentDetail.student)}
                        className="h-8 px-2.5 text-xs bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border-amber-700/50 gap-1"
                      >
                        <Archive className="w-3.5 h-3.5 text-amber-400" /> Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDeleteModal(studentDetail.student)}
                      className="h-8 w-8 p-0 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-800/50"
                      title="Delete Student"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </Button>
                    <button onClick={() => setSelectedStudentId(null)} className="text-slate-400 hover:text-white p-1 ml-1">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Profile Navigation Tabs */}
                <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold overflow-x-auto shrink-0">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "overview" ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("enrollments")}
                    className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "enrollments" ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Enrollments ({studentDetail.enrollments?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("schedule")}
                    className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "schedule" ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Schedule & Classes ({studentDetail.sessions?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("fees")}
                    className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "fees" ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Fees & Ledger ({studentDetail.invoices?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("attendance")}
                    className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "attendance" ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Attendance ({studentDetail.attendance?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("tasks")}
                    className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === "tasks" ? "border-sky-600 text-sky-700" : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Tasks ({studentDetail.tasks?.length || 0})
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      {/* Archive Status Banner */}
                      {(studentDetail.student.status === "archived" || studentDetail.student.archived_at) && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-xs">
                              <Archive className="h-4 w-4 text-amber-600" />
                              Student Record is Archived
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRestoreStudent(studentDetail.student.id)}
                              className="h-7 text-xs bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore Student
                            </Button>
                          </div>
                          <div className="mt-1 text-[11px] text-amber-800 space-y-0.5">
                            {studentDetail.student.archived_at && (
                              <div>Archived on: {new Date(studentDetail.student.archived_at).toLocaleString()}</div>
                            )}
                            {studentDetail.student.archive_reason && (
                              <div>Reason: {studentDetail.student.archive_reason}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-4 bg-slate-50/70">
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Email</span>
                          <span className="font-semibold text-slate-900">{studentDetail.student.email}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Phone / WhatsApp</span>
                          <span className="font-semibold text-slate-900 font-mono">{studentDetail.student.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Residential Address</span>
                          <span className="font-semibold text-slate-900">{studentDetail.student.address || "—"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Location</span>
                          <span className="font-semibold text-slate-900">
                            {studentDetail.student.city ? `${studentDetail.student.city}, ` : ""}{studentDetail.student.country}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Age & Date of Birth</span>
                          <span className="font-semibold text-slate-900">
                            {studentDetail.student.age ? `${studentDetail.student.age} yrs` : "—"}{" "}
                            {studentDetail.student.date_of_birth ? `(${studentDetail.student.date_of_birth})` : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Timezone</span>
                          <span className="font-semibold text-slate-900 font-mono">{studentDetail.student.timezone || "Asia/Karachi"}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Monthly Billing Day</span>
                          <span className="font-semibold text-slate-900 font-mono">Day {studentDetail.student.billing_day} of month</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px] font-medium">Emergency Contact</span>
                          <span className="font-semibold text-slate-900">{studentDetail.student.emergency_contact || "—"}</span>
                        </div>
                        {studentDetail.student.notes && (
                          <div className="col-span-2 pt-2 border-t border-slate-200">
                            <span className="text-slate-500 block text-[11px] font-medium">Notes / Remarks</span>
                            <span className="text-slate-900">{studentDetail.student.notes}</span>
                          </div>
                        )}
                      </div>

                      {studentDetail.student.guardian_name && (
                        <div className="rounded-xl border border-slate-200 p-4 bg-white">
                          <h4 className="font-bold text-slate-900 mb-2">Guardian Information</h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <span className="text-slate-500 text-[11px] block">Name</span>
                              <span className="font-medium text-slate-800">{studentDetail.student.guardian_name}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[11px] block">Relationship</span>
                              <span className="font-medium text-slate-800">{studentDetail.student.guardian_relationship || "Parent"}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[11px] block">Phone</span>
                              <span className="font-mono text-slate-800">{studentDetail.student.guardian_phone || "—"}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Direct Contact Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50">
                          <a
                            href={`https://wa.me/${(studentDetail.student.whatsapp || studentDetail.student.phone || "").replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp Student
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5 text-sky-700 border-sky-300 hover:bg-sky-50">
                          <a href={`mailto:${studentDetail.student.email}`}>
                            <Mail className="h-4 w-4 text-sky-600" /> Send Email
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50">
                          <a href={`tel:${studentDetail.student.phone}`}>
                            <Phone className="h-4 w-4 text-slate-600" /> Call Phone
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ENROLLMENTS */}
                  {activeTab === "enrollments" && (
                    <div className="space-y-3">
                      {studentDetail.enrollments?.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">No program enrollments recorded.</div>
                      ) : (
                        studentDetail.enrollments.map((enr: any) => (
                          <div key={enr.id} className="rounded-xl border border-slate-200 p-4 bg-white shadow-xs">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-900 text-sm">{enr.program_title}</h4>
                              <Badge variant="outline" className="uppercase font-mono text-[10px] font-bold">
                                {enr.status}
                              </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-slate-600">
                              <div>Track: <span className="font-medium text-slate-800 capitalize">{enr.program_type?.replace("_", " ")}</span></div>
                              <div>Agreed Fee: <span className="font-mono font-bold text-slate-900">PKR {Number(enr.agreed_fee).toLocaleString()}/month</span></div>
                              <div>Start Date: <span className="font-medium text-slate-800">{enr.start_date || enr.enrollment_date}</span></div>
                              <div>Batch: <span className="font-medium text-slate-800">{enr.batches?.name || "1-on-1 Dedicated"}</span></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 3: SCHEDULE & CLASSES */}
                  {activeTab === "schedule" && (
                    <div className="space-y-4">
                      {/* Recurring Slots Card */}
                      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/70">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900">Weekly Recurring Schedule</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownloadStudentIcs}
                            className="h-7 text-xs border-slate-300 text-sky-700 hover:bg-sky-50 gap-1"
                          >
                            <Calendar className="w-3.5 h-3.5 text-sky-600" /> Export .ics
                          </Button>
                        </div>
                        {(!studentDetail.recurringSchedules || studentDetail.recurringSchedules.length === 0) ? (
                          <p className="text-slate-500 text-xs">No recurring schedule slots registered.</p>
                        ) : (
                          <div className="space-y-1.5 mt-2">
                            {studentDetail.recurringSchedules.map((rs: any) => (
                              <div key={rs.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                                <span className="font-semibold text-slate-800">
                                  Every {DAY_NAMES[rs.day_of_week]}: {rs.start_time} - {rs.end_time}
                                </span>
                                {rs.meeting_url && (
                                  <a
                                    href={rs.meeting_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium text-xs"
                                  >
                                    <Video className="w-3.5 h-3.5" /> Join Link
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Dated Class Sessions Table */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Upcoming & Historical Class Sessions</h4>
                        {(!studentDetail.sessions || studentDetail.sessions.length === 0) ? (
                          <div className="text-center py-6 text-slate-400 border border-slate-200 rounded-xl">
                            No class sessions recorded on timetable.
                          </div>
                        ) : (
                          <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                                <tr>
                                  <th className="p-2.5">Date</th>
                                  <th className="p-2.5">Time</th>
                                  <th className="p-2.5">Session Title</th>
                                  <th className="p-2.5">Status</th>
                                  <th className="p-2.5 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {studentDetail.sessions.map((sess: any) => (
                                  <tr key={sess.id} className="hover:bg-slate-50/80">
                                    <td className="p-2.5 font-medium text-slate-800">{sess.session_date}</td>
                                    <td className="p-2.5 font-mono text-slate-600">{sess.start_time} - {sess.end_time}</td>
                                    <td className="p-2.5 font-semibold text-slate-900">{sess.title}</td>
                                    <td className="p-2.5">
                                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                                        {sess.status}
                                      </Badge>
                                    </td>
                                    <td className="p-2.5 text-right">
                                      {sess.meeting_link ? (
                                        <Button asChild size="sm" variant="ghost" className="h-6 px-2 text-xs text-sky-600">
                                          <a href={sess.meeting_link} target="_blank" rel="noreferrer">
                                            <ExternalLink className="w-3 h-3 mr-1" /> Meet
                                          </a>
                                        </Button>
                                      ) : null}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: FEES & BILLING LEDGER */}
                  {activeTab === "fees" && (
                    <div className="space-y-4">
                      {/* Active Billing Plan Banner */}
                      {studentDetail.billingPlans && studentDetail.billingPlans.length > 0 && (
                        <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4">
                          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">Active Billing Plan</span>
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-slate-500 block text-[11px]">Plan Type</span>
                              <span className="font-bold text-slate-900 capitalize">{studentDetail.billingPlans[0].plan_type}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[11px]">Net Amount</span>
                              <span className="font-mono font-bold text-sky-800">PKR {Number(studentDetail.billingPlans[0].amount).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[11px]">Billing Day</span>
                              <span className="font-mono font-semibold text-slate-900">Day {studentDetail.billingPlans[0].billing_day}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[11px]">Status</span>
                              <Badge className="text-[10px] uppercase font-mono bg-emerald-600 text-white">Active</Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Invoices List */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Invoices & Dues</h4>
                        {studentDetail.invoices?.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 border border-slate-200 rounded-xl">No invoices generated yet.</div>
                        ) : (
                          <div className="space-y-2">
                            {studentDetail.invoices.map((inv: any) => (
                              <div key={inv.id} className="rounded-xl border border-slate-200 p-3.5 bg-white flex items-center justify-between">
                                <div>
                                  <div className="font-mono font-bold text-slate-900">{inv.invoice_number}</div>
                                  <div className="text-[11px] text-slate-500">Month: {inv.billing_month} · Due: {inv.due_date}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold font-mono text-slate-900">PKR {Number(inv.amount_due).toLocaleString()}</div>
                                  <Badge
                                    variant={inv.status === "paid" ? "default" : "destructive"}
                                    className={`text-[10px] uppercase font-mono ${
                                      inv.status === "paid" ? "bg-emerald-600 text-white" : ""
                                    }`}
                                  >
                                    {inv.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Payments List */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Payment Receipts</h4>
                        {studentDetail.payments?.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 border border-slate-200 rounded-xl">No payments recorded.</div>
                        ) : (
                          <div className="space-y-2">
                            {studentDetail.payments.map((p: any) => (
                              <div key={p.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/60 flex items-center justify-between">
                                <div>
                                  <span className="font-mono font-bold text-slate-900">{p.receipt_number}</span>
                                  <div className="text-[11px] text-slate-500">{p.payment_date} via {p.payment_method}</div>
                                </div>
                                <div className="font-bold font-mono text-emerald-700">
                                  +PKR {Number(p.amount).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: ATTENDANCE */}
                  {activeTab === "attendance" && (
                    <div className="space-y-3">
                      {studentDetail.attendance?.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">No attendance logs found.</div>
                      ) : (
                        studentDetail.attendance.map((att: any) => (
                          <div key={att.id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between bg-white">
                            <div>
                              <div className="font-semibold text-slate-900">{att.class_sessions?.title || "Class Session"}</div>
                              <div className="text-[11px] text-slate-500">{att.class_sessions?.session_date}</div>
                            </div>
                            <Badge variant={att.status === "present" ? "default" : "secondary"} className="uppercase text-[10px] font-mono">
                              {att.status}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 6: TASKS & FOLLOW-UPS */}
                  {activeTab === "tasks" && (
                    <div className="space-y-4">
                      {/* Inline Quick Task Creator */}
                      <form onSubmit={handleAddQuickTask} className="flex gap-2">
                        <Input
                          value={quickTaskTitle}
                          onChange={(e) => setQuickTaskTitle(e.target.value)}
                          placeholder="Add quick follow-up or operational task..."
                          className="text-xs h-9 bg-white border-slate-300"
                        />
                        <Button
                          type="submit"
                          disabled={isAddingTask || !quickTaskTitle.trim()}
                          size="sm"
                          className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs whitespace-nowrap"
                        >
                          {isAddingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                          Add Task
                        </Button>
                      </form>

                      {studentDetail.tasks?.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 border border-slate-200 rounded-xl">
                          No tasks recorded for this student.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {studentDetail.tasks.map((t: any) => (
                            <div key={t.id} className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-slate-900 block">{t.title}</span>
                                {t.due_date && <span className="text-[11px] text-slate-500">Due: {t.due_date}</span>}
                              </div>
                              <Badge className="text-[10px] uppercase font-mono">{t.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Edit Student Details</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto py-4 space-y-3.5 text-xs">
              {/* Duplicate Alert */}
              {editDuplicateWarning && (
                <div className="rounded-lg bg-amber-50 border border-amber-300 p-3 flex items-start gap-2.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs">Duplicate Contact Warning</div>
                    <div className="text-[11px] mt-0.5">{editDuplicateWarning}</div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Full Name *</Label>
                  <Input
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Email Address *</span>
                    {isCheckingDuplicate && <Loader2 className="w-3 h-3 animate-spin text-sky-600" />}
                  </Label>
                  <Input
                    required
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Phone Number *</span>
                    {isCheckingDuplicate && <Loader2 className="w-3 h-3 animate-spin text-sky-600" />}
                  </Label>
                  <Input
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">WhatsApp</Label>
                  <Input
                    value={editFormData.whatsapp}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Residential Address</Label>
                  <Input
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    placeholder="House / Street / Area"
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">City</Label>
                  <Input
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Country</Label>
                  <Input
                    value={editFormData.country}
                    onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Date of Birth</Label>
                  <Input
                    type="date"
                    value={editFormData.dateOfBirth}
                    onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Age</Label>
                  <Input
                    type="number"
                    min={4}
                    max={100}
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Guardian Name</Label>
                  <Input
                    value={editFormData.guardianName}
                    onChange={(e) => setEditFormData({ ...editFormData, guardianName: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Guardian Phone</Label>
                  <Input
                    value={editFormData.guardianPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, guardianPhone: e.target.value })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Guardian Relationship</Label>
                  <Input
                    value={editFormData.guardianRelationship}
                    onChange={(e) => setEditFormData({ ...editFormData, guardianRelationship: e.target.value })}
                    placeholder="e.g. Father / Mother"
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Emergency Contact</Label>
                  <Input
                    value={editFormData.emergencyContact}
                    onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                    placeholder="Name & Contact Number"
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Billing Day of Month (1-28)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={editFormData.billingDay}
                    onChange={(e) => setEditFormData({ ...editFormData, billingDay: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs bg-white border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Student Status</Label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="mt-1 w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="on_hold">On Hold</option>
                    <option value="paused">Paused</option>
                    <option value="graduated">Graduated</option>
                    <option value="completed">Completed</option>
                    <option value="withdrawn">Withdrawn</option>
                    <option value="dropped">Dropped</option>
                    <option value="archived">Archived</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Internal Operational Notes</Label>
                  <Input
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    placeholder="Administrative background notes..."
                    className="mt-1 h-9 text-xs bg-white border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingEdit}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-medium"
                >
                  {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                  Save Student Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Safety Confirmation Modal */}
      {showDeleteSafetyModal && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">Student Deletion Safety Check</h3>
            </div>

            <div className="py-4 space-y-3 text-xs">
              {deleteBlockReason ? (
                <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                    Permanent Deletion Blocked by Academy Policy
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-700">
                    {deleteBlockReason}
                  </p>
                  <p className="text-[11px] text-slate-600 pt-1 border-t border-rose-200">
                    To preserve financial audits and legal records, active ledger data cannot be erased. You should archive this student instead.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-slate-700">
                    You requested to delete student <strong className="text-slate-900 font-mono">{studentToDelete.student_id} ({studentToDelete.full_name})</strong>.
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Permanent deletion is strictly restricted to system owners and will be blocked if any invoices, payment receipts, or attendance records exist.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteSafetyModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>

              {deleteBlockReason ? (
                <Button
                  size="sm"
                  disabled={isDeletingStudent}
                  onClick={() => handleConfirmDelete(false)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                >
                  {isDeletingStudent ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Archive className="w-3.5 h-3.5 mr-1" />}
                  Archive Student Instead
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    disabled={isDeletingStudent}
                    onClick={() => handleConfirmDelete(false)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium"
                  >
                    {isDeletingStudent ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Archive className="w-3.5 h-3.5 mr-1" />}
                    Archive (Safe & Recommended)
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isDeletingStudent}
                    onClick={() => handleConfirmDelete(true)}
                    className="text-xs font-semibold"
                  >
                    {isDeletingStudent ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
                    Permanently Delete (Owner Only)
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Archive Reason Modal */}
      {showArchiveModal && studentToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Archive className="h-5 w-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">Archive Student Record</h3>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-700">
                Archiving <strong className="text-slate-900">{studentToArchive.full_name}</strong> will hide them from active rosters while preserving all enrollments, billing plans, fee invoices, and attendance logs.
              </p>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Archive Reason / Memo</Label>
                <Input
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  placeholder="e.g. Relocated abroad / Course completed"
                  className="mt-1 h-9 text-xs bg-white border-slate-300"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchiveModal(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isArchiving || !archiveReason.trim()}
                onClick={handleConfirmArchive}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                {isArchiving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                Confirm Archive
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
