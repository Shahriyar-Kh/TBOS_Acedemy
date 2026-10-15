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
  PlusCircle,
  Receipt,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Printer,
  DollarSign,
  RefreshCw,
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
    expectedRevenue: 0,
    collectedRevenue: 0,
    outstandingBalance: 0,
    overdueCount: 0,
    dueTodayCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", "100");

      const res = await fetch(`/api/admin/fees?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        if (data.stats) {
          setStats({
            totalInvoiced: data.stats.totalInvoiced ?? data.stats.expectedRevenue ?? 0,
            totalCollected: data.stats.totalCollected ?? data.stats.collectedRevenue ?? 0,
            totalPending: data.stats.totalPending ?? data.stats.outstandingBalance ?? 0,
            totalOverdue: data.stats.totalOverdue ?? data.stats.overdueCount ?? 0,
            expectedRevenue: data.stats.expectedRevenue ?? data.stats.totalInvoiced ?? 0,
            collectedRevenue: data.stats.collectedRevenue ?? data.stats.totalCollected ?? 0,
            outstandingBalance: data.stats.outstandingBalance ?? data.stats.totalPending ?? 0,
            overdueCount: data.stats.overdueCount ?? data.stats.totalOverdue ?? 0,
            dueTodayCount: data.stats.dueTodayCount ?? 0,
          });
        }
        setTotalCount(data.totalCount || (data.invoices || []).length);
      } else {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error || "Failed to load invoices";
        setFetchError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.message || "Network error loading invoices";
      setFetchError(msg);
      toast.error(msg);
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
    const balanceRemaining = Math.max(0, Number(inv.amount_due) - Number(inv.amount_paid));
    setPaymentForm({
      invoiceId: inv.id,
      studentId: inv.student_id,
      amount: String(balanceRemaining),
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
      if (res.ok && (data.ok || data.success)) {
        toast.success(`Payment of PKR ${amt.toLocaleString()} recorded!`);
        setShowPaymentModal(false);
        // Show receipt
        setReceiptData({
          receiptNumber: data.payment?.receipt_number || `REC-${Date.now().toString().slice(-6)}`,
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
      if (res.ok && (data.ok || data.success)) {
        const count = data.generatedCount ?? data.createdCount ?? 0;
        toast.success(`Generated ${count} monthly invoices for ${generateForm.billingMonth}!`);
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
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Paid</Badge>;
      case "partially_paid":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Partial</Badge>;
      case "overdue":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Overdue</Badge>;
      case "waived":
        return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Waived</Badge>;
      default:
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Due</Badge>;
    }
  };

  const totalInvoicedVal = stats.totalInvoiced ?? stats.expectedRevenue ?? 0;
  const totalCollectedVal = stats.totalCollected ?? stats.collectedRevenue ?? 0;
  const totalPendingVal = stats.totalPending ?? stats.outstandingBalance ?? 0;
  const totalOverdueVal = stats.totalOverdue ?? stats.overdueCount ?? 0;

  return (
    <AdminLayout
      title="Fees & Payment Ledger"
      description="Manage student fee billing, monthly automated dues, receipts, and collection tracking in PKR."
      onRefresh={fetchInvoices}
      isRefreshing={isLoading}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            className="text-xs"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#008DDA]" />
            Generate Monthly Dues
          </Button>
          <Button
            size="sm"
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
            className="bg-[#008DDA] hover:bg-[#0070b8] text-white text-xs font-medium"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Record Payment
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-600 uppercase tracking-wider">
              <span>Total Invoiced</span>
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              PKR {totalInvoicedVal.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">All time billable fees</p>
          </div>

          <div className="bg-white border border-emerald-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              <span>Total Collected</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-2">
              PKR {totalCollectedVal.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalInvoicedVal > 0
                ? `${Math.round((totalCollectedVal / totalInvoicedVal) * 100)}% collection rate`
                : "0% collected"}
            </p>
          </div>

          <div className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-amber-600 uppercase tracking-wider">
              <span>Pending Dues</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 mt-2">
              PKR {totalPendingVal.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Due within current cycle</p>
          </div>

          <div className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-rose-600 uppercase tracking-wider">
              <span>Overdue</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-700 mt-2">
              {totalOverdueVal} invoice(s)
            </div>
            <p className="text-xs text-slate-500 mt-1">Past designated due dates</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by invoice #, student, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs border-slate-200 focus-visible:ring-[#008DDA]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {["all", "due", "partially_paid", "paid", "overdue"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`text-xs h-8 capitalize ${
                  statusFilter === status
                    ? "bg-[#008DDA] text-white hover:bg-[#0070b8]"
                    : "text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {status.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Loader2 className="w-7 h-7 animate-spin text-[#008DDA] mb-2" />
              <span className="text-xs">Loading fee ledger...</span>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-rose-500 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-800">Failed to load invoices</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md">{fetchError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchInvoices()}
                className="mt-4 text-xs gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </Button>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center p-12 text-slate-500">
              <CreditCard className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-800">No invoices found</p>
              <p className="text-xs text-slate-500 mt-1">
                Generate monthly dues or enroll new students to begin tracking billing.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[11px] font-semibold text-slate-500 border-b border-slate-200">
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
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => {
                    const balance = Math.max(0, Number(inv.amount_due) - Number(inv.amount_paid));
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">{inv.invoice_number}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{inv.students?.full_name || "—"}</div>
                          <div className="text-[11px] font-mono text-[#008DDA]">{inv.students?.student_id || ""}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{inv.billing_month || "Tuition / Fee"}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">PKR {Number(inv.amount_due).toLocaleString()}</td>
                        <td className="py-3 px-4 text-emerald-700 font-medium">PKR {Number(inv.amount_paid).toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold text-amber-700">PKR {balance.toLocaleString()}</td>
                        <td className="py-3 px-4">{getStatusBadge(inv.status)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {balance > 0 && inv.status !== "waived" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPaymentForInvoice(inv)}
                                className="h-7 text-xs border-blue-200 text-[#008DDA] hover:bg-blue-50"
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
                                  transactionRef: "Official Ledger",
                                });
                                setShowReceiptModal(true);
                              }}
                              className="h-7 text-xs text-slate-600 hover:text-slate-900"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#008DDA]" />
                Record Student Payment
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 mt-4 text-xs">
              {selectedInvoice && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-600">
                    Invoice: <span className="text-slate-900 font-mono font-semibold">{selectedInvoice.invoice_number}</span>
                  </div>
                  <div className="text-slate-600">
                    Student: <span className="text-slate-900 font-semibold">{selectedInvoice.students?.full_name}</span> (
                    {selectedInvoice.students?.student_id})
                  </div>
                  <div className="text-slate-600">
                    Remaining Balance:{" "}
                    <span className="text-amber-700 font-bold">
                      PKR{" "}
                      {(
                        Math.max(0, Number(selectedInvoice.amount_due) - Number(selectedInvoice.amount_paid))
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-700 font-medium">Amount Received (PKR) *</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="e.g. 15000"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Payment Method *</Label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#008DDA]"
                >
                  <option value="bank_transfer">Bank Transfer (Meezan / HBL / UBL)</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Transaction Reference / Slip #</Label>
                <Input
                  type="text"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  placeholder="e.g. TR-9823412 or Deposit Slip #41"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Payment Date *</Label>
                <Input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Notes / Remarks</Label>
                <Input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Optional payment notes"
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="bg-[#008DDA] hover:bg-[#0070b8] text-white text-xs font-medium"
                >
                  {isSubmittingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Monthly Dues Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#008DDA]" />
                Generate Monthly Dues
              </h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateDues} className="space-y-4 mt-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-slate-700">
                Generates fee invoices for all active student enrollments and monthly billing plans. Duplicate invoices for the same cycle are automatically skipped.
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Billing Cycle Month (YYYY-MM) *</Label>
                <Input
                  type="month"
                  required
                  value={generateForm.billingMonth}
                  onChange={(e) => setGenerateForm({ ...generateForm, billingMonth: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-700 font-medium">Standard Due Date *</Label>
                <Input
                  type="date"
                  required
                  value={generateForm.dueDate}
                  onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGenerateModal(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="bg-[#008DDA] hover:bg-[#0070b8] text-white text-xs font-medium"
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                  Run Batch Generation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Payment Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div id="receipt-print-area" className="bg-white text-slate-950 p-6 rounded-lg border border-slate-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-950">TECHBUILT OPEN SCHOOL</h2>
                  <p className="text-xs text-slate-500">Official Student Payment Receipt</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded">
                    {receiptData.receiptNumber}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">{receiptData.date}</div>
                </div>
              </div>

              {/* Student & Invoice Info */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Student</span>
                  <span className="font-bold text-sm text-slate-900">
                    {receiptData.invoice?.students?.full_name || "Enrolled Student"}
                  </span>
                  <span className="text-slate-500 block">ID: {receiptData.invoice?.students?.student_id || "—"}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Invoice Reference</span>
                  <span className="font-mono font-bold text-slate-900">{receiptData.invoice?.invoice_number}</span>
                  <span className="text-slate-500 block">Cycle: {receiptData.invoice?.billing_month || "Tuition"}</span>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="border border-slate-200 rounded-md overflow-hidden mb-4 text-xs">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-700 font-semibold">
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
                          <div className="text-slate-500 text-[10px]">Ref: {receiptData.transactionRef}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        PKR {Number(receiptData.amountPaid).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                Thank you for your payment. TBOS Academy &bull; techbuiltopenschool@gmail.com
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                Print Receipt
              </Button>
              <Button
                size="sm"
                onClick={() => setShowReceiptModal(false)}
                className="bg-[#008DDA] hover:bg-[#0070b8] text-white text-xs font-medium"
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
