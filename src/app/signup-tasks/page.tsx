"use client";

/**
 * Signup Tasks Page - Deadline tracking for camp enrollments
 * Shows upcoming signup deadlines grouped by urgency
 */

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  Snackbar,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  Radio,
  Link as MuiLink,
} from "@mui/material";
import {
  Warning,
  Schedule,
  CalendarMonth,
  CheckCircle,
  Download,
  Undo,
  OpenInNew,
} from "@mui/icons-material";
import Link from "next/link";
import type { ScheduledSession, SessionStatus, UrgencyLevel, SignupTask } from "@/types/summer";
import type { Camp } from "@/types/camp";

const SUMMER_ID = "summer-2026";

// Urgency configuration
const URGENCY_CONFIG: Record<UrgencyLevel, { icon: React.ReactNode; color: string; label: string }> = {
  overdue: { icon: <Warning color="error" />, color: "#f44336", label: "OVERDUE" },
  "this-week": { icon: <Schedule color="warning" />, color: "#ff9800", label: "THIS WEEK" },
  "this-month": { icon: <CalendarMonth sx={{ color: "#ffc107" }} />, color: "#ffc107", label: "THIS MONTH" },
  later: { icon: <CheckCircle color="success" />, color: "#4caf50", label: "LATER" },
};

