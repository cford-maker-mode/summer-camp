"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Collapse,
  TextField,
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
import { Card, CardContent } from "@mui/material";
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

import { useCamps } from "@/hooks/useCamps";
import CampList from "@/components/CampList";
import NoCampsPanel from "@/components/NoCampsPanel";
import CampDetails from "@/components/CampDetails";
import CampForm from "@/components/CampForm";
import AddCampPanel from "@/components/AddCampPanel";
import CampFiltersBar from "@/components/CampFiltersBar";
import AddCampDialog from "@/components/AddCampDialog";
import AddToPlanDialog from "@/components/AddToPlanDialog";
import EditCampDialog from "@/components/EditCampDialog";
import SnackbarFeedback from "@/components/SnackbarFeedback";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import ScrapeErrorDialog from "@/components/ScrapeErrorDialog";

export default function CampsPage() {
  // State and handlers
  const { camps, loading, error, setCamps } = useCamps();
  const [selectedCamp, setSelectedCamp] = useState<Camp | null>(null);
  const [filters, setFilters] = useState<{ sort: string }>({ sort: "name" });
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [addToPlanDialogOpen, setAddToPlanDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scrapeErrorDialogOpen, setScrapeErrorDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Load camps on mount
  useEffect(() => {
    loadCamps();
  }, []);

  async function loadCamps() {
    try {
      const publicCatalog = await loadPublicCampCatalog();
      setCamps(publicCatalog?.camps || []);
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to load camps", severity: "error" });
    }
  }

  // Handler: Add camp (from AddCampPanel)
  const handleAddCamp = (camp: Camp) => {
    setCamps(prev => [...prev, camp]);
    setAddPanelOpen(false);
    setSnackbar({ open: true, message: "Camp added!", severity: "success" });
  };

  // Handler: Edit camp
  const handleEditCamp = (campData: Camp) => {
    setCamps(prev => prev.map(c => c.id === campData.id ? { ...c, ...campData } : c));
    setSelectedCamp(campData);
    setEditDialogOpen(false);
    setSnackbar({ open: true, message: "Camp updated!", severity: "success" });
  };

  // Handler: Delete camp
  const handleDeleteCamp = () => {
    if (selectedCamp) {
      setCamps(prev => prev.filter(c => c.id !== selectedCamp.id));
      setSelectedCamp(null);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: "Camp deleted!", severity: "info" });
    }
  };

  // Handler: Add to plan
  const handleAddToPlan = (camp: Camp) => {
    setAddToPlanDialogOpen(true);
    setSelectedCamp(camp);
  };

  // Handler: Confirm add to plan
  const handleConfirmAddToPlan = () => {
    setAddToPlanDialogOpen(false);
    setSnackbar({ open: true, message: `Added ${selectedCamp?.name} to plan!`, severity: "success" });
  };

  // Handler: Edit dialog
  const handleEdit = (camp: Camp) => {
    setSelectedCamp(camp);
    setEditDialogOpen(true);
  };

  // Handler: Delete dialog
  const handleDelete = (camp: Camp) => {
    setSelectedCamp(camp);
    setDeleteDialogOpen(true);
  };

  // Handler: Scrape error
  const handleScrapeError = (error: unknown) => {
    setScrapeErrorDialogOpen(true);
    setSnackbar({ open: true, message: "Scrape error occurred", severity: "error" });
  };

  // Handler: Snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handler: Filter change
  const handleFilterChange = (newFilters: Partial<{ sort: string }>) => {
    setFilters(prev => ({ ...prev, ...newFilters, sort: newFilters.sort ?? prev.sort }));
  };

  // Filter camps (placeholder, implement actual filtering logic)
  const filteredCamps = camps; // TODO: apply filters

  return (
    <Box>
      <Typography variant="h4" align="center" sx={{ mb: 2 }}>Camp Catalog</Typography>
      <CampFiltersBar
        sort={filters.sort || "name"}
        onSortChange={(e: React.ChangeEvent<{ value: string }>) => setFilters({ ...filters, sort: e.target.value })}
        campCount={filteredCamps.length}
      />
      <AddCampPanel
        open={addPanelOpen}
        onClose={() => setAddPanelOpen(false)}
        onCampAdded={handleAddCamp}
      />
      {loading ? (
        <CircularProgress />
      ) : filteredCamps.length === 0 ? (
        <NoCampsPanel onAddCamp={() => setAddPanelOpen(true)} />
      ) : (
        <CampList
          camps={filteredCamps}
          onSelect={setSelectedCamp}
          selectedCampId={selectedCamp?.id}
          onAddToPlan={handleAddToPlan}
          onEdit={handleEdit}
        />
      )}
      <CampDetails camp={selectedCamp} />
      {/* AddCampDialog removed, handled by AddCampPanel */}
      <EditCampDialog
        open={editDialogOpen}
        camp={selectedCamp}
        onSave={() => handleEditCamp(selectedCamp as Camp)}
        onDelete={handleDeleteCamp}
        onCancel={() => setEditDialogOpen(false)}
      />
      <AddToPlanDialog
        open={addToPlanDialogOpen}
        camp={selectedCamp}
        onAdd={handleConfirmAddToPlan}
        onCancel={() => setAddToPlanDialogOpen(false)}
        children={null}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        campName={selectedCamp?.name || ""}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDeleteCamp}
      />
      <ScrapeErrorDialog
        open={scrapeErrorDialogOpen}
        error={error}
        onClose={() => setScrapeErrorDialogOpen(false)}
      />
      <SnackbarFeedback
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </Box>
  );
}
// ...existing code...
