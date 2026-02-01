import { DependencyList, useCallback, useEffect, useRef, useState } from "react";
import { PaginatedResponse } from "../models/Pagination";

type LoadPageFn<T> = (page: number, limit: number) => Promise<PaginatedResponse<T> | null>;

type UseInfiniteListOptions = {
  limit?: number;
  enabled?: boolean;
};

export const useInfiniteList = <T>(
  loadPage: LoadPageFn<T>,
  deps: DependencyList = [],
  options: UseInfiniteListOptions = {}
) => {
  const limit = options.limit ?? 10;
  const enabled = options.enabled ?? true;
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const lastLoadedPageRef = useRef(0);
  const loadPageRef = useRef(loadPage);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadPageRef.current = loadPage;
  }, [loadPage]);

  const load = useCallback(
    async (targetPage: number) => {
      if (!enabled || loadingRef.current) return;
      if (targetPage <= lastLoadedPageRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      const response = await loadPageRef.current(targetPage, limit);
      if (response) {
        setItems((prev) => (targetPage === 1 ? response.data : [...prev, ...response.data]));
        setHasNext(response.hasNext && response.data.length > 0);
        setPage(targetPage + 1);
        lastLoadedPageRef.current = targetPage;
      } else {
        setHasNext(false);
      }
      setLoading(false);
      loadingRef.current = false;
    },
    [enabled, limit]
  );

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasNext(true);
    lastLoadedPageRef.current = 0;
  }, []);

  const reload = useCallback(() => {
    reset();
    load(1);
  }, [reset, load]);

  useEffect(() => {
    if (!enabled) return;
    reset();
    load(1);
  }, [enabled, reset, load, ...deps]);

  useEffect(() => {
    if (!sentinelRef.current || !enabled || !hasNext) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNext && !loading) {
          load(page);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [enabled, hasNext, loading, load, page]);

  return {
    items,
    setItems,
    loading,
    loadingMore: loading && items.length > 0,
    loadingInitial: loading && items.length === 0,
    hasNext,
    sentinelRef,
    reset,
    reload,
    loadMore: () => load(page),
  };
};
