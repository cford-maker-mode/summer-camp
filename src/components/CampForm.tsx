import React from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import type { Camp } from "@/public-catalog/types";

interface CampFormProps {
  initialCamp?: Camp;
  onSubmit: (camp: Camp) => void;
  onCancel: () => void;
}

export default function CampForm({ initialCamp, onSubmit, onCancel }: CampFormProps) {
  const [name, setName] = React.useState(initialCamp?.name || "");
  const [location, setLocation] = React.useState(initialCamp?.location || "");
  const [description, setDescription] = React.useState(initialCamp?.description || "");

  const handleSubmit = () => {
    onSubmit({ ...initialCamp, name, location, description });
  };

  return (
    <Box>
      <Stack spacing={2}>
        <TextField label="Camp Name" value={name} onChange={e => setName(e.target.value)} fullWidth />
        <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} fullWidth />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth multiline rows={4} />
        <Stack direction="row" spacing={2}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Save</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
