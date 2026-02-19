import React from "react";
import { useSession } from "next-auth/react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState } from "react";

export default function DriveOnboarding({ onComplete }: { onComplete?: () => void }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(true);

  // Placeholder for folder selection logic
  const handleSelectFolder = () => {
    // TODO: Integrate Google Picker API for folder selection
    setOpen(false);
    if (onComplete) onComplete();
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Connect Your Google Drive</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          All your personal summer camp data will be stored in your own Google Drive folder. The app never stores or transmits your data to its own servers.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You will be asked to select or create a folder (e.g., "Itinerino Summer Camp Data"). You can manage your data anytime in Drive.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={handleSelectFolder} disabled={!session}>
          Select Drive Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
}