// Calculate urgency level based on signup date
function getUrgency(signupDate: string): UrgencyLevel {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const signup = new Date(signupDate + "T00:00:00");
  
  const diffDays = Math.ceil((signup.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "overdue";
  if (diffDays <= 7) return "this-week";
  if (diffDays <= 30) return "this-month";
  return "later";
}

// Format relative date
function getRelativeDate(signupDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const signup = new Date(signupDate + "T00:00:00");
  
  const diffDays = Math.ceil((signup.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === -1) return "yesterday";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  return `in ${diffDays} days`;
}

// Format date for display
function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Generate ICS content
function generateICS(tasks: SignupTask[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Summer Camp Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  
  for (const task of tasks) {
    if (task.complete) continue;
    
    const signupDate = task.signupDate.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${task.id}@summercampplanner`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${signupDate}`,
      `DTEND;VALUE=DATE:${signupDate}`,
      `SUMMARY:Signup: ${task.campName}`,
      `DESCRIPTION:Camp session: ${task.sessionStartDate} - ${task.sessionEndDate}${task.url ? `\\nWebsite: ${task.url}` : ""}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${task.campName} signup opens tomorrow!`,
      "END:VALARM",
      "END:VEVENT"
    );
  }
  
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export default function SignupTasksPage() {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  
  // Complete task dialog
  const [completeDialog, setCompleteDialog] = useState<{
    open: boolean;
    task: SignupTask | null;
    updateStatus: boolean;
  }>({ open: false, task: null, updateStatus: true });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, campsRes] = await Promise.all([
        fetch(`/api/summers/${SUMMER_ID}/sessions`),
        fetch("/api/camps/list"),
      ]);
      
      if (!sessionsRes.ok || !campsRes.ok) {
        throw new Error("Failed to load data");
      }
      
      const [sessionsData, campsData] = await Promise.all([
        sessionsRes.json(),
        campsRes.json(),
      ]);
      
      setSessions(sessionsData.sessions || []);
      setCamps(campsData.camps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build tasks from sessions + camps
  const tasks: SignupTask[] = [];
  for (const session of sessions) {
    const camp = camps.find(c => c.id === session.campId);
    if (!camp?.signupDate) continue;
    
    tasks.push({
      id: `task-${session.id}`,
      campId: session.campId,
      campName: camp.name,
      sessionId: session.id,
      signupDate: camp.signupDate,
      sessionStartDate: session.startDate,
      sessionEndDate: session.endDate,
      sessionStatus: session.status,
      complete: session.signupTaskComplete,
      url: camp.url,
      notes: camp.notes,
    });
  }

  // Sort by signup date
  tasks.sort((a, b) => a.signupDate.localeCompare(b.signupDate));

  // Group by urgency
  const groupedTasks: Record<UrgencyLevel, SignupTask[]> = {
    overdue: [],
    "this-week": [],
    "this-month": [],
    later: [],
  };

  for (const task of tasks) {
    if (task.complete && !showCompleted) continue;
    const urgency = getUrgency(task.signupDate);
    groupedTasks[urgency].push(task);
  }

  const completedTasks = tasks.filter(t => t.complete);
  const incompleteTasks = tasks.filter(t => !t.complete);
  const overdueTasks = tasks.filter(t => !t.complete && getUrgency(t.signupDate) === "overdue");

  // Handle mark complete
  const handleMarkComplete = async () => {
    if (!completeDialog.task) return;
    
    try {
      const updates: Record<string, unknown> = { signupTaskComplete: true };
      if (completeDialog.updateStatus) {
        updates.status = "confirmed";
      }
      
      const res = await fetch(`/api/summers/${SUMMER_ID}/sessions/${completeDialog.task.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) throw new Error("Failed to update session");
      
      setSnackbar({ 
        open: true, 
        message: `${completeDialog.task.campName} marked complete${completeDialog.updateStatus ? " (confirmed)" : ""}`, 
        severity: "success" 
      });
      setCompleteDialog({ open: false, task: null, updateStatus: true });
      loadData();
    } catch {
      setSnackbar({ open: true, message: "Failed to update task", severity: "error" });
    }
  };

  // Handle undo complete
  const handleUndo = async (task: SignupTask) => {
    try {
      const res = await fetch(`/api/summers/${SUMMER_ID}/sessions/${task.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupTaskComplete: false }),
      });
      
      if (!res.ok) throw new Error("Failed to update session");
      
      setSnackbar({ open: true, message: `${task.campName} task reopened`, severity: "success" });
      loadData();
    } catch {
      setSnackbar({ open: true, message: "Failed to update task", severity: "error" });
    }
  };

  // Handle ICS export
  const handleExportICS = () => {
    const icsContent = generateICS(tasks);
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "signup-reminders.ics";
    a.click();
    URL.revokeObjectURL(url);
    
    setSnackbar({ 
      open: true, 
      message: `signup-reminders.ics downloaded (${incompleteTasks.length} events)`, 
      severity: "success" 
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Signup Tasks
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 48, color: "success.main", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            No upcoming signup deadlines
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add camps to your Summer Plan to track their signup dates automatically.
          </Typography>
          <Button
            component={Link}
            href="/camps"
            variant="contained"
          >
            Browse Camp Catalog
          </Button>
        </Paper>
      </Box>
    );
  }

  // All complete state
  if (incompleteTasks.length === 0 && completedTasks.length > 0 && !showCompleted) {
    return (
      <Box>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Signup Tasks
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Box sx={{ fontSize: 48, mb: 2 }}>🎉</Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            All caught up!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You&apos;ve completed all your signup tasks.
          </Typography>
          <Button
            component={Link}
            href="/plan"
            variant="contained"
            sx={{ mr: 2 }}
          >
            View Summer Plan
          </Button>
          <FormControlLabel
            control={
              <Checkbox 
                checked={showCompleted} 
                onChange={(e) => setShowCompleted(e.target.checked)} 
              />
            }
            label="Show completed tasks"
          />
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Signup Tasks
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <FormControlLabel
          control={
            <Checkbox 
              checked={showCompleted} 
              onChange={(e) => setShowCompleted(e.target.checked)} 
            />
          }
          label="Show completed"
        />
        
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExportICS}
          disabled={incompleteTasks.length === 0}
        >
          Export .ics
        </Button>
      </Paper>

      {/* Task groups */}
      <Paper sx={{ p: 2 }}>
        {/* Completed tasks (if showing) */}
        {showCompleted && completedTasks.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CheckCircle color="success" />
              <Typography variant="subtitle1" fontWeight="medium" color="success.main">
                COMPLETED
              </Typography>
            </Box>
            
            {completedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onMarkDone={() => {}} 
                onUndo={() => handleUndo(task)}
                showUndo
              />
            ))}
          </Box>
        )}

        {/* Urgency groups */}
        {(["overdue", "this-week", "this-month", "later"] as UrgencyLevel[]).map(urgency => {
          const urgencyTasks = groupedTasks[urgency].filter(t => !t.complete);
          if (urgencyTasks.length === 0) return null;
          
          const config = URGENCY_CONFIG[urgency];
          
          return (
            <Box key={urgency} sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                {config.icon}
                <Typography 
                  variant="subtitle1" 
                  fontWeight="medium" 
                  sx={{ color: config.color }}
                >
                  {config.label}
                </Typography>
              </Box>
              
              {urgencyTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onMarkDone={() => setCompleteDialog({ open: true, task, updateStatus: true })}
                  onUndo={() => {}}
                />
              ))}
            </Box>
          );
        })}

        {/* Summary */}
        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} • {overdueTasks.length} overdue
            {incompleteTasks.length > 0 && ` • Next: ${incompleteTasks.filter(t => getUrgency(t.signupDate) !== "overdue")[0]?.campName || "none"}`}
          </Typography>
        </Box>
      </Paper>

      {/* Mark Complete Dialog */}
      <Dialog 
        open={completeDialog.open} 
        onClose={() => setCompleteDialog({ open: false, task: null, updateStatus: true })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckCircle color="success" />
          Mark signup as complete?
        </DialogTitle>
        <DialogContent>
          {completeDialog.task && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                &quot;{completeDialog.task.campName}&quot;
              </Typography>
              
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                This will:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 24 }}>
                <li><Typography variant="body2">Mark the signup task as done</Typography></li>
                {completeDialog.updateStatus && (
                  <li><Typography variant="body2">Update session status to &quot;Confirmed&quot;</Typography></li>
                )}
              </ul>
              
              <FormControl sx={{ mt: 2 }}>
                <RadioGroup
                  value={completeDialog.updateStatus ? "confirmed" : "planned"}
                  onChange={(e) => setCompleteDialog(prev => ({ 
                    ...prev, 
                    updateStatus: e.target.value === "confirmed" 
                  }))}
                >
                  <FormControlLabel 
                    value="planned" 
                    control={<Radio />} 
                    label="Keep as 'Planned' - I signed up but not confirmed yet" 
                  />
                  <FormControlLabel 
                    value="confirmed" 
                    control={<Radio />} 
                    label="Mark as 'Confirmed' - Enrollment confirmed" 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialog({ open: false, task: null, updateStatus: true })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleMarkComplete}>
            Complete Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Task Card Component
