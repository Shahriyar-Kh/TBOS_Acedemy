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
  CreditCard,
  Search,
  Filter,
  PlusCircle,
  Receipt,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  X,
  FileSpreadsheet,
  Printer,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/fees")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Academy Fees & Invoices") }),
  component: AdminFeesPage,
});

function AdminFeesPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalInvoiced: 0,
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: "",
    studentId: "",
    amount: "",
    paymentMethod: "bank_transfer",
    transactionRef: "",
    paymentDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Generate Dues Form State
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const defaultDue = new Date(now.getFullYear(), now.getMonth(), 10).toISOString().split("T")[0];

  const [generateForm, setGenerateForm] = useState({
    billingMonth: defaultMonth,
    dueDate: defaultDue,
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "25");

      const res = await fetch(`/api/admin/fees?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setStats(data.stats || { totalInvoiced: 0, totalCollected: 0, totalPending: 0, totalOverdue: 0 });
        setTotalCount(data.totalCount || 0);
      } else {
        toast.error("Failed to load invoices");
      }
    } catch {
      toast.error("Network error loading invoices");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchInvoices();
    }
  }, [fetchInvoices, admin]);

  const openPaymentForInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      invoiceId: inv.id,
      studentId: inv.student_id,
      amount: String(Math.max(0, Number(inv.amount_due) - Number(inv.amount_paid))),
      paymentMethod: "bank_transfer",
      transactionRef: "",
      paymentDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    setIsSubmittingPayment(true);
    try {
      const res = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "record-payment",
          invoiceId: paymentForm.invoiceId,
          studentId: paymentForm.studentId,
          amount: amt,
          paymentMethod: paymentForm.paymentMethod,
          transactionRef: paymentForm.transactionRef,
          paymentDate: paymentForm.paymentDate,
          notes: paymentForm.notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Payment of PKR ${amt.toLocaleString()} recorded!`);
        setShowPaymentModal(false);
        // Show receipt
        setReceiptData({
          receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
          payment: data.payment,
          invoice: selectedInvoice,
          amountPaid: amt,
          date: paymentForm.paymentDate,
          method: paymentForm.paymentMethod,
          transactionRef: paymentForm.transactionRef,
        });
        setShowReceiptModal(true);
        fetchInvoices();
      } else {
        toast.error(data.error || "Failed to record payment");
      }
    } catch {
      toast.error("Network error recording payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleGenerateDues = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "generate-monthly-dues",
          billingMonth: generateForm.billingMonth,
          dueDate: generateForm.dueDate,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Generated ${data.generatedCount} monthly invoices for ${generateForm.billingMonth}!`);
        setShowGenerateModal(false);
        fetchInvoices();
      } else {
        toast.error(data.error || "Failed to generate monthly dues");
      }
    } catch {
      toast.error("Network error generating monthly dues");
    } finally {
      setIsGenerating(false);
    }
  };

  // Client-side search filtering over retrieved items
  const filteredInvoices = invoices.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const invNum = inv.invoice_number?.toLowerCase() || "";
    const name = inv.students?.full_name?.toLowerCase() || "";
    const sid = inv.students?.student_id?.toLowerCase() || "";
    return invNum.includes(q) || name.includes(q) || sid.includes(q);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Paid</Badge>;
      case "partially_paid":
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Partial</Badge>;
      case "overdue":
        return <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30">Overdue</Badge>;
      case "waived":
        return <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30">Waived</Badge>;
      default:
        return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">Pending</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-cyan-400" />
              Fees & Payment Ledger
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage student fee billing, monthly automated dues, receipts, and revenue tracking in PKR.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGenerateModal(true)}
              className="border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              <Calendar className="w-4 h-4 mr-2 text-cyan-400" />
              Generate Monthly Dues
            </Button>
            <Button
              onClick={() => {
                setSelectedInvoice(null);
                setPaymentForm({
                  invoiceId: "",
                  studentId: "",
                  amount: "",
                  paymentMethod: "bank_transfer",
                  transactionRef: "",
                  paymentDate: new Date().toISOString().split("T")[0],
                  notes: "",
                });
                setShowPaymentModal(true);
              }}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Invoiced</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-2">
              PKR {stats.totalInvoiced.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">All time billable fees</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Collected</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2">
              PKR {stats.totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.totalInvoiced > 0
                ? `${Math.round((stats.totalCollected / stats.totalInvoiced) * 100)}% collection rate`
                : "0% collected"}
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Dues</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-2">
              PKR {stats.totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Due within current cycle</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overdue</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-2">
              PKR {stats.totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">Past designated due dates</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by invoice #, student, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {["all", "pending", "partially_paid", "paid", "overdue"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={
                  statusFilter === status
                    ? "bg-cyan-500 hover:bg-cyan-600 text-slate-950 capitalize"
                    : "border-slate-800 text-slate-300 hover:bg-slate-800 capitalize"
                }
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center p-12 text-slate-400">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium text-slate-300">No invoices found</p>
              <p className="text-xs text-slate-400 mt-1">Generate monthly dues or enroll new students to begin tracking billing.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase font-medium text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Billing Month</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInvoices.map((inv) => {
                    const balance = Math.max(0, Number(inv.amount_due) - Number(inv.amount_paid));
                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-white">{inv.invoice_number}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{inv.students?.full_name || "—"}</div>
                          <div className="text-xs font-mono text-cyan-400">{inv.students?.student_id || ""}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{inv.billing_month || "Admission / One-time"}</td>
                        <td className="py-3 px-4 text-slate-300">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">PKR {Number(inv.amount_due).toLocaleString()}</td>
                        <td className="py-3 px-4 text-emerald-400">PKR {Number(inv.amount_paid).toLocaleString()}</td>
                        <td className="py-3 px-4 font-medium text-amber-400">PKR {balance.toLocaleString()}</td>
                        <td className="py-3 px-4">{getStatusBadge(inv.status)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {balance > 0 && inv.status !== "waived" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPaymentForInvoice(inv)}
                                className="h-7 text-xs border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/40"
                              >
                                Pay
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setReceiptData({
                                  receiptNumber: `REC-${inv.invoice_number}`,
                                  invoice: inv,
                                  amountPaid: inv.amount_paid,
                                  date: inv.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
                                  method: "Bank / Digital",
                                  transactionRef: "Official Statement",
                                });
                                setShowReceiptModal(true);
                              }}
                              className="h-7 text-xs text-slate-400 hover:text-white"
                            >
                              <Receipt className="w-3.5 h-3.5 mr-1" />
                              Receipt
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                Record Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 mt-4">
              {selectedInvoice && (
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="text-slate-400">
                    Invoice: <span className="text-white font-mono">{selectedInvoice.invoice_number}</span>
                  </div>
                  <div className="text-slate-400">
                    Student: <span className="text-white">{selectedInvoice.students?.full_name}</span> (
                    {selectedInvoice.students?.student_id})
                  </div>
                  <div className="text-slate-400">
                    Remaining Balance:{" "}
                    <span className="text-amber-400 font-bold">
                      PKR{" "}
                      {(
                        Math.max(0, Number(selectedInvoice.amount_due) - Number(selectedInvoice.amount_paid))
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-300">Amount Received (PKR) *</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="e.g. 15000"
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Payment Method *</Label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="bank_transfer">Bank Transfer (Meezan / HBL / UBL)</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="cash">Cash</option>
                  <option value="stripe">Online / Card (Stripe)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label className="text-xs text-slate-300">Transaction Reference / Slip #</Label>
                <Input
                  type="text"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  placeholder="e.g. TR-9823412 or Deposit Slip #41"
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Payment Date *</Label>
                <Input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Notes / Remarks</Label>
                <Input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional payment notes"
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium"
                >
                  {isSubmittingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Monthly Dues Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Generate Monthly Dues
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateDues} className="space-y-4 mt-4">
              <p className="text-xs text-slate-400">
                This will automatically scan all currently <strong>active student enrollments</strong> and create
                invoices for the chosen billing month at their registered fee rate. Existing invoices for this month are
                strictly skipped to prevent duplicate charges.
              </p>

              <div>
                <Label className="text-xs text-slate-300">Billing Month (YYYY-MM) *</Label>
                <Input
                  type="month"
                  required
                  value={generateForm.billingMonth}
                  onChange={(e) => setGenerateForm({ ...generateForm, billingMonth: e.target.value })}
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Designated Due Date *</Label>
                <Input
                  type="date"
                  required
                  value={generateForm.dueDate}
                  onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerateModal(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Run Batch Generation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payment Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div id="receipt-print-area" className="bg-white text-slate-950 p-6 rounded-lg shadow-inner">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">TECHBUILT OPEN SCHOOL</h2>
                  <p className="text-xs text-slate-500">Official Student Payment Receipt</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    {receiptData.receiptNumber}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">{receiptData.date}</div>
                </div>
              </div>

              {/* Student & Invoice Info */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider block">Student</span>
                  <span className="font-bold text-sm text-slate-900">
                    {receiptData.invoice?.students?.full_name || "Enrolled Student"}
                  </span>
                  <span className="text-slate-500 block">ID: {receiptData.invoice?.students?.student_id || "—"}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 uppercase tracking-wider block">Invoice Reference</span>
                  <span className="font-mono font-bold text-slate-900">{receiptData.invoice?.invoice_number}</span>
                  <span className="text-slate-500 block">Cycle: {receiptData.invoice?.billing_month || "Tuition"}</span>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="border rounded-md overflow-hidden mb-4 text-xs">
                <table className="w-full">
                  <thead className="bg-slate-100 text-slate-600 font-medium">
                    <tr>
                      <th className="py-2 px-3 text-left">Description</th>
                      <th className="py-2 px-3 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3">
                        Tuition Payment via <span className="capitalize">{receiptData.method?.replace("_", " ")}</span>
                        {receiptData.transactionRef && (
                          <div className="text-slate-400 text-[10px]">Ref: {receiptData.transactionRef}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                        PKR {Number(receiptData.amountPaid).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                Thank you for your payment. For inquiries: techbuiltopenschool@gmail.com
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
              <Button
                onClick={() => setShowReceiptModal(false)}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

