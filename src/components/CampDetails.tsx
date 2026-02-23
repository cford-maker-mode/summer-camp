import React from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import type { Camp } from "@/public-catalog/types";

interface CampDetailsProps {
  camp: Camp | null;
}

export default function CampDetails({ camp }: CampDetailsProps) {
  if (!camp) return <Typography>Select a camp to view details.</Typography>;

  return (
    <Box>
      <Typography variant="h5">{camp.name}</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {camp.status && <Chip label={camp.status} />}
        {camp.location && <Chip label={camp.location} />}
        {camp.ageMin && <Chip label={`Min Age: ${camp.ageMin}`} />}
        {camp.ageMax && <Chip label={`Max Age: ${camp.ageMax}`} />}
      </Stack>
      <Typography sx={{ mt: 2 }}>{camp.description}</Typography>
      {/* Add more details as needed */}
    </Box>
  );
}
