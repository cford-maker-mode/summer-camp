"use client";
import React from "react";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button, Box, Typography } from "@mui/material";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Typography>Loading...</Typography>;
  }

  if (session) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Typography>Signed in as {session.user?.email}</Typography>
        <Button variant="outlined" color="secondary" onClick={() => signOut()}>Sign out</Button>
      </Box>
    );
  }

  return (
    <Button variant="contained" color="primary" onClick={() => signIn("google")}>Sign in with Google</Button>
  );
}
