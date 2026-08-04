import React, { useState, useEffect } from "react";
import Preloader from "./Preloader";

const withPreloader = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 8000); // 8 seconds
      return () => clearTimeout(timer);
    }, []);

    return loading ? <Preloader /> : <WrappedComponent {...props} />;
  };
};

export default withPreloader;
