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

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
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
        toast.error("Failed to load operational tasks");
      }
    } catch {
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
      if (res.ok && data.success) {
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
        return <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30">Urgent</Badge>;
      case "high":
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">Medium</Badge>;
      default:
        return <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30">Low</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-cyan-400" />
              Operational Tasks & To-Dos
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track team follow-ups, fee verification tasks, batch planning, and operational milestones.
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            {["all", "pending", "in_progress", "completed"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={filterStatus === st ? "default" : "outline"}
                onClick={() => setFilterStatus(st)}
                className={
                  filterStatus === st
                    ? "bg-cyan-500 hover:bg-cyan-600 text-slate-950 capitalize"
                    : "border-slate-800 text-slate-300 capitalize"
                }
              >
                {st.replace("_", " ")}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center p-12 text-slate-400">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium text-slate-300">No tasks found</p>
              <p className="text-xs text-slate-400 mt-1">Keep operations running smoothly by creating your first task.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {tasks.map((task) => {
                const isCompleted = task.status === "completed";
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

                return (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-slate-950"
                            : "border-slate-700 bg-slate-950 hover:border-cyan-400"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={`font-medium text-sm text-white ${
                            isCompleted ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{task.description}</div>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                          {task.due_date && (
                            <span
                              className={`flex items-center gap-1 ${
                                isOverdue ? "text-rose-400 font-semibold" : "text-slate-400"
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(task.due_date).toLocaleDateString()}
                              {isOverdue && " (Overdue)"}
                            </span>
                          )}
                          {task.assigned_to && <span>Assigned to: {task.assigned_to}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {getPriorityBadge(task.priority)}
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-cyan-400" />
                Create New Task
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-4">
              <div>
                <Label className="text-xs text-slate-300">Task Title *</Label>
                <Input
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Follow up on fee deposit receipt #892"
                  className="mt-1 bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-300">Description</Label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Additional context or checklist items..."
                  className="w-full mt-1 p-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-300">Priority</Label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs text-slate-300">Due Date</Label>
                  <Input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="mt-1 bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="border-slate-800 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium"
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

