// Centralized feature flag management for the app
// Add new feature switches here as needed

export type FeatureFlags = {
  aiWebScraper: boolean;
  // Add more feature flags here
};

// Default feature flags (can be overridden by env, config, etc.)
export const featureFlags: FeatureFlags = {
  aiWebScraper: false, // Web scraper disabled
  aiCampExtractor: true, // Enable AI-powered camp extraction (Claude)
};

// Utility to check if a feature is enabled
export function isFeatureEnabled<K extends keyof FeatureFlags>(feature: K): boolean {
  return featureFlags[feature];
}
