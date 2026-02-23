import React from "react";
import { Box, Typography, Card, CardContent, Chip, Button, IconButton } from "@mui/material";
import { Edit as EditIcon, CalendarToday as CalendarIcon } from "@mui/icons-material";
import type { Camp } from "@/public-catalog/types";

interface CampListProps {
  camps: Camp[];
  onSelect: (camp: Camp) => void;
  selectedCampId?: string;
  onAddToPlan?: (camp: Camp) => void;
  onEdit?: (camp: Camp) => void;
}

export default function CampList({ camps, onSelect, selectedCampId, onAddToPlan, onEdit }: CampListProps) {
  return (
    <Box>
      <Typography variant="h6">Camps</Typography>
      {camps.map(camp => (
        <CampCard
          key={camp.id}
          camp={camp}
          selected={camp.id === selectedCampId}
          onSelect={() => onSelect(camp)}
          onAddToPlan={onAddToPlan}
          onEdit={onEdit}
        />
      ))}
    </Box>
  );
}

function CampCard({ camp, selected, onSelect, onAddToPlan, onEdit }: {
  camp: Camp;
  selected?: boolean;
  onSelect: () => void;
  onAddToPlan?: (camp: Camp) => void;
  onEdit?: (camp: Camp) => void;
}) {
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
    return grades || ages;
  };

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
    <Card
      sx={{ mb: 2, border: selected ? "2px solid #1976d2" : undefined }}
      onClick={onSelect}
    >
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
            {onAddToPlan && (
              <Button size="small" variant="outlined" onClick={e => { e.stopPropagation(); onAddToPlan(camp); }}>
                Add to Plan
              </Button>
            )}
            {onEdit && (
              <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit(camp); }}>
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
