import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface DeleteConfirmDialogProps {
  open: boolean;
  campName: string;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteConfirmDialog({ open, campName, onClose, onDelete }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Camp</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete "{campName}"?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete} color="error">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
