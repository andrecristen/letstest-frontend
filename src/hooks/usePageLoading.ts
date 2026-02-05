import { useEffect } from "react";
import { usePageLoadingContext } from "../contexts/PageLoadingContext";

export const usePageLoading = (isLoading: boolean) => {
  const { setLoading } = usePageLoadingContext();

  useEffect(() => {
    setLoading(isLoading);
    return () => setLoading(false);
  }, [isLoading, setLoading]);
};
