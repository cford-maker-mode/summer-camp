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
import CampDetails from "@/components/CampDetails";
import CampForm from "@/components/CampForm";
import AddCampDialog from "@/components/AddCampDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import ScrapeErrorDialog from "@/components/ScrapeErrorDialog";

export default function CampsPage() {
  const { camps, loading, error, setCamps } = useCamps();
  const [selectedCamp, setSelectedCamp] = React.useState<Camp | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [scrapeErrorDialogOpen, setScrapeErrorDialogOpen] = React.useState(false);

  const SUMMER_ID = "summer-2026";

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

  const handleAddCamp = (campData) => {
    // Add new camp to camps state
    setCamps(prev => [...prev, { ...campData, id: `camp-${Date.now()}` }]);
    setAddDialogOpen(false);
  };

  const handleDeleteCamp = () => {
    // Delete selected camp
    if (selectedCamp) {
      setCamps(prev => prev.filter(c => c.id !== selectedCamp.id));
      setSelectedCamp(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleAddToPlan = (camp) => {
    // Placeholder: Add camp to user's plan
    alert(`Added ${camp.name} to plan!`);
  };

  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const handleEdit = (camp) => {
    setSelectedCamp(camp);
    setEditDialogOpen(true);
  };

  const handleEditCamp = (campData) => {
    setCamps(prev => prev.map(c => c.id === campData.id ? { ...c, ...campData } : c));
    setSelectedCamp(campData);
    setEditDialogOpen(false);
  };

  const handleScrapeError = (error) => {
    setScrapeErrorDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4">Camps</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <CampList
          camps={camps}
          onSelect={setSelectedCamp}
          selectedCampId={selectedCamp?.id}
          onAddToPlan={handleAddToPlan}
          onEdit={handleEdit}
        />
      )}
      <CampDetails camp={selectedCamp} />
      <Button onClick={() => setAddDialogOpen(true)}>Add Camp</Button>
      <AddCampDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddCamp}
      />
      <CampForm
        open={editDialogOpen}
        camp={selectedCamp}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditCamp}
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


