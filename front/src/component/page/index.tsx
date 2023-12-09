import "./index.css";
import React from "react";

export const Page: React.FC<{ children: React.ReactNode }> = ({ children, }) => {
  return <div className="page">{children}</div>;
}

