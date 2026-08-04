// components/layout/PageWithPreloader.tsx
import React, { useState, useEffect } from "react";
import Preloader from "../pages/Preloader";

interface PageWithPreloaderProps {
  children: React.ReactNode;
  delay?: number;
}

const PageWithPreloader: React.FC<PageWithPreloaderProps> = ({
  children,
  delay = 7500,
}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return loading ? <Preloader /> : <>{children}</>;
};

export default PageWithPreloader;
