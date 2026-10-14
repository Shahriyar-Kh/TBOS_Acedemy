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
  MessageSquare,
  Mail,
  Send,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Search,
  Loader2,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/communications")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Communications Hub") }),
  component: AdminCommunicationsPage,
});

function AdminCommunicationsPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [activeTab, setActiveTab] = useState<"email" | "whatsapp" | "logs">("email");
  const [logs, setLogs] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Email state
  const [emailAudience, setEmailAudience] = useState<"all_students" | "batch" | "fee_pending">("all_students");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // WhatsApp state
  const [waPhone, setWaPhone] = useState("");
  const [waName, setWaName] = useState("");
  const [waIntent, setWaIntent] = useState("fee_reminder");
  const [waMessage, setWaMessage] = useState(
    "Assalamu Alaikum {{name}}, this is a friendly reminder from TechBuilt Open School regarding your upcoming monthly fee due on {{date}}. Please feel free to reach out if you have any questions!"
  );

  const fetchCommunicationsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [commsRes, batchRes] = await Promise.all([
        fetch("/api/admin/communications?limit=50", { headers: getAuthHeader() }),
        fetch("/api/admin/batches?limit=100", { headers: getAuthHeader() }),
      ]);
      if (commsRes.ok) {
        const commsData = await commsRes.json();
        setLogs(commsData.logs || []);
        setTemplates(commsData.templates || []);
      }
      if (batchRes.ok) {
        const bData = await batchRes.json();
        setBatches(bData.batches || []);
      }
    } catch {
      toast.error("Failed to load communications history");
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchCommunicationsData();
    }
  }, [fetchCommunicationsData, admin]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId || t.name === templateId);
    if (tmpl) {
      setEmailSubject(tmpl.subject || "");
      setEmailBody(tmpl.body || "");
    }
  };

  // Send Email Broadcast
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Please provide both subject and message body");
      return;
    }
    setIsSendingEmail(true);
    try {
      // Fetch recipient list according to audience
      let recipients: Array<{ email: string; name: string }> = [];
      if (emailAudience === "batch" && selectedBatchId) {
        const batchRes = await fetch(`/api/admin/batches/${selectedBatchId}`, { headers: getAuthHeader() });
        if (batchRes.ok) {
          const bData = await batchRes.json();
          recipients = (bData.batch?.enrollments || [])
            .map((enr: any) => ({
              email: enr.students?.email,
              name: enr.students?.full_name,
            }))
            .filter((r: any) => Boolean(r.email));
        }
      } else {
        const stRes = await fetch("/api/admin/students?limit=200", { headers: getAuthHeader() });
        if (stRes.ok) {
          const stData = await stRes.json();
          recipients = (stData.students || [])
            .map((s: any) => ({ email: s.email, name: s.full_name }))
            .filter((r: any) => Boolean(r.email));
        }
      }

      if (recipients.length === 0) {
        toast.error("No valid recipients found with email addresses for this audience.");
        setIsSendingEmail(false);
        return;
      }

      const res = await fetch("/api/admin/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "send-email",
          recipients,
          subject: emailSubject,
          htmlBody: emailBody.replace(/\n/g, "<br/>"),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Broadcast sent successfully to ${data.count} recipients!`);
        setEmailSubject("");
        setEmailBody("");
        fetchCommunicationsData();
        setActiveTab("logs");
      } else {
        toast.error(data.error || "Failed to dispatch email broadcast");
      }
    } catch {
      toast.error("Network error sending broadcast");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Launch WhatsApp Link & Log
  const handleLaunchWhatsApp = async () => {
    if (!waPhone.trim()) {
      toast.error("Please enter recipient WhatsApp phone number");
      return;
    }

    const compiledMessage = waMessage
      .replace(/{{name}}/g, waName || "Student")
      .replace(/{{date}}/g, "10th of this month");

    try {
      const res = await fetch("/api/admin/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({
          action: "log-whatsapp",
          recipientPhone: waPhone,
          recipientName: waName || "Student",
          intent: waIntent,
          content: compiledMessage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.waUrl) {
        window.open(data.waUrl, "_blank", "noopener,noreferrer");
        toast.success("WhatsApp chat opened and logged!");
        fetchCommunicationsData();
      } else {
        toast.error(data.error || "Failed to generate WhatsApp link");
      }
    } catch {
      toast.error("Network error launching WhatsApp");
    }
  };

  return (
    <AdminLayout
      title="Communications & Reminders Hub"
      description="Send authenticated SMTP announcements, WhatsApp click-to-chat reminders, and track delivery logs."
      onRefresh={fetchCommunicationsData}
      isRefreshing={isLoading}
      actions={
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("email")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "email" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Email Broadcast
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "whatsapp" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            WhatsApp Reminders
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "logs" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Delivery Logs
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab 1: Email Broadcast */}
        {activeTab === "email" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-sky-600" />
                Compose SMTP Email Broadcast
              </h2>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Audience Group *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setEmailAudience("all_students")}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                        emailAudience === "all_students"
                          ? "border-sky-600 bg-sky-50 text-sky-900 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      All Enrolled Students
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailAudience("batch")}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                        emailAudience === "batch"
                          ? "border-sky-600 bg-sky-50 text-sky-900 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      Specific Batch Cohort
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailAudience("fee_pending")}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                        emailAudience === "fee_pending"
                          ? "border-sky-600 bg-sky-50 text-sky-900 font-bold"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      Fee Pending Students
                    </button>
                  </div>
                </div>

                {emailAudience === "batch" && (
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Select Target Batch *</Label>
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Select a batch...</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} {b.batch_code ? `(${b.batch_code})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Subject Line *</Label>
                  <Input
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Important Announcement: Upcoming Live Class Schedule"
                    className="mt-1 bg-white border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Email Message Body *</Label>
                  <textarea
                    rows={8}
                    required
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your email announcement here. You can use HTML or plain text."
                    className="w-full mt-1 p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSendingEmail}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-sm"
                  >
                    {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Send Authenticated Broadcast
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Templates & Guidelines */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Available Template Snippets</h3>
                <p className="text-xs text-slate-500 mb-3">Click any preset to populate your subject and message.</p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailSubject("TechBuilt Open School: Class Schedule & Google Meet Link");
                      setEmailBody(
                        "Dear Student,\n\nWe would like to remind you that your upcoming live online class is scheduled to begin at 07:00 PM PKT.\n\nPlease ensure you join 5 minutes early using your student portal or the direct class link.\n\nWarm regards,\nAcademic Operations Team\nTechBuilt Open School"
                      );
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-sky-400 text-xs text-slate-700 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 block">Class Schedule Reminder</span>
                    <span className="text-slate-500 text-[11px]">Notice with Google Meet details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmailSubject("TechBuilt Open School: Monthly Tuition Fee Notice");
                      setEmailBody(
                        "Dear Student,\n\nThis is a notification regarding your monthly tuition dues for the current academic cycle.\n\nPlease remit payment to our official account and upload or send your deposit slip for automated clearance.\n\nThank you for choosing TechBuilt Open School!\n\nFinance Department"
                      );
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-sky-400 text-xs text-slate-700 transition-colors"
                  >
                    <span className="font-semibold text-slate-900 block">Monthly Tuition Fee Notice</span>
                    <span className="text-slate-500 text-[11px]">Due date notification</span>
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-1.5 shadow-sm">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  SMTP Delivery Guarantee
                </div>
                <p className="text-emerald-700">
                  All outgoing emails are dispatched via your verified Google Workspace / SMTP credentials with TBOS
                  branding and official headers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: WhatsApp Reminders */}
        {activeTab === "whatsapp" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                WhatsApp Click-to-Chat Reminders
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Complies with official WhatsApp policies by preparing an authenticated click-to-chat URL (wa.me) and
                logging delivery securely.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Recipient Phone (with country code) *</Label>
                    <Input
                      required
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="+923001234567"
                      className="mt-1 bg-white border-slate-300 text-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-slate-700">Student Name</Label>
                    <Input
                      value={waName}
                      onChange={(e) => setWaName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      className="mt-1 bg-white border-slate-300 text-slate-900 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Reminder Intent</Label>
                  <select
                    value={waIntent}
                    onChange={(e) => setWaIntent(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="fee_reminder">Fee Payment Reminder</option>
                    <option value="class_reminder">Class Starting Soon</option>
                    <option value="demo_followup">Free Demo Follow-up</option>
                    <option value="welcome_message">Welcome & Orientation</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-slate-700">Message Content (Pre-filled)</Label>
                  <textarea
                    rows={6}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="w-full mt-1 p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Variables supported: &#123;&#123;name&#125;&#125;, &#123;&#123;date&#125;&#125;</p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={handleLaunchWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Open WhatsApp & Log Communication
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">WhatsApp Bubble Preview</h3>
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 font-sans leading-relaxed">
                  {waMessage
                    .replace(/{{name}}/g, waName || "Student")
                    .replace(/{{date}}/g, "10th of this month")}
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800 block mb-1">Audit Trail Guarantee:</span>
                Every click-to-chat action generates an immutable audit record in CRM logs to ensure student contact
                traceability.
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Delivery Logs */}
        {activeTab === "logs" && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center p-12 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin text-sky-600 mr-2" />
                Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center p-12 text-slate-400">
                <Clock className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-base font-semibold text-slate-700">No communication logs recorded yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Dispatched emails and WhatsApp reminders will be recorded here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] uppercase font-semibold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Subject / Intent</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Sent At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          {log.channel === "email" ? (
                            <Badge className="bg-sky-50 text-sky-700 border-sky-200 font-semibold">Email (SMTP)</Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">WhatsApp</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{log.recipient_name || "—"}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{log.recipient_email || log.recipient_phone}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-800 max-w-xs truncate">{log.subject || log.intent}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`font-semibold ${
                              log.status === "sent" || log.status === "delivered" || log.status === "prepared_link"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

