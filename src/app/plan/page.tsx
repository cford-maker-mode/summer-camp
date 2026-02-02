"use client";

/**
 * Summer Plan Page - Month calendar view
 * Shows family events and camp sessions in a visual calendar
 */

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Snackbar,
  Chip,
  CircularProgress,
  Popover,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Add,
  Event as EventIcon,
  DirectionsRun,
  Delete,
  Edit,
  Close,
  LocationOn,
  AttachMoney,
  Schedule,
  Link as LinkIcon,
  Person,
  NightsStay,
} from "@mui/icons-material";
import type { FamilyEvent, ScheduledSession, EventType, SessionStatus } from "@/types/summer";
import type { Camp } from "@/types/camp";

// Color palette for events and sessions
const COLORS = {
  vacation: { bg: "#e1bee7", border: "#9c27b0", text: "#4a148c" },
  blocked: { bg: "#ffccbc", border: "#ff5722", text: "#bf360c" },
  other: { bg: "#b3e5fc", border: "#03a9f4", text: "#01579b" },
  planned: { bg: "#e0e0e0", border: "#9e9e9e", text: "#424242" },
  confirmed: { bg: "#c8e6c9", border: "#4caf50", text: "#1b5e20" },
  waitlisted: { bg: "#fff9c4", border: "#ffc107", text: "#ff6f00" },
};

// Generate calendar days for a month
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days: Date[] = [];
  const current = new Date(startDate);
  
  // Generate 6 weeks of days
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return { days, firstDay, lastDay };
}

// Check if a date falls within a range
function isInRange(date: Date, startDate: string, endDate: string): boolean {
  const d = date.toISOString().split("T")[0];
  return d >= startDate && d <= endDate;
}

// Format date for display
function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SUMMER_ID = "summer-2026";

