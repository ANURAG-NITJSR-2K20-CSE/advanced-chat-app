import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { MIN_USER_SEARCH_LENGTH, USER_SEARCH_DEBOUNCE_MS } from "@/lib/ui-constants";

function isAbortError(err) {
  return (
    err?.code === "ERR_CANCELED" ||
    err?.name === "CanceledError" ||
    axios.isCancel?.(err)
  );
}

/**
 * Debounced user search with stale-request cancellation.
 */
export function useDebouncedUserSearch(query, token, enabled) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const runSearch = useCallback(
    async (raw) => {
      const trimmed = raw.trim();
      if (!token || trimmed.length < MIN_USER_SEARCH_LENGTH) {
        abortRef.current?.abort();
        setResults([]);
        setSearchError(null);
        setIsSearching(false);
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsSearching(true);
      setSearchError(null);
      try {
        const { data } = await axios.get(`/api/user?search=${encodeURIComponent(trimmed)}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isAbortError(err)) return;
        setResults([]);
        setSearchError(err.response?.data?.message || "Could not search users.");
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    if (!enabled || !token) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return undefined;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, USER_SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, enabled, token, runSearch]);

  const executeNow = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(query);
  }, [query, runSearch]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { results, isSearching, searchError, executeNow };
}
