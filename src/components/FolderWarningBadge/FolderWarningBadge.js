import React from "react";
import "./FolderWarningBadge.css";

const FolderWarningBadge = ({ count, show = true }) => {
  if (!show || count === 0) {
    return null;
  }

  return (
    <span className="folder-warning-badge ml-2">
      {count}
    </span>
  );
};

export default FolderWarningBadge;
