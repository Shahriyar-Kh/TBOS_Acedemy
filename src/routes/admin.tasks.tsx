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
  CheckSquare,
  PlusCircle,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Loader2,
  X,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tasks")({
  head: () => ({ meta: adminNoIndexMeta("TBOS Academy Operations Tasks") }),
  component: AdminTasksPage,
});

function AdminTasksPage() {
  const { admin, isLoading: authLoading, getAuthHeader } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !admin) {
      navigate({ to: "/admin/login" });
    }
  }, [admin, authLoading, navigate]);

  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Create Task Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hasError, setHasError] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterPriority !== "all") params.set("priority", filterPriority);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/tasks?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      } else {
        setHasError(true);
        toast.error("Failed to load operational tasks");
      }
    } catch {
      setHasError(true);
      toast.error("Network error loading tasks");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterPriority, getAuthHeader]);

  useEffect(() => {
    if (admin) {
      fetchTasks();
    }
  }, [fetchTasks, admin]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(taskForm),
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.success)) {
        toast.success("Task created successfully!");
        setShowAddModal(false);
        setTaskForm({
          title: "",
          description: "",
          priority: "medium",
          dueDate: new Date().toISOString().split("T")[0],
        });
        fetchTasks();
      } else {
        toast.error(data.error || "Failed to create task");
      }
    } catch {
      toast.error("Network error creating task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (task: any) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`/api/admin/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(newStatus === "completed" ? "Task marked complete!" : "Task reopened");
        fetchTasks();
      }
    } catch {
      toast.error("Error updating task status");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/admin/tasks/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (res.ok) {
        toast.success("Task deleted");
        fetchTasks();
      }
    } catch {
      toast.error("Error deleting task");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-semibold">Urgent</Badge>;
      case "high":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-semibold">High</Badge>;
      case "medium":
        return <Badge className="bg-sky-50 text-sky-700 border-sky-200 font-semibold">Medium</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200 font-semibold">Low</Badge>;
    }
  };

  return (
    <AdminLayout
      title="Operational Tasks & Follow-ups"
      description="Track team follow-ups, fee verification tasks, batch planning, and operational milestones."
      actions={
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-sm"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Status:</span>
            {["all", "pending", "in_progress", "completed"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={filterStatus === st ? "default" : "outline"}
                onClick={() => setFilterStatus(st)}
                className={
                  filterStatus === st
                    ? "bg-slate-900 hover:bg-slate-800 text-white capitalize shadow-sm"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 capitalize"
                }
              >
                {st.replace("_", " ")}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-white border border-slate-300 text-xs text-slate-800 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading tasks...
            </div>
          ) : hasError ? (
            <div className="text-center p-12 text-slate-500">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-rose-500" />
              <p className="text-base font-semibold text-slate-900">Failed to load tasks</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">An error occurred while fetching the operational task list.</p>
              <Button onClick={() => fetchTasks()} variant="outline" size="sm" className="border-slate-300">
                Retry
              </Button>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center p-12 text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-semibold text-slate-700">No tasks found</p>
              <p className="text-xs text-slate-500 mt-1">Keep operations running smoothly by creating your first task.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

                return (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isCompleted
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 bg-white hover:border-sky-500"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={`font-semibold text-sm text-slate-900 ${
                            isCompleted ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-slate-600 mt-0.5 line-clamp-1">{task.description}</div>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          {task.due_date && (
                            <span
                              className={`flex items-center gap-1 font-medium ${
                                isOverdue ? "text-rose-600 font-bold" : "text-slate-500"
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(task.due_date).toLocaleDateString()}
                              {isOverdue && " (Overdue)"}
                            </span>
                          )}
                          {task.assigned_to && <span>Assigned: {task.assigned_to}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getPriorityBadge(task.priority)}
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-sky-600" />
                Create New Task
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Task Title *</Label>
                <Input
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Follow up on fee deposit receipt #892"
                  className="mt-1 bg-white border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700">Description</Label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Additional context or checklist items..."
                  className="w-full mt-1 p-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Priority</Label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700">Due Date</Label>
                  <Input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="mt-1 bg-white border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-medium"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

