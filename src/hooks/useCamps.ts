import { useState, useEffect } from "react";
import type { Camp, ScrapedCampData } from "@/public-catalog/types";
import { loadPublicCampCatalog } from "@/public-catalog";

export function useCamps() {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCamps() {
      setLoading(true);
      try {
        const data = await loadPublicCampCatalog();
        setCamps(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load camps");
      } finally {
        setLoading(false);
      }
    }
    fetchCamps();
  }, []);

  // Add more camp-related logic (add, delete, scrape, etc.) as needed

  return { camps, loading, error, setCamps };
}
