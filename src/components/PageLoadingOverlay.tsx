import React from "react";
import LoadingOverlay from "./LoadingOverlay";
import { usePageLoadingContext } from "../contexts/PageLoadingContext";

const PageLoadingOverlay: React.FC = () => {
  const { isLoading } = usePageLoadingContext();
  return <LoadingOverlay show={isLoading} />;
};

export default PageLoadingOverlay;
