"use client";

import { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as CampsIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as SignupIcon,
  DirectionsCar as LogisticsIcon,
} from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  disabled?: boolean;
  phase?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <DashboardIcon />, href: "/dashboard", disabled: true, phase: "P2" },
  { label: "Camps", icon: <CampsIcon />, href: "/camps" },
  { label: "Summer Plan", icon: <CalendarIcon />, href: "/plan" },
  { label: "Signup Tasks", icon: <SignupIcon />, href: "/signup-tasks" },
  { label: "Logistics", icon: <LogisticsIcon />, href: "/logistics", disabled: true, phase: "P2" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          overflow: "hidden",
          height: { xs: 56, sm: 64 },
          position: "relative",
        }}
      >
        <Image
          src="/logo.jpg"
          alt="Summer Camp Planner"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={item.disabled ? "div" : Link}
              href={item.disabled ? undefined : item.href}
              selected={pathname === item.href}
              disabled={item.disabled}
              sx={{
                opacity: item.disabled ? 0.5 : 1,
                "&.Mui-selected": {
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              {item.phase && (
                <Typography variant="caption" color="text.secondary">
                  ({item.phase})
                </Typography>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Summer Camp Planner
          </Typography>
          <Typography variant="body2" sx={{ ml: 2, color: "text.secondary" }}>
            2026
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          backgroundColor: "background.default",
          minHeight: "100vh",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
