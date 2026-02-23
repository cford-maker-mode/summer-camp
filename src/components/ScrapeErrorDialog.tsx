import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

interface ScrapeErrorDialogProps {
  open: boolean;
  error: string | null;
  warning?: string | null;
  onClose: () => void;
}

export default function ScrapeErrorDialog({ open, error, warning, onClose }: ScrapeErrorDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Scrape Error</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        {warning && <Typography color="warning.main">{warning}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
