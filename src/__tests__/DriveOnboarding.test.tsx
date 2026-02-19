import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DriveOnboarding from "../components/DriveOnboarding";
import { SessionProvider } from "next-auth/react";

describe("DriveOnboarding UI", () => {
  it("shows privacy messaging and folder selection button", () => {
    render(
      <SessionProvider session={{ user: { email: "test@example.com" }, accessToken: "token" }}>
        <DriveOnboarding />
      </SessionProvider>
    );
    expect(screen.getByText(/Connect Your Google Drive/i)).toBeInTheDocument();
    expect(screen.getByText(/personal summer camp data/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Select Drive Folder/i })).toBeInTheDocument();
  });
});
