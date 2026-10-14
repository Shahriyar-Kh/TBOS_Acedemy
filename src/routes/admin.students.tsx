import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { adminNoIndexMeta } from "@/lib/seo";
import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/lib/adminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Students Roster") }),
  component: AdminStudentsPage,
});

function AdminStudentsPage() {
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

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "enrollments" | "fees" | "attendance">("overview");

  // Add Student Form State
  const [addForm, setAddForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    guardianName: "",
    guardianPhone: "",
    country: "Pakistan",
    city: "",
    status: "active",
    billingDay: 1,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (admin) fetchStudents();
  }, [admin, fetchStudents]);

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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(`Student ${data.student?.student_id} added successfully!`);
        setShowAddModal(false);
        setAddForm({
          fullName: "",
          email: "",
          phone: "",
          whatsapp: "",
          guardianName: "",
          guardianPhone: "",
          country: "Pakistan",
          city: "",
          status: "active",
          billingDay: 1,
          notes: "",
        });
        fetchStudents();
      } else {
        toast.error(data.error || "Failed to create student");
      }
    } catch {
      toast.error("Network error while creating student");
    } finally {
      setIsSubmitting(false);
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
      title="Students Management"
      description="Roster of all enrolled students, individual profile history, billing schedules, and CSV import."
      onRefresh={fetchStudents}
      isRefreshing={isLoading}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-[#008DDA] hover:bg-[#0070b8] text-white gap-1.5 text-xs"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add Student
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="gap-1.5 text-xs"
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
            <span className="text-xs font-medium text-slate-500">Total Students</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
            <span className="text-xs font-semibold text-emerald-700">Active Learners</span>
            <div className="mt-1 text-2xl font-bold text-emerald-700">{stats.active}</div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
            <span className="text-xs font-semibold text-amber-700">Paused / On Hold</span>
            <div className="mt-1 text-2xl font-bold text-amber-700">{stats.paused}</div>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
            <span className="text-xs font-semibold text-blue-700">Graduated</span>
            <div className="mt-1 text-2xl font-bold text-blue-700">{stats.completed}</div>
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
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#008DDA]"
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
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
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
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#008DDA] mb-2" />
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
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
                          <div className="text-[11px] text-slate-400">Guardian: {st.guardian_name}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-700">{st.email}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{st.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {st.city ? `${st.city}, ${st.country}` : st.country}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={st.status === "active" ? "default" : "secondary"}
                          className={`text-[10px] uppercase font-mono ${
                            st.status === "active" ? "bg-emerald-500/10 text-emerald-700 border-emerald-200" : ""
                          }`}
                        >
                          {st.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        Day {st.billing_day} of month
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadStudentProfile(st.id)}
                          className="h-7 px-2.5 text-xs text-[#008DDA] hover:text-[#0070b8] hover:bg-blue-50"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Profile
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="mt-4 space-y-3.5 text-xs">
              <div>
                <Label className="text-xs font-semibold">Full Name *</Label>
                <Input
                  required
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  placeholder="e.g. Bilal Hassan"
                  className="mt-1 h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Email *</Label>
                  <Input
                    required
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="student@example.com"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Phone *</Label>
                  <Input
                    required
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Guardian Name (for minors)</Label>
                  <Input
                    value={addForm.guardianName}
                    onChange={(e) => setAddForm({ ...addForm, guardianName: e.target.value })}
                    placeholder="Parent name"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Guardian Phone</Label>
                  <Input
                    value={addForm.guardianPhone}
                    onChange={(e) => setAddForm({ ...addForm, guardianPhone: e.target.value })}
                    placeholder="+92 321 0000000"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Country</Label>
                  <Input
                    value={addForm.country}
                    onChange={(e) => setAddForm({ ...addForm, country: e.target.value })}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">City</Label>
                  <Input
                    value={addForm.city}
                    onChange={(e) => setAddForm({ ...addForm, city: e.target.value })}
                    placeholder="Lahore, Karachi..."
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Monthly Billing Day (1-28)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={addForm.billingDay}
                    onChange={(e) => setAddForm({ ...addForm, billingDay: Number(e.target.value) })}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Status</Label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="mt-1 w-full h-9 rounded-md border border-slate-200 px-3 text-xs"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} size="sm" className="bg-[#008DDA] text-white">
                  {isSubmitting ? "Creating..." : "Save Student"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Bulk CSV Student Import</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center justify-between text-blue-900">
                <div>
                  <p className="font-semibold">Download CSV Template</p>
                  <p className="text-[11px] text-blue-700">Includes verified columns: name, email, phone, billingDay...</p>
                </div>
                <Button size="sm" variant="outline" onClick={downloadCsvTemplate} className="gap-1 text-xs">
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
                <Button variant="outline" size="sm" onClick={() => setShowImportModal(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={csvRows.length === 0 || isImporting}
                  onClick={handleImportCsv}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isImporting ? "Processing..." : `Import ${csvRows.length} Students`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Drawer */}
      {selectedStudentId && studentDetail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 bg-[#0B192C] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-cyan-400 font-bold">
                    {studentDetail.student?.student_id}
                  </span>
                  <Badge className="text-[10px] uppercase font-mono">{studentDetail.student?.status}</Badge>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">{studentDetail.student?.full_name}</h2>
              </div>
              <button onClick={() => setSelectedStudentId(null)} className="text-slate-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === "overview" ? "border-[#008DDA] text-[#008DDA]" : "border-transparent text-slate-500"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("enrollments")}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === "enrollments" ? "border-[#008DDA] text-[#008DDA]" : "border-transparent text-slate-500"
                }`}
              >
                Enrollments ({studentDetail.enrollments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("fees")}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === "fees" ? "border-[#008DDA] text-[#008DDA]" : "border-transparent text-slate-500"
                }`}
              >
                Fees & Dues ({studentDetail.invoices?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  activeTab === "attendance" ? "border-[#008DDA] text-[#008DDA]" : "border-transparent text-slate-500"
                }`}
              >
                Attendance ({studentDetail.attendance?.length || 0})
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email</span>
                      <span className="font-semibold text-slate-800">{studentDetail.student?.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Phone / WhatsApp</span>
                      <span className="font-semibold text-slate-800 font-mono">{studentDetail.student?.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Location</span>
                      <span className="font-semibold text-slate-800">
                        {studentDetail.student?.city || "—"}, {studentDetail.student?.country}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Monthly Billing Day</span>
                      <span className="font-semibold text-slate-800 font-mono">Day {studentDetail.student?.billing_day}</span>
                    </div>
                  </div>

                  {studentDetail.student?.guardian_name && (
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-bold text-slate-900 mb-2">Guardian Contact</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Guardian Name</span>
                          <span className="font-medium text-slate-800">{studentDetail.student.guardian_name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Guardian Phone</span>
                          <span className="font-mono text-slate-800">{studentDetail.student.guardian_phone || "—"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Direct Contact Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button asChild size="sm" variant="outline" className="text-xs gap-1.5 text-emerald-700">
                      <a
                        href={`https://wa.me/${(studentDetail.student?.whatsapp || studentDetail.student?.phone || "").replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp Student
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
                      <a href={`mailto:${studentDetail.student?.email}`}>
                        <Mail className="h-4 w-4 text-blue-600" /> Send Email
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "enrollments" && (
                <div className="space-y-3">
                  {studentDetail.enrollments?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No active program enrollments.</div>
                  ) : (
                    studentDetail.enrollments.map((enr: any) => (
                      <div key={enr.id} className="rounded-xl border border-slate-200 p-4 bg-white shadow-xs">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">{enr.program_title}</h4>
                          <Badge variant="outline" className="uppercase font-mono text-[10px]">
                            {enr.status}
                          </Badge>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-slate-600">
                          <div>Agreed Fee: PKR {Number(enr.agreed_fee).toLocaleString()}/month</div>
                          <div>Enrolled: {enr.enrollment_date}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "fees" && (
                <div className="space-y-3">
                  {studentDetail.invoices?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No invoices generated yet.</div>
                  ) : (
                    studentDetail.invoices.map((inv: any) => (
                      <div key={inv.id} className="rounded-xl border border-slate-200 p-3.5 bg-white flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-slate-900">{inv.invoice_number}</div>
                          <div className="text-[11px] text-slate-500">Month: {inv.billing_month} · Due: {inv.due_date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold font-mono text-slate-900">PKR {Number(inv.amount_due).toLocaleString()}</div>
                          <Badge variant={inv.status === "paid" ? "default" : "destructive"} className="text-[10px] uppercase font-mono">
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

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
                        <Badge variant={att.status === "present" ? "default" : "secondary"} className="uppercase text-[10px]">
                          {att.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

