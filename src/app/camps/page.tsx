"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Collapse,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  Snackbar,
} from "@mui/material";
import type { SessionStatus } from "@/types/summer";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import type { Camp, ScrapedCampData } from "@/types/camp";

export default function CampsPage() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeWarning, setScrapeWarning] = useState<string | null>(null);
  const [scrapeConfidence, setScrapeConfidence] = useState<number | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedCampData | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "signup">("name");

  // Children state (persisted to localStorage)
  const [children, setChildren] = useState<string[]>([]);
  const [newChildName, setNewChildName] = useState("");
  const [showAddChild, setShowAddChild] = useState(false);

  // Add to Plan state
  const [addToPlanCamp, setAddToPlanCamp] = useState<Camp | null>(null);
  const [addToPlanForm, setAddToPlanForm] = useState({
    startDate: "",
    endDate: "",
    status: "planned" as SessionStatus,
    childName: "",
    notes: "",
  });
  const [addingToPlan, setAddingToPlan] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Edit camp state
  const [editCamp, setEditCamp] = useState<Camp | null>(null);
  const [editForm, setEditForm] = useState<ScrapedCampData | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const SUMMER_ID = "summer-2026";

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

  // Load camps on mount
  useEffect(() => {
    loadCamps();
  }, []);

  async function loadCamps() {
    try {
      const res = await fetch("/api/camps/list");
      const data = await res.json();
      setCamps(data.camps || []);
    } catch (error) {
      console.error("Failed to load camps:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleScrape() {
    if (!scrapeUrl.trim()) return;

    setScraping(true);
    setScrapeError(null);
    setScrapeWarning(null);
    setScrapeConfidence(null);
    setScrapedData(null);

    try {
      const res = await fetch("/api/scrape-camp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl, deep: true }),
      });

      const data = await res.json();

      if (!data.success) {
        setScrapeError(data.error || "Failed to scrape camp data");
        return;
      }

      // Check for warnings (low confidence extraction)
      if (data.warning) {
        setScrapeWarning(data.warning);
      }
      if (data.confidence !== undefined) {
        setScrapeConfidence(data.confidence);
      }

      setScrapedData(data.data);
      // Auto-expand details when data is scraped
      if (data.data) {
        setDetailsExpanded(true);
      }
    } catch (error) {
      setScrapeError("Network error - please try again");
    } finally {
      setScraping(false);
    }
  }

  async function handleSaveCamp() {
    if (!scrapedData) return;

    setSaving(true);
    try {
      const res = await fetch("/api/camps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scrapedData),
      });

      const data = await res.json();

      if (!data.success) {
        setScrapeError(data.error || "Failed to save camp");
        return;
      }

      // Reset form and reload camps
      setScrapedData(null);
      setScrapeUrl("");
      setScrapeWarning(null);
      setScrapeConfidence(null);
      setDetailsExpanded(false);
      setAddPanelOpen(false);
      loadCamps();
    } catch (error) {
      setScrapeError("Failed to save camp");
    } finally {
      setSaving(false);
    }
  }

  function handleUpdateScrapedField(field: keyof ScrapedCampData, value: unknown) {
    if (!scrapedData) return;
    setScrapedData({ ...scrapedData, [field]: value });
  }

  // Edit camp handlers
  function handleEditCamp(camp: Camp) {
    setEditCamp(camp);
    setEditForm({
      url: camp.url || "",
      name: camp.name,
      location: camp.location,
      address: camp.address,
      cost: camp.cost,
      costMax: camp.costMax,
      costPer: camp.costPer,
      ageMin: camp.ageMin,
      ageMax: camp.ageMax,
      gradeMin: camp.gradeMin,
      gradeMax: camp.gradeMax,
      signupDate: camp.signupDate,
      overnight: camp.overnight,
      dailyStartTime: camp.dailyStartTime,
      dailyEndTime: camp.dailyEndTime,
      benefits: camp.benefits,
      notes: camp.notes,
    });
  }

  function handleUpdateEditField(field: keyof ScrapedCampData, value: unknown) {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  }

  async function handleSaveEdit() {
    if (!editCamp || !editForm) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/camps/${editCamp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (!data.success) {
        setSnackbar({ open: true, message: data.error || "Failed to save changes", severity: "error" });
        return;
      }

      setEditCamp(null);
      setEditForm(null);
      setSnackbar({ open: true, message: "Camp updated successfully", severity: "success" });
      loadCamps();
    } catch {
      setSnackbar({ open: true, message: "Failed to save changes", severity: "error" });
    } finally {
      setSavingEdit(false);
    }
  }

  const sortedCamps = [...camps].sort((a, b) => {
    if (sortBy === "signup") {
      if (a.signupDate && b.signupDate) return a.signupDate.localeCompare(b.signupDate);
      if (a.signupDate) return -1;
      if (b.signupDate) return 1;
      return 0;
    }
    return a.name.localeCompare(b.name);
  });

  const totalCost = camps.reduce((sum, camp) => sum + (camp.cost || 0), 0);

  return (
    <Box>
      <Typography variant="h1" gutterBottom>
        Camp Catalog
      </Typography>

      {/* Add Camp Panel */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ pb: 1 }}>
          <Button
            fullWidth
            onClick={() => setAddPanelOpen(!addPanelOpen)}
            startIcon={<AddIcon />}
            endIcon={addPanelOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ justifyContent: "flex-start", textAlign: "left" }}
          >
            Add Camp
          </Button>
        </CardContent>

        <Collapse in={addPanelOpen}>
          <CardContent>
            {/* Status alerts */}
            {scrapeWarning && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {scrapeWarning}
                {scrapeConfidence !== null && (
                  <Typography variant="caption" display="block">
                    Confidence: {Math.round(scrapeConfidence * 100)}%
                  </Typography>
                )}
              </Alert>
            )}
            {scrapeConfidence !== null && scrapeConfidence > 0.5 && !scrapeWarning && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Details extracted successfully
                <Typography variant="caption" display="block">
                  Confidence: {Math.round(scrapeConfidence * 100)}%
                </Typography>
              </Alert>
            )}
            {scrapeError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {scrapeError}
              </Alert>
            )}

            {/* Primary row: Camp Name + URL + Fetch button */}
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Camp Name *"
                  placeholder="Summer Tech Camp"
                  value={scrapedData?.name || ""}
                  onChange={(e) => {
                    if (!scrapedData) {
                      setScrapedData({ url: scrapeUrl, name: e.target.value });
                    } else {
                      handleUpdateScrapedField("name", e.target.value);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="Website URL"
                  placeholder="https://example-camp.com/summer-program"
                  value={scrapeUrl}
                  onChange={(e) => {
                    setScrapeUrl(e.target.value);
                    if (scrapedData) {
                      handleUpdateScrapedField("url", e.target.value);
                    }
                  }}
                  disabled={scraping}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleScrape}
                  disabled={!scrapeUrl.trim() || scraping}
                  startIcon={scraping ? <CircularProgress size={16} /> : null}
                  sx={{ height: 56 }}
                >
                  {scraping ? "..." : "Fetch"}
                </Button>
              </Grid>
            </Grid>

            {/* Expandable details section */}
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                endIcon={detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ textTransform: "none" }}
              >
                {detailsExpanded ? "Hide Details" : "Enter Details Manually"}
              </Button>
            </Box>

            <Collapse in={detailsExpanded}>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      placeholder="Camp facility name"
                      value={scrapedData?.location || ""}
                      onChange={(e) => {
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, location: e.target.value });
                        } else {
                          handleUpdateScrapedField("location", e.target.value);
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Address"
                      placeholder="123 Main St, City, State ZIP"
                      value={scrapedData?.address || ""}
                      onChange={(e) => {
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, address: e.target.value });
                        } else {
                          handleUpdateScrapedField("address", e.target.value);
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="Min Age"
                      type="number"
                      value={scrapedData?.ageMin || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || undefined;
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, ageMin: val });
                        } else {
                          handleUpdateScrapedField("ageMin", val);
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="Max Age"
                      type="number"
                      value={scrapedData?.ageMax || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || undefined;
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, ageMax: val });
                        } else {
                          handleUpdateScrapedField("ageMax", val);
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="Min Grade"
                      type="number"
                      placeholder="K=0"
                      value={scrapedData?.gradeMin ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, gradeMin: val });
                        } else {
                          handleUpdateScrapedField("gradeMin", val);
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="Max Grade"
                      type="number"
                      value={scrapedData?.gradeMax ?? ""}
                      onChange={(e) => {
                        const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, gradeMax: val });
                        } else {
                          handleUpdateScrapedField("gradeMax", val);
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={4} sm={2}>
                    <TextField
                      fullWidth
                      label="Cost (min)"
                      type="number"
                      value={scrapedData?.cost || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || undefined;
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, cost: val });
                        } else {
                          handleUpdateScrapedField("cost", val);
                        }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={4} sm={2}>
                    <TextField
                      fullWidth
                      label="Cost (max)"
                      type="number"
                      placeholder="if range"
                      value={scrapedData?.costMax || ""}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || undefined;
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, costMax: val });
                        } else {
                          handleUpdateScrapedField("costMax", val);
                        }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={4} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel>Per</InputLabel>
                      <Select
                        value={scrapedData?.costPer || "week"}
                        label="Per"
                        onChange={(e) => {
                          if (!scrapedData) {
                            setScrapedData({ url: scrapeUrl, costPer: e.target.value });
                          } else {
                            handleUpdateScrapedField("costPer", e.target.value);
                          }
                        }}
                      >
                        <MenuItem value="week">Week</MenuItem>
                        <MenuItem value="day">Day</MenuItem>
                        <MenuItem value="session">Session</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Signup Opens"
                      type="date"
                      value={scrapedData?.signupDate || ""}
                      onChange={(e) => {
                        if (!scrapedData) {
                          setScrapedData({ url: scrapeUrl, signupDate: e.target.value });
                        } else {
                          handleUpdateScrapedField("signupDate", e.target.value);
                        }
                      }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={scrapedData?.overnight || false}
                          onChange={(e) => {
                            if (!scrapedData) {
                              setScrapedData({ url: scrapeUrl, overnight: e.target.checked });
                            } else {
                              handleUpdateScrapedField("overnight", e.target.checked);
                            }
                          }}
                        />
                      }
                      label="Overnight camp (no daily drop-off/pickup times)"
                    />
                  </Grid>

                  {!scrapedData?.overnight && (
                    <>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Start Time"
                          type="time"
                          value={scrapedData?.dailyStartTime || ""}
                          onChange={(e) => {
                            if (!scrapedData) {
                              setScrapedData({ url: scrapeUrl, dailyStartTime: e.target.value });
                            } else {
                              handleUpdateScrapedField("dailyStartTime", e.target.value);
                            }
                          }}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="End Time"
                          type="time"
                          value={scrapedData?.dailyEndTime || ""}
                          onChange={(e) => {
                            if (!scrapedData) {
                              setScrapedData({ url: scrapeUrl, dailyEndTime: e.target.value });
                            } else {
                              handleUpdateScrapedField("dailyEndTime", e.target.value);
                            }
                          }}
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                {scrapedData?.benefits && scrapedData.benefits.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Benefits/Tags
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {scrapedData.benefits.map((benefit, i) => (
                        <Chip key={i} label={benefit} size="small" />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Collapse>

            {/* Action buttons */}
            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setScrapedData(null);
                  setScrapeUrl("");
                  setScrapeError(null);
                  setScrapeWarning(null);
                  setScrapeConfidence(null);
                  setDetailsExpanded(false);
                  setAddPanelOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveCamp}
                disabled={!scrapedData?.name || saving}
                startIcon={saving ? <CircularProgress size={20} /> : null}
              >
                {saving ? "Saving..." : "Save Camp"}
              </Button>
            </Box>
          </CardContent>
        </Collapse>
      </Card>

      {/* Filters */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort</InputLabel>
          <Select value={sortBy} label="Sort" onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="signup">Signup Date</MenuItem>
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary">
          {camps.length} camps
        </Typography>
      </Box>

      {/* Camp List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : camps.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No camps yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add your first camp to get started planning your summer!
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddPanelOpen(true)}>
              Add Camp
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sortedCamps.map((camp) => (
            <CampCard key={camp.id} camp={camp} onEdit={handleEditCamp} onAddToPlan={(c) => {
              setAddToPlanCamp(c);
              // Default to 5-day session starting next Monday
              const today = new Date();
              const nextMonday = new Date(today);
              nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7 || 7));
              const friday = new Date(nextMonday);
              friday.setDate(nextMonday.getDate() + 4);
              setAddToPlanForm({
                startDate: nextMonday.toISOString().split("T")[0],
                endDate: friday.toISOString().split("T")[0],
                status: "planned",
                childName: "",
                notes: "",
              });
            }} />
          ))}
        </Stack>
      )}

      {/* Total Cost */}
      {camps.length > 0 && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: "background.paper", borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Estimated Total Cost: <strong>${totalCost.toLocaleString()}</strong> ({camps.length} camps)
          </Typography>
        </Box>
      )}

      {/* Add to Plan Dialog */}
      <Dialog
        open={Boolean(addToPlanCamp)}
        onClose={() => {
          setAddToPlanCamp(null);
          setShowAddChild(false);
          setNewChildName("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add to Summer Plan</DialogTitle>
        <DialogContent>
          {addToPlanCamp && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {addToPlanCamp.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {addToPlanCamp.location}
              </Typography>

              {/* Child selector */}
              <FormControl fullWidth>
                <InputLabel>Child (optional)</InputLabel>
                <Select
                  value={addToPlanForm.childName}
                  label="Child (optional)"
                  onChange={(e) => {
                    if (e.target.value === "__add_new__") {
                      setShowAddChild(true);
                    } else {
                      setAddToPlanForm(prev => ({ ...prev, childName: e.target.value }));
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
                    <AddIcon sx={{ mr: 1, fontSize: 18 }} /> Add new child...
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
                        setAddToPlanForm(prev => ({ ...prev, childName: newChildName.trim() }));
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
                  value={addToPlanForm.startDate}
                  onChange={(e) => setAddToPlanForm(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={addToPlanForm.endDate}
                  onChange={(e) => setAddToPlanForm(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Box>

              <FormControl>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Status</Typography>
                <RadioGroup
                  row
                  value={addToPlanForm.status}
                  onChange={(e) => setAddToPlanForm(prev => ({ ...prev, status: e.target.value as SessionStatus }))}
                >
                  <FormControlLabel value="planned" control={<Radio />} label="Planned" />
                  <FormControlLabel value="confirmed" control={<Radio />} label="Confirmed" />
                </RadioGroup>
              </FormControl>

              <TextField
                label="Notes (optional)"
                value={addToPlanForm.notes}
                onChange={(e) => setAddToPlanForm(prev => ({ ...prev, notes: e.target.value }))}
                multiline
                rows={2}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddToPlanCamp(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!addToPlanForm.startDate || !addToPlanForm.endDate || addingToPlan}
            onClick={async () => {
              if (!addToPlanCamp) return;
              setAddingToPlan(true);
              try {
                const res = await fetch(`/api/summers/${SUMMER_ID}/sessions`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    campId: addToPlanCamp.id,
                    ...addToPlanForm,
                  }),
                });
                if (!res.ok) throw new Error("Failed to add session");
                setSnackbar({
                  open: true,
                  message: `${addToPlanCamp.name} added to Summer Plan`,
                  severity: "success",
                });
                setAddToPlanCamp(null);
              } catch {
                setSnackbar({
                  open: true,
                  message: "Failed to add to plan",
                  severity: "error",
                });
              } finally {
                setAddingToPlan(false);
              }
            }}
          >
            {addingToPlan ? "Adding..." : "Add to Plan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Camp Dialog */}
      <Dialog
        open={Boolean(editCamp)}
        onClose={() => {
          setEditCamp(null);
          setEditForm(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Camp</DialogTitle>
        <DialogContent>
          {editForm && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Camp Name *"
                    value={editForm.name || ""}
                    onChange={(e) => handleUpdateEditField("name", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website URL"
                    value={editForm.url || ""}
                    onChange={(e) => handleUpdateEditField("url", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={editForm.location || ""}
                    onChange={(e) => handleUpdateEditField("location", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={editForm.address || ""}
                    onChange={(e) => handleUpdateEditField("address", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Min Age"
                    type="number"
                    value={editForm.ageMin || ""}
                    onChange={(e) => handleUpdateEditField("ageMin", parseInt(e.target.value) || undefined)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Max Age"
                    type="number"
                    value={editForm.ageMax || ""}
                    onChange={(e) => handleUpdateEditField("ageMax", parseInt(e.target.value) || undefined)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Min Grade"
                    type="number"
                    placeholder="K=0"
                    value={editForm.gradeMin ?? ""}
                    onChange={(e) => handleUpdateEditField("gradeMin", e.target.value === "" ? undefined : parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Max Grade"
                    type="number"
                    value={editForm.gradeMax ?? ""}
                    onChange={(e) => handleUpdateEditField("gradeMax", e.target.value === "" ? undefined : parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField
                    fullWidth
                    label="Cost (min)"
                    type="number"
                    value={editForm.cost || ""}
                    onChange={(e) => handleUpdateEditField("cost", parseInt(e.target.value) || undefined)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField
                    fullWidth
                    label="Cost (max)"
                    type="number"
                    value={editForm.costMax || ""}
                    onChange={(e) => handleUpdateEditField("costMax", parseInt(e.target.value) || undefined)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <FormControl fullWidth>
                    <InputLabel>Per</InputLabel>
                    <Select
                      value={editForm.costPer || "week"}
                      label="Per"
                      onChange={(e) => handleUpdateEditField("costPer", e.target.value)}
                    >
                      <MenuItem value="week">Week</MenuItem>
                      <MenuItem value="day">Day</MenuItem>
                      <MenuItem value="session">Session</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Signup Opens"
                    type="date"
                    value={editForm.signupDate || ""}
                    onChange={(e) => handleUpdateEditField("signupDate", e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editForm.overnight || false}
                        onChange={(e) => handleUpdateEditField("overnight", e.target.checked)}
                      />
                    }
                    label="Overnight camp"
                  />
                </Grid>
                {!editForm.overnight && (
                  <>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="Start Time"
                        type="time"
                        value={editForm.dailyStartTime || ""}
                        onChange={(e) => handleUpdateEditField("dailyStartTime", e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        label="End Time"
                        type="time"
                        value={editForm.dailyEndTime || ""}
                        onChange={(e) => handleUpdateEditField("dailyEndTime", e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={editForm.notes || ""}
                    onChange={(e) => handleUpdateEditField("notes", e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditCamp(null);
            setEditForm(null);
          }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!editForm?.name || savingEdit}
            onClick={handleSaveEdit}
          >
            {savingEdit ? "Saving..." : "Save Changes"}
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

function CampCard({ camp, onAddToPlan, onEdit }: { camp: Camp; onAddToPlan: (camp: Camp) => void; onEdit: (camp: Camp) => void }) {
  const formatCost = () => {
    if (!camp.cost) return null;
    const per = camp.costPer || "week";
    if (camp.costMax && camp.costMax !== camp.cost) {
      return `$${camp.cost}-$${camp.costMax}/${per}`;
    }
    return `$${camp.cost}/${per}`;
  };

  const formatAges = () => {
    if (!camp.ageMin && !camp.ageMax) return null;
    if (camp.ageMin && camp.ageMax) return `Ages ${camp.ageMin}-${camp.ageMax}`;
    if (camp.ageMin) return `Ages ${camp.ageMin}+`;
    return `Up to age ${camp.ageMax}`;
  };

  const formatGrades = () => {
    if (camp.gradeMin === undefined && camp.gradeMax === undefined) return null;
    const formatGrade = (g: number) => (g === 0 ? "K" : g.toString());
    if (camp.gradeMin !== undefined && camp.gradeMax !== undefined) {
      if (camp.gradeMin === camp.gradeMax) return `Grade ${formatGrade(camp.gradeMin)}`;
      return `Grades ${formatGrade(camp.gradeMin)}-${formatGrade(camp.gradeMax)}`;
    }
    if (camp.gradeMin !== undefined) return `Grade ${formatGrade(camp.gradeMin)}+`;
    return `Up to grade ${formatGrade(camp.gradeMax!)}`;
  };

  const formatEligibility = () => {
    const grades = formatGrades();
    const ages = formatAges();
    // Prefer grades if available, fallback to ages
    return grades || ages;
  };

  const formatSignup = () => {
    if (!camp.signupDate) return null;
    const date = new Date(camp.signupDate + "T00:00:00");
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return "Signup passed";
    if (daysUntil === 0) return "Signup TODAY!";
    if (daysUntil <= 7) return `Signup in ${daysUntil} days`;
    return `Signup: ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const signupInfo = formatSignup();
  const isSignupSoon = signupInfo && (signupInfo.includes("days") || signupInfo.includes("TODAY"));

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h6">{camp.name}</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {[camp.location, formatEligibility()].filter(Boolean).join(" • ")}
            </Typography>

            {camp.address && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                📍 {camp.address}
              </Typography>
            )}

            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              {formatCost() && <Chip label={formatCost()} size="small" />}
              {signupInfo && (
                <Chip
                  icon={<CalendarIcon />}
                  label={signupInfo}
                  size="small"
                  color={isSignupSoon ? "warning" : "default"}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" variant="outlined" onClick={() => onAddToPlan(camp)}>
              Add to Plan
            </Button>
            <IconButton size="small" onClick={() => onEdit(camp)}>
              <EditIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}