function TaskCard({ 
  task, 
  onMarkDone, 
  onUndo,
  showUndo = false 
}: { 
  task: SignupTask; 
  onMarkDone: () => void;
  onUndo: () => void;
  showUndo?: boolean;
}) {
  const urgency = getUrgency(task.signupDate);
  
  return (
    <Box 
      sx={{ 
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 2,
        mb: 1,
        opacity: task.complete ? 0.7 : 1,
        bgcolor: task.complete ? "grey.50" : "background.paper",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Checkbox 
              checked={task.complete}
              onChange={task.complete ? onUndo : onMarkDone}
              disabled={false}
              sx={{ p: 0, mr: 0.5 }}
            />
            <Typography 
              variant="subtitle1" 
              fontWeight="medium"
              sx={{ textDecoration: task.complete ? "line-through" : "none" }}
            >
              {task.campName}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            {task.complete 
              ? `Done ${formatDate(task.signupDate)}` 
              : `Signup ${urgency === "overdue" ? "was" : "opens"} ${formatFullDate(task.signupDate)} (${getRelativeDate(task.signupDate)})`
            }
          </Typography>
          
          <Box sx={{ ml: 4, display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary" component="span">
              Session: {formatDate(task.sessionStartDate)} - {formatDate(task.sessionEndDate)}
            </Typography>
            <Chip 
              label={task.sessionStatus} 
              size="small" 
              sx={{ 
                ml: 1, 
                height: 18, 
                fontSize: "0.7rem",
                textTransform: "capitalize",
              }} 
            />
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {!task.complete && (
            <Chip 
              icon={<Schedule sx={{ fontSize: 14 }} />}
              label={formatDate(task.signupDate)}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </Box>
      
      <Box sx={{ display: "flex", gap: 1, mt: 1.5, ml: 4 }}>
        {showUndo && task.complete && (
          <Button size="small" startIcon={<Undo />} onClick={onUndo}>
            Undo
          </Button>
        )}
        {!task.complete && (
          <Button size="small" variant="outlined" onClick={onMarkDone}>
            Mark Done
          </Button>
        )}
        <Button 
          component={Link}
          href="/camps"
          size="small"
        >
          View Camp
        </Button>
        {task.url && (
          <MuiLink 
            href={task.url} 
            target="_blank"
            sx={{ display: "flex", alignItems: "center", fontSize: "0.8rem" }}
          >
            Website <OpenInNew sx={{ fontSize: 14, ml: 0.5 }} />
          </MuiLink>
        )}
      </Box>
    </Box>
  );
}
