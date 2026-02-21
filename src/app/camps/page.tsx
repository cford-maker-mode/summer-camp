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
  Tooltip,
} from "@mui/material";
import type { SessionStatus } from "@/user-data/types";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  InfoOutlined,
} from "@mui/icons-material";

import type { Camp, ScrapedCampData } from "@/public-catalog/types";
import { loadPublicCampCatalog } from "@/public-catalog";
import { isFeatureEnabled } from "@/lib/featureFlags";

export default function CampsPage() {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  // Google Places suggestions
  const [placeSuggestions, setPlaceSuggestions] = useState<{ name: string; address: string; place_id: string; types: string[] }[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesDropdownOpen, setPlacesDropdownOpen] = useState(false);
  const [placesField, setPlacesField] = useState<'name' | 'location' | 'manual-location' | null>(null);

  // Debounced search for Google Places
  useEffect(() => {
    let query = '';
    if (placesField === 'name' && editForm?.name) query = editForm.name;
    if (placesField === 'location' && editForm?.location) query = editForm.location;
    if (placesField === 'manual-location' && scrapedData?.location) query = scrapedData.location;
    if (!query || query.length < 3) {
      setPlaceSuggestions([]);
      setPlacesDropdownOpen(false);
      return;
    }
    const timeout = setTimeout(async () => {
      setPlacesLoading(true);
      try {
        const res = await fetch(`/api/places-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setPlaceSuggestions(data.suggestions || []);
        setPlacesDropdownOpen((data.suggestions || []).length > 0);
      } catch {
        setPlaceSuggestions([]);
        setPlacesDropdownOpen(false);
      } finally {
        setPlacesLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [editForm?.name, editForm?.location, scrapedData?.location, placesField]);

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
      const publicCatalog = await loadPublicCampCatalog();
      setCamps(publicCatalog?.camps || []);
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
      let res, data;
      if (isFeatureEnabled("aiWebScraper")) {
        res = await fetch("/api/ai-camp-extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: scrapeUrl }),
        });
        data = await res.json();
      } else {
        res = await fetch("/api/scrape-camp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: scrapeUrl, deep: true }),
        });
        data = await res.json();
      }

      if (!data.success) {
        setScrapeError(data.error || "Failed to extract camp data");
        return;
      }

      setScrapedData(data.data);
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

  // Utility: Normalize date to YYYY-MM-DD
  function normalizeDate(input: string): string {
    if (!input) return "";
    // If already ISO, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    // Try to parse MM/DD/YYYY or M/D/YYYY
    const parts = input.split(/[\/\-]/);
    if (parts.length === 3) {
      let [month, day, year] = parts;
      if (year.length === 4 && month.length <= 2 && day.length <= 2) {
        if (parseInt(year) > 1900 && parseInt(year) < 2100) {
          // If year is first, swap
          if (parseInt(month) > 1900) {
            [year, month, day] = [month, day, year];
          }
          return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }
    }
    // Fallback: try Date parsing
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return input;
  }

  function handleUpdateEditField(field: keyof ScrapedCampData, value: unknown) {
    if (!editForm) return;
    // Normalize signupDate
    if (field === "signupDate" && typeof value === "string") {
      value = normalizeDate(value);
    }
    setEditForm({ ...editForm, [field]: value });
  }

  async function handleSaveEdit() {
    if (!editCamp || !editForm) return;

    setSavingEdit(true);
    try {
      // Always send all optional fields, using null if cleared
      const patchBody = {
        ...editForm,
        cost: editForm?.cost ?? null,
        costMax: editForm?.costMax ?? null,
        costPer: editForm?.costPer ?? null,
        ageMin: editForm?.ageMin ?? null,
        ageMax: editForm?.ageMax ?? null,
        gradeMin: editForm?.gradeMin ?? null,
        gradeMax: editForm?.gradeMax ?? null,
        signupDate: editForm?.signupDate ?? null,
        overnight: editForm?.overnight ?? null,
        dailyStartTime: editForm?.dailyStartTime ?? null,
        dailyEndTime: editForm?.dailyEndTime ?? null,
        benefits: editForm?.benefits ?? [],
      };
      const res = await fetch(`/api/camps/${editCamp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchBody),
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
      <Typography variant="h1" gutterBottom sx={{ textAlign: 'center' }}>
        Camp Catalog
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mb: 3,
          maxWidth: 600,
          mx: 'auto',
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src="/openmoji/1F60E_color.png" alt="Explore" width={24} height={24} style={{ filter: 'grayscale(100%)', verticalAlign: 'middle' }} />
          Find and explore camps
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src="/openmoji/26FA_color.png" alt="Add" width={24} height={24} style={{ filter: 'grayscale(100%)', verticalAlign: 'middle' }} />
          Add camps to the catalog
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: 1 }}>
          <img src="/openmoji/1F5D3_color.png" alt="Plan" width={24} height={24} style={{ filter: 'grayscale(100%)', verticalAlign: 'middle' }} />
          Save camps to your plan
        </Typography>
      </Box>

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
            {scrapeError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {scrapeError}
              </Alert>
            )}

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
              <>
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
              </>
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
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        fullWidth
                        label="Business"
                        placeholder="Camp facility name"
                        value={scrapedData?.location || ""}
                        onChange={(e) => {
                          handleUpdateScrapedField("location", e.target.value);
                          setPlacesField('manual-location');
                        }}
                        onFocus={() => setPlacesField('manual-location')}
                        onBlur={() => setTimeout(() => setPlacesDropdownOpen(false), 200)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.secondary">Type for suggestions</Typography></InputAdornment>
                        }}
                      />
                      {placesDropdownOpen && placesField === 'manual-location' && (
                        <Box sx={{ position: 'absolute', zIndex: 10, top: 56, left: 0, right: 0, bgcolor: 'background.paper', border: '1px solid #ccc', borderRadius: 1, boxShadow: 2 }}>
                          {placesLoading ? (
                            <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
                          ) : (
                            placeSuggestions.map((place) => (
                              <Box
                                key={place.place_id}
                                sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                onMouseDown={() => {
                                  setScrapedData((prev) => prev ? { ...prev, location: place.name, address: place.address } : prev);
                                  setPlacesDropdownOpen(false);
                                }}
                              >
                                <Typography variant="body2">{place.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{place.address}</Typography>
                              </Box>
                            ))
                          )}
                        </Box>
                      )}
                    </Box>
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
                      inputMode="numeric"
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
                      inputMode="numeric"
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

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Registration/Signup Dates</Typography>
                    {(scrapedData?.registrationDates || []).map((rd, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          label="Label"
                          value={rd.label}
                          onChange={e => {
                            const arr = [...(scrapedData?.registrationDates || [])];
                            arr[i] = { ...arr[i], label: e.target.value };
                            handleUpdateScrapedField("registrationDates", arr);
                          }}
                          size="small"
                        />
                        <TextField
                          label="Date"
                          type="date"
                          value={rd.date}
                          onChange={e => {
                            const arr = [...(scrapedData?.registrationDates || [])];
                            arr[i] = { ...arr[i], date: e.target.value };
                            handleUpdateScrapedField("registrationDates", arr);
                          }}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                        <Button color="error" onClick={() => {
                          const arr = [...(scrapedData?.registrationDates || [])];
                          arr.splice(i, 1);
                          handleUpdateScrapedField("registrationDates", arr);
                        }}>Remove</Button>
                      </Box>
                    ))}
                    <Button size="small" onClick={() => {
                      const arr = [...(scrapedData?.registrationDates || [])];
                      arr.push({ label: '', date: '' });
                      handleUpdateScrapedField("registrationDates", arr);
                    }}>Add Registration Date</Button>
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
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500, mr: 1 }}>
            Double-check important details
          </Typography>
          <Tooltip
            title={
              'This catalog is built by the community and supported by AI. Some details may be out of date or incomplete. Please check the source before making plans, and help keep things accurate for everyone.'
            }
            placement="top"
            arrow
          >
            <IconButton size="small" sx={{ p: 0 }}>
              <InfoOutlined color="warning" fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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

      {/* ...removed total cost display... */}

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
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      label="Camp Name *"
                      value={editForm.name || ""}
                      onChange={(e) => {
                        handleUpdateEditField("name", e.target.value);
                        setPlacesField('name');
                      }}
                      onFocus={() => setPlacesField('name')}
                      onBlur={() => setTimeout(() => setPlacesDropdownOpen(false), 200)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.secondary">Type for suggestions</Typography></InputAdornment>
                      }}
                    />
                    {placesDropdownOpen && placesField === 'name' && (
                      <Box sx={{ position: 'absolute', zIndex: 10, top: 56, left: 0, right: 0, bgcolor: 'background.paper', border: '1px solid #ccc', borderRadius: 1, boxShadow: 2 }}>
                        {placesLoading ? (
                          <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
                        ) : (
                          placeSuggestions.map((place) => (
                            <Box
                              key={place.place_id}
                              sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                              onMouseDown={() => {
                                setEditForm((prev) => prev ? { ...prev, location: place.name, address: place.address } : prev);
                                setPlacesDropdownOpen(false);
                              }}
                            >
                              <Typography variant="body2">{place.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{place.address}</Typography>
                            </Box>
                          ))
                        )}
                      </Box>
                    )}
                  </Box>
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
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth
                      label="Business"
                      value={editForm.location || ""}
                      onChange={(e) => {
                        handleUpdateEditField("location", e.target.value);
                        setPlacesField('location');
                      }}
                      onFocus={() => setPlacesField('location')}
                      onBlur={() => setTimeout(() => setPlacesDropdownOpen(false), 200)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.secondary">Type for suggestions</Typography></InputAdornment>
                      }}
                    />
                    {placesDropdownOpen && placesField === 'location' && (
                      <Box sx={{ position: 'absolute', zIndex: 10, top: 56, left: 0, right: 0, bgcolor: 'background.paper', border: '1px solid #ccc', borderRadius: 1, boxShadow: 2 }}>
                        {placesLoading ? (
                          <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={20} /></Box>
                        ) : (
                          placeSuggestions.map((place) => (
                            <Box
                              key={place.place_id}
                              sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                              onMouseDown={() => {
                                setEditForm((prev) => prev ? { ...prev, location: place.name, address: place.address } : prev);
                                setPlacesDropdownOpen(false);
                              }}
                            >
                              <Typography variant="body2">{place.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{place.address}</Typography>
                            </Box>
                          ))
                        )}
                      </Box>
                    )}
                  </Box>
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
                    inputMode="numeric"
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
                    inputMode="numeric"
                    value={editForm.costMax || ""}
                    onChange={(e) => handleUpdateEditField("costMax", e.target.value === "" ? undefined : parseInt(e.target.value))}
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
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Registration/Signup Dates</Typography>
                  {(editForm.registrationDates || []).map((rd, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        label="Label"
                        value={rd.label}
                        onChange={e => {
                          const arr = [...(editForm.registrationDates || [])];
                          arr[i] = { ...arr[i], label: e.target.value };
                          handleUpdateEditField("registrationDates", arr);
                        }}
                        size="small"
                      />
                      <TextField
                        label="Date"
                        type="date"
                        value={rd.date}
                        onChange={e => {
                          const arr = [...(editForm.registrationDates || [])];
                          arr[i] = { ...arr[i], date: e.target.value };
                          handleUpdateEditField("registrationDates", arr);
                        }}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                      <Button color="error" onClick={() => {
                        const arr = [...(editForm.registrationDates || [])];
                        arr.splice(i, 1);
                        handleUpdateEditField("registrationDates", arr);
                      }}>Remove</Button>
                    </Box>
                  ))}
                  <Button size="small" onClick={() => {
                    const arr = [...(editForm.registrationDates || [])];
                    arr.push({ label: '', date: '' });
                    handleUpdateEditField("registrationDates", arr);
                  }}>Add Registration Date</Button>
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
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Button color="error" variant="outlined" onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this camp?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                <Button color="error" variant="contained" onClick={async () => {
                  setDeleteConfirmOpen(false);
                  if (!editCamp) return;
                  try {
                    const res = await fetch(`/api/camps/${editCamp.id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Failed to delete camp');
                    setSnackbar({ open: true, message: 'Camp deleted', severity: 'success' });
                    setEditCamp(null);
                    setEditForm(null);
                    loadCamps();
                  } catch {
                    setSnackbar({ open: true, message: 'Failed to delete camp', severity: 'error' });
                  }
                }}>Delete</Button>
              </DialogActions>
            </Dialog>
          </Box>
          <Box>
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
          </Box>
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
    if ((camp.gradeMin === undefined || camp.gradeMin === null) && (camp.gradeMax === undefined || camp.gradeMax === null)) return null;
    const formatGrade = (g: number | undefined | null) => {
      if (g === undefined || g === null) return "?";
      return g === 0 ? "K" : g.toString();
    };
    if (camp.gradeMin !== undefined && camp.gradeMin !== null && camp.gradeMax !== undefined && camp.gradeMax !== null) {
      if (camp.gradeMin === camp.gradeMax) return `Grade ${formatGrade(camp.gradeMin)}`;
      return `Grades ${formatGrade(camp.gradeMin)}-${formatGrade(camp.gradeMax)}`;
    }
    if (camp.gradeMin !== undefined && camp.gradeMin !== null) return `Grade ${formatGrade(camp.gradeMin)}+`;
    if (camp.gradeMax !== undefined && camp.gradeMax !== null) return `Up to grade ${formatGrade(camp.gradeMax)}`;
    return null;
  };

  const formatEligibility = () => {
    const grades = formatGrades();
    const ages = formatAges();
    // Prefer grades if available, fallback to ages
    return grades || ages;
  };

  // Show all registration dates as labeled chips
  const now = new Date();
  const registrationDates = camp.registrationDates || [];
  const getSignupChip = (rd: { label: string; date: string }) => {
    if (!rd.date) return null;
    const date = new Date(rd.date + "T00:00:00");
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    let label = rd.label ? `${rd.label}: ` : "Signup: ";
    if (daysUntil < 0) label += "passed";
    else if (daysUntil === 0) label += "TODAY!";
    else if (daysUntil <= 7) label += `in ${daysUntil} days`;
    else label += date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const isSoon = daysUntil >= 0 && daysUntil <= 7;
    return (
      <Chip
        key={rd.label + rd.date}
        icon={<CalendarIcon />}
        label={label}
        size="small"
        color={isSoon ? "warning" : "default"}
        sx={{ mr: 0.5, mb: 0.5 }}
      />
    );
  };

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
              {registrationDates.map(getSignupChip)}
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


