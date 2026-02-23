import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

interface AddCampDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (campName: string) => void;
}

export default function AddCampDialog({ open, onClose, onAdd }: AddCampDialogProps) {
  const [campName, setCampName] = React.useState("");

  const handleAdd = () => {
    onAdd(campName);
    setCampName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Camp</DialogTitle>
      <DialogContent>
        <TextField
          label="Camp Name"
          value={campName}
          onChange={e => setCampName(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} color="primary">Add</Button>
      </DialogActions>
    </Dialog>
  );
}