export default function SummerPlanPage() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  
  // Dialogs
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [detailPopover, setDetailPopover] = useState<{
    anchorEl: HTMLElement | null;
    item: (FamilyEvent & { type: "event" }) | (ScheduledSession & { type: "session"; camp: Camp | null }) | null;
  }>({ anchorEl: null, item: null });
  const [dateMenu, setDateMenu] = useState<{
    anchorEl: HTMLElement | null;
    date: string | null;
  }>({ anchorEl: null, date: null });
  
  // Children state (persisted to localStorage)
  const [children, setChildren] = useState<string[]>([]);
  const [newChildName, setNewChildName] = useState("");
  const [showAddChild, setShowAddChild] = useState(false);

  // Form state
  const [eventForm, setEventForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    eventType: "vacation" as EventType,
    notes: "",
  });
  const [sessionForm, setSessionForm] = useState({
    campId: "",
    startDate: "",
    endDate: "",
    status: "planned" as SessionStatus,
    childName: "",
    notes: "",
  });

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, sessionsRes, campsRes] = await Promise.all([
        fetch(`/api/summers/${SUMMER_ID}/events`),
        fetch(`/api/summers/${SUMMER_ID}/sessions`),
        fetch("/api/camps/list"),
      ]);
      
      if (!eventsRes.ok || !sessionsRes.ok || !campsRes.ok) {
        throw new Error("Failed to load data");
      }
      
      const [eventsData, sessionsData, campsData] = await Promise.all([
        eventsRes.json(),
        sessionsRes.json(),
        campsRes.json(),
      ]);
      
      setEvents(eventsData.events || []);
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

  // Load children from localStorage
  useEffect(() => {
    const savedChildren = localStorage.getItem("summerCampChildren");
    if (savedChildren) {
      setChildren(JSON.parse(savedChildren));
    }
  }, []);

  // Save children to localStorage when updated
  const addChild = (name: string) => {
    if (name.trim() && !children.includes(name.trim())) {
      const updated = [...children, name.trim()];
      setChildren(updated);
      localStorage.setItem("summerCampChildren", JSON.stringify(updated));
    }
  };
  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Event handlers
  const handleAddEvent = async () => {
    try {
      const res = await fetch(`/api/summers/${SUMMER_ID}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm),
      });
      
      if (!res.ok) throw new Error("Failed to create event");
      
      setSnackbar({ open: true, message: `"${eventForm.name}" added to Summer Plan`, severity: "success" });
      setEventDialogOpen(false);
      setEventForm({ name: "", startDate: "", endDate: "", eventType: "vacation", notes: "" });
      loadData();
    } catch {
      setSnackbar({ open: true, message: "Failed to create event", severity: "error" });
    }
  };

  const handleAddSession = async () => {
    try {
      const res = await fetch(`/api/summers/${SUMMER_ID}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionForm),
      });
      
      if (!res.ok) throw new Error("Failed to create session");
      
      const camp = camps.find(c => c.id === sessionForm.campId);
      setSnackbar({ 
        open: true, 
        message: `${camp?.name || "Camp"} added: ${formatDate(sessionForm.startDate)} - ${formatDate(sessionForm.endDate)}`, 
        severity: "success" 
      });
      setSessionDialogOpen(false);
      setSessionForm({ campId: "", startDate: "", endDate: "", status: "planned", childName: "", notes: "" });
      setShowAddChild(false);
      setNewChildName("");
      loadData();
    } catch {
      setSnackbar({ open: true, message: "Failed to create session", severity: "error" });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/summers/${SUMMER_ID}/events/${eventId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete event");
      
      setSnackbar({ open: true, message: "Event removed", severity: "success" });
      setDetailPopover({ anchorEl: null, item: null });
      loadData();
    } catch {
      setSnackbar({ open: true, message: "Failed to delete event", severity: "error" });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/summers/${SUMMER_ID}/sessions/${sessionId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) throw new Error("Failed to delete session");
      
      setSnackbar({ open: true, message: "Session removed from plan", severity: "success" });
      setDetailPopover({ anchorEl: null, item: null });
      loadData();
    } catch {
      setSnackbar({ open: true, message: "Failed to delete session", severity: "error" });
    }
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: SessionStatus) => {
    try {
      const res = await fetch(`/api/summers/${SUMMER_ID}/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error("Failed to update session");
      
      setSnackbar({ open: true, message: `Status changed to ${status}`, severity: "success" });
      loadData();
    } catch {
      setSnackbar({ open: true, message: "Failed to update session", severity: "error" });
    }
  };

  // Open dialogs from date click
  const handleDateClick = (e: React.MouseEvent<HTMLElement>, date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    setDateMenu({ anchorEl: e.currentTarget, date: dateStr });
  };

  const handleDateMenuClose = () => {
    setDateMenu({ anchorEl: null, date: null });
  };

  const handleAddEventFromDate = () => {
    if (dateMenu.date) {
      setEventForm(prev => ({ ...prev, startDate: dateMenu.date!, endDate: dateMenu.date! }));
      setEventDialogOpen(true);
    }
    handleDateMenuClose();
  };

  const handleAddSessionFromDate = () => {
    if (dateMenu.date) {
      // Default to 5-day session (Mon-Fri)
      const start = new Date(dateMenu.date + "T00:00:00");
      const end = new Date(start);
      end.setDate(end.getDate() + 4);
      setSessionForm(prev => ({ 
        ...prev, 
        startDate: dateMenu.date!, 
        endDate: end.toISOString().split("T")[0] 
      }));
      setSessionDialogOpen(true);
    }
    handleDateMenuClose();
  };

  // Render calendar
  const { days, firstDay, lastDay } = getCalendarDays(currentYear, currentMonth);
  
  // Find events/sessions for each day
  const getItemsForDay = (date: Date) => {
    const items: Array<{
      id: string;
      name: string;
      type: "event" | "session";
      color: typeof COLORS.vacation;
      status?: SessionStatus;
      isStart: boolean;
      isEnd: boolean;
    }> = [];
    
    for (const event of events) {
      if (isInRange(date, event.startDate, event.endDate)) {
        const color = COLORS[event.eventType] || COLORS.other;
        items.push({
          id: event.id,
          name: event.name,
          type: "event",
          color,
          isStart: date.toISOString().split("T")[0] === event.startDate,
          isEnd: date.toISOString().split("T")[0] === event.endDate,
        });
      }
    }
    
    for (const session of sessions) {
      if (isInRange(date, session.startDate, session.endDate)) {
        const camp = camps.find(c => c.id === session.campId);
        const color = COLORS[session.status] || COLORS.planned;
        items.push({
          id: session.id,
          name: camp?.name || "Unknown Camp",
          type: "session",
          color,
          status: session.status,
          isStart: date.toISOString().split("T")[0] === session.startDate,
          isEnd: date.toISOString().split("T")[0] === session.endDate,
        });
      }
    }
    
    return items;
  };

  // Handle item click
  const handleItemClick = (e: React.MouseEvent<HTMLElement>, itemId: string, type: "event" | "session") => {
    e.stopPropagation();
    
    if (type === "event") {
      const event = events.find(ev => ev.id === itemId);
      if (event) {
        setDetailPopover({ anchorEl: e.currentTarget, item: { ...event, type: "event" } });
      }
    } else {
      const session = sessions.find(s => s.id === itemId);
      const camp = camps.find(c => c.id === session?.campId) || null;
      if (session) {
        setDetailPopover({ 
          anchorEl: e.currentTarget, 
          item: { ...session, type: "session", camp } 
        });
      }
    }
  };

  // Summary counts
  const monthSessions = sessions.filter(s => {
    const start = new Date(s.startDate);
    return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
  });
  const monthEvents = events.filter(e => {
    const start = new Date(e.startDate);
    return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
  });

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

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Summer Plan
      </Typography>

      {/* Month navigation */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={prevMonth}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 150, textAlign: "center" }}>
              {MONTHS[currentMonth]} {currentYear}
            </Typography>
            <IconButton onClick={nextMonth}>
              <ChevronRight />
            </IconButton>
          </Box>
          
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EventIcon />}
              onClick={() => setEventDialogOpen(true)}
            >
              Add Family Event
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setSessionDialogOpen(true)}
            >
              Add Session
            </Button>
          </Box>
        </Box>

        {/* Calendar grid */}
        <Box sx={{ 
          display: "grid", 
          gridTemplateColumns: "40px repeat(7, 1fr)",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
        }}>
          {/* Header row */}
          <Box sx={{ bgcolor: "grey.100", p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary">Wk</Typography>
          </Box>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <Box key={day} sx={{ 
              bgcolor: "grey.100", 
              p: 1, 
              textAlign: "center",
              borderBottom: "1px solid",
              borderLeft: "1px solid",
              borderColor: "divider",
            }}>
              <Typography variant="caption" fontWeight="medium">{day}</Typography>
            </Box>
          ))}

          {/* Calendar days */}
          {Array.from({ length: 6 }, (_, weekIndex) => {
            const weekDays = days.slice(weekIndex * 7, weekIndex * 7 + 7);
            const weekNum = getWeekNumber(weekDays[0]);
            
            return (
              <Box key={weekIndex} sx={{ display: "contents" }}>
                {/* Week number */}
                <Box sx={{ 
                  bgcolor: "grey.50", 
                  p: 0.5, 
                  display: "flex", 
                  alignItems: "flex-start", 
                  justifyContent: "center",
                  borderBottom: weekIndex < 5 ? "1px solid" : "none",
                  borderColor: "divider",
                }}>
                  <Typography variant="caption" color="text.secondary">{weekNum}</Typography>
                </Box>
                
                {/* Days */}
                {weekDays.map((date, dayIndex) => {
                  const isCurrentMonth = date.getMonth() === currentMonth;
                  const isToday = date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0];
                  const items = getItemsForDay(date);
                  
                  return (
                    <Box
                      key={dayIndex}
                      onClick={(e) => items.length === 0 && handleDateClick(e, date)}
                      sx={{
                        minHeight: 80,
                        p: 0.5,
                        bgcolor: isCurrentMonth ? "background.paper" : "grey.50",
                        borderBottom: weekIndex < 5 ? "1px solid" : "none",
                        borderLeft: "1px solid",
                        borderColor: "divider",
                        cursor: items.length === 0 ? "pointer" : "default",
                        "&:hover": items.length === 0 ? { bgcolor: "action.hover" } : {},
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isToday ? "bold" : "normal",
                          bgcolor: isToday ? "primary.main" : "transparent",
                          color: isToday ? "white" : isCurrentMonth ? "text.primary" : "text.disabled",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 0.5,
                        }}
                      >
                        {date.getDate()}
                      </Typography>
                      
                      {/* Event/session bars */}
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        {items.slice(0, 3).map((item) => (
                          <Box
                            key={item.id}
                            onClick={(e) => handleItemClick(e, item.id, item.type)}
                            sx={{
                              bgcolor: item.color.bg,
                              borderLeft: item.isStart ? `3px solid ${item.color.border}` : "none",
                              borderRight: item.isEnd ? `3px solid ${item.color.border}` : "none",
                              px: 0.5,
                              py: 0.25,
                              borderRadius: item.isStart && item.isEnd ? 1 : item.isStart ? "4px 0 0 4px" : item.isEnd ? "0 4px 4px 0" : 0,
                              cursor: "pointer",
                              overflow: "hidden",
                              "&:hover": { opacity: 0.8 },
                            }}
                          >
                            {item.isStart && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: item.color.text,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "block",
                                  fontSize: "0.65rem",
                                  lineHeight: 1.2,
                                }}
                              >
                                {item.name}
                              </Typography>
                            )}
                          </Box>
                        ))}
                        {items.length > 3 && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                            +{items.length - 3} more
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            );
          })}
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary">Legend:</Typography>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Box sx={{ width: 16, height: 12, bgcolor: COLORS.vacation.bg, borderRadius: 0.5 }} />
            <Typography variant="caption">Vacation</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Box sx={{ width: 16, height: 12, bgcolor: COLORS.planned.bg, borderRadius: 0.5 }} />
            <Typography variant="caption">Planned</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Box sx={{ width: 16, height: 12, bgcolor: COLORS.confirmed.bg, borderRadius: 0.5 }} />
            <Typography variant="caption">Confirmed</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Box sx={{ width: 16, height: 12, bgcolor: COLORS.waitlisted.bg, borderRadius: 0.5 }} />
            <Typography variant="caption">Waitlisted</Typography>
          </Box>
        </Box>

        {/* Summary */}
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">
            {MONTHS[currentMonth]} Summary: {monthSessions.length} camp session{monthSessions.length !== 1 ? "s" : ""} • {monthEvents.length} event{monthEvents.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Paper>

      {/* Date click menu */}
      <Menu
        anchorEl={dateMenu.anchorEl}
        open={Boolean(dateMenu.anchorEl)}
        onClose={handleDateMenuClose}
      >
        <MenuItem onClick={handleAddEventFromDate}>
          <ListItemIcon><EventIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Family Event</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddSessionFromDate}>
          <ListItemIcon><DirectionsRun fontSize="small" /></ListItemIcon>
          <ListItemText>Camp Session</ListItemText>
        </MenuItem>
      </Menu>

      {/* Detail popover */}
      <Popover
        open={Boolean(detailPopover.anchorEl)}
        anchorEl={detailPopover.anchorEl}
        onClose={() => setDetailPopover({ anchorEl: null, item: null })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {detailPopover.item && (
          <Box sx={{ p: 2, minWidth: 320, maxWidth: 400 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {detailPopover.item.type === "event" 
                  ? (detailPopover.item as FamilyEvent).name 
                  : (detailPopover.item as ScheduledSession & { camp: Camp | null }).camp?.name || "Unknown Camp"}
              </Typography>
              <IconButton size="small" onClick={() => setDetailPopover({ anchorEl: null, item: null })}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {formatDate(detailPopover.item.startDate)} - {formatDate(detailPopover.item.endDate)}
            </Typography>
            
            {detailPopover.item.type === "event" && (
              <Chip 
                label={(detailPopover.item as FamilyEvent).eventType} 
                size="small" 
                sx={{ mb: 2, textTransform: "capitalize" }} 
              />
            )}
            
            {detailPopover.item.type === "session" && (() => {
              const sessionItem = detailPopover.item as ScheduledSession & { camp: Camp | null };
              const camp = sessionItem.camp;
              
              const formatCost = () => {
                if (!camp?.cost) return null;
                const per = camp.costPer || "week";
                if (camp.costMax && camp.costMax !== camp.cost) {
                  return `$${camp.cost}-$${camp.costMax}/${per}`;
                }
                return `$${camp.cost}/${per}`;
              };

              const formatEligibility = () => {
                const parts: string[] = [];
                if (camp?.ageMin || camp?.ageMax) {
                  if (camp.ageMin && camp.ageMax) parts.push(`Ages ${camp.ageMin}-${camp.ageMax}`);
                  else if (camp.ageMin) parts.push(`Ages ${camp.ageMin}+`);
                  else parts.push(`Up to age ${camp.ageMax}`);
                }
                if (camp?.gradeMin !== undefined || camp?.gradeMax !== undefined) {
                  const formatGrade = (g: number) => g === 0 ? "K" : g.toString();
                  if (camp.gradeMin !== undefined && camp.gradeMax !== undefined) {
                    if (camp.gradeMin === camp.gradeMax) parts.push(`Grade ${formatGrade(camp.gradeMin)}`);
                    else parts.push(`Grades ${formatGrade(camp.gradeMin)}-${formatGrade(camp.gradeMax)}`);
                  } else if (camp.gradeMin !== undefined) {
                    parts.push(`Grade ${formatGrade(camp.gradeMin)}+`);
                  } else {
                    parts.push(`Up to grade ${formatGrade(camp.gradeMax!)}`);
                  }
                }
                return parts.length > 0 ? parts.join(" • ") : null;
              };

              const formatTime = () => {
                if (camp?.overnight) return "Overnight";
                if (camp?.dailyStartTime && camp?.dailyEndTime) {
                  const formatT = (t: string) => {
                    const [h, m] = t.split(":");
                    const hour = parseInt(h);
                    const ampm = hour >= 12 ? "PM" : "AM";
                    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    return `${h12}:${m} ${ampm}`;
                  };
                  return `${formatT(camp.dailyStartTime)} - ${formatT(camp.dailyEndTime)}`;
                }
                return null;
              };

              return (
                <>
                  {/* Camp Details */}
                  <Box sx={{ mb: 2 }}>
                    {camp?.location && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">{camp.location}</Typography>
                      </Box>
                    )}
                    {camp?.address && !camp?.location && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2">{camp.address}</Typography>
                      </Box>
                    )}
                    {formatCost() && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <AttachMoney fontSize="small" color="action" />
                        <Typography variant="body2">{formatCost()}</Typography>
                      </Box>
                    )}
                    {formatEligibility() && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Person fontSize="small" color="action" />
                        <Typography variant="body2">{formatEligibility()}</Typography>
                      </Box>
                    )}
                    {formatTime() && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        {camp?.overnight ? <NightsStay fontSize="small" color="action" /> : <Schedule fontSize="small" color="action" />}
                        <Typography variant="body2">{formatTime()}</Typography>
                      </Box>
                    )}
                    {camp?.url && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <LinkIcon fontSize="small" color="action" />
                        <Typography 
                          variant="body2" 
                          component="a" 
                          href={camp.url} 
                          target="_blank" 
                          rel="noopener"
                          sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                          {new URL(camp.url).hostname}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Benefits/Tags */}
                  {camp?.benefits && camp.benefits.length > 0 && (
                    <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {camp.benefits.map((benefit, i) => (
                        <Chip key={i} label={benefit} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}

                  {/* Status Selector */}
                  <Box sx={{ mb: 1 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={sessionItem.status}
                        label="Status"
                        onChange={(e) => handleUpdateSessionStatus(
                          detailPopover.item!.id, 
                          e.target.value as SessionStatus
                        )}
                      >
                        <MenuItem value="planned">Planned</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="waitlisted">Waitlisted</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </>
              );
            })()}
            
            {detailPopover.item.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: "italic" }}>
                {detailPopover.item.notes}
              </Typography>
            )}
            
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={() => {
                  if (detailPopover.item?.type === "event") {
                    handleDeleteEvent(detailPopover.item.id);
                  } else if (detailPopover.item?.type === "session") {
                    handleDeleteSession(detailPopover.item.id);
                  }
                }}
              >
                Remove
              </Button>
            </Box>
          </Box>
        )}
      </Popover>

      {/* Add Family Event Dialog */}
      <Dialog 
        open={eventDialogOpen} 
        onClose={() => setEventDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Family Event</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Event Name"
              value={eventForm.name}
              onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
              required
              fullWidth
            />
            
            <FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Type</Typography>
              <RadioGroup
                row
                value={eventForm.eventType}
                onChange={(e) => setEventForm(prev => ({ ...prev, eventType: e.target.value as EventType }))}
              >
                <FormControlLabel value="vacation" control={<Radio />} label="Vacation" />
                <FormControlLabel value="blocked" control={<Radio />} label="Blocked Time" />
                <FormControlLabel value="other" control={<Radio />} label="Other" />
              </RadioGroup>
            </FormControl>
            
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={eventForm.startDate}
                onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End Date"
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            
            <TextField
              label="Notes (optional)"
              value={eventForm.notes}
              onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleAddEvent}
            disabled={!eventForm.name || !eventForm.startDate || !eventForm.endDate}
          >
            Save Event
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Camp Session Dialog */}
      <Dialog 
        open={sessionDialogOpen} 
        onClose={() => {
          setSessionDialogOpen(false);
          setShowAddChild(false);
          setNewChildName("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Camp Session</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Camp</InputLabel>
              <Select
                value={sessionForm.campId}
                label="Select Camp"
                onChange={(e) => setSessionForm(prev => ({ ...prev, campId: e.target.value }))}
              >
                {camps.map(camp => (
                  <MenuItem key={camp.id} value={camp.id}>
                    <Box>
                      <Typography>{camp.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {camp.location} {camp.cost ? `• $${camp.cost}/${camp.costPer || "session"}` : ""}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Child selector */}
            <FormControl fullWidth>
              <InputLabel>Child (optional)</InputLabel>
              <Select
                value={sessionForm.childName}
                label="Child (optional)"
                onChange={(e) => {
                  if (e.target.value === "__add_new__") {
                    setShowAddChild(true);
                  } else {
                    setSessionForm(prev => ({ ...prev, childName: e.target.value }));
                  }
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {children.map(child => (
                  <MenuItem key={child} value={child}>{child}</MenuItem>
                ))}
                <MenuItem value="__add_new__" sx={{ color: "primary.main" }}>
                  <Add sx={{ mr: 1, fontSize: 18 }} /> Add new child...
                </MenuItem>
              </Select>
            </FormControl>

            {showAddChild && (
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  label="New child name"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  size="small"
                  fullWidth
                  autoFocus
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (newChildName.trim()) {
                      addChild(newChildName.trim());
                      setSessionForm(prev => ({ ...prev, childName: newChildName.trim() }));
                      setNewChildName("");
                      setShowAddChild(false);
                    }
                  }}
                >
                  Add
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setShowAddChild(false);
                    setNewChildName("");
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
            
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={sessionForm.startDate}
                onChange={(e) => setSessionForm(prev => ({ ...prev, startDate: e.target.value }))}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End Date"
                type="date"
                value={sessionForm.endDate}
                onChange={(e) => setSessionForm(prev => ({ ...prev, endDate: e.target.value }))}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            
            <FormControl>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Status</Typography>
              <RadioGroup
                row
                value={sessionForm.status}
                onChange={(e) => setSessionForm(prev => ({ ...prev, status: e.target.value as SessionStatus }))}
              >
                <FormControlLabel value="planned" control={<Radio />} label="Planned" />
                <FormControlLabel value="confirmed" control={<Radio />} label="Confirmed" />
              </RadioGroup>
            </FormControl>
            
            <TextField
              label="Notes (optional)"
              value={sessionForm.notes}
              onChange={(e) => setSessionForm(prev => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleAddSession}
            disabled={!sessionForm.campId || !sessionForm.startDate || !sessionForm.endDate}
          >
            Add to Plan
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
