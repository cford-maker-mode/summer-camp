import React, { useState } from "react";
import {
  Box, Collapse, Card, CardContent, Typography, Button, Alert, Grid, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, CircularProgress, Stack, Chip
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon
} from "@mui/icons-material";
import type { Camp, ScrapedCampData } from "@/public-catalog/types";
import { isFeatureEnabled } from "@/lib/featureFlags";

// Props: open, onClose, onCampAdded
export default function AddCampPanel({ open, onClose, onCampAdded }: {
  open: boolean;
  onClose: () => void;
  onCampAdded: (camp: Camp) => void;
}) {
  // State from legacy Add Camp panel
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeWarning, setScrapeWarning] = useState<string | null>(null);
  const [scrapeConfidence, setScrapeConfidence] = useState<number | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedCampData | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);

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

  function handleUpdateScrapedField(field: keyof ScrapedCampData, value: unknown) {
    if (!scrapedData) return;
    setScrapedData({ ...scrapedData, [field]: value });
  }

  async function handleSaveCamp() {
    if (!scrapedData) return;
    setSaving(true);
    try {
      // Replace with actual API call or callback
      onCampAdded(scrapedData as Camp);
      setScrapedData(null);
      setScrapeUrl("");
      setScrapeWarning(null);
      setScrapeConfidence(null);
      setDetailsExpanded(false);
      onClose();
    } catch (error) {
      setScrapeError("Failed to save camp");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Collapse in={open}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Add New Camp</Typography>
          {scrapeError && (
            <Alert severity="error" sx={{ mb: 2 }}>{scrapeError}</Alert>
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
                    label="Business"
                    placeholder="Camp facility name"
                    value={scrapedData?.location || ""}
                    onChange={(e) => handleUpdateScrapedField("location", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    placeholder="123 Main St, City, State ZIP"
                    value={scrapedData?.address || ""}
                    onChange={(e) => handleUpdateScrapedField("address", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Min Age"
                    type="number"
                    value={scrapedData?.ageMin || ""}
                    onChange={(e) => handleUpdateScrapedField("ageMin", parseInt(e.target.value) || undefined)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Max Age"
                    type="number"
                    value={scrapedData?.ageMax || ""}
                    onChange={(e) => handleUpdateScrapedField("ageMax", parseInt(e.target.value) || undefined)}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Min Grade"
                    type="number"
                    placeholder="K=0"
                    value={scrapedData?.gradeMin ?? ""}
                    onChange={(e) => handleUpdateScrapedField("gradeMin", e.target.value === "" ? undefined : parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Max Grade"
                    type="number"
                    value={scrapedData?.gradeMax ?? ""}
                    onChange={(e) => handleUpdateScrapedField("gradeMax", e.target.value === "" ? undefined : parseInt(e.target.value))}
                  />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField
                    fullWidth
                    label="Cost (min)"
                    inputMode="numeric"
                    value={scrapedData?.cost || ""}
                    onChange={(e) => handleUpdateScrapedField("cost", parseInt(e.target.value) || undefined)}
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
                    onChange={(e) => handleUpdateScrapedField("costMax", parseInt(e.target.value) || undefined)}
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
                      onChange={(e) => handleUpdateScrapedField("costPer", e.target.value)}
                    >
                      <MenuItem value="week">Week</MenuItem>
                      <MenuItem value="day">Day</MenuItem>
                      <MenuItem value="session">Session</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
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
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
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
      </Card>
    </Collapse>
  );
}
