// Helper function to determine reply status from folder structure
// This replaces the isReplied field with folder-based logic

export const getReplyStatusFromMail = (mail) => {
  // For ReviewMail - ALWAYS determine from folder path, never use isReplied field
  if (mail.category === "ReviewMail") {
    if (mail.filePath) {
      return (
        mail.filePath.includes("/processed/") ||
        mail.filePath.includes("\\processed\\")
      );
    }
    // Fallback to status field only if filePath not available
    return mail.status === "processed";
  }

  // For other categories, use explicit isReplied field if it matches folder structure
  if (mail.category === "DungHan") {
    // For DungHan, check folder path first, then status field
    if (mail.filePath) {
      return (
        mail.filePath.includes("/rep/") || mail.filePath.includes("\\rep\\")
      );
    }
    return mail.status === "rep"; // DungHan/rep = replied, DungHan/mustRep = not replied
  } else if (mail.category === "QuaHan") {
    // For QuaHan, check folder path first, then status field
    if (mail.filePath) {
      return (
        mail.filePath.includes("/daRep/") || mail.filePath.includes("\\daRep\\")
      );
    }
    return mail.status === "daRep"; // QuaHan/daRep = replied, QuaHan/chuaRep = not replied
  }

  // For other categories, use isReplied field if available
  if (mail.isReplied !== undefined) {
    return mail.isReplied;
  }

  // Analyze filePath as final fallback
  if (mail.filePath) {
    return (
      mail.filePath.includes("/rep/") ||
      mail.filePath.includes("\\rep\\") ||
      mail.filePath.includes("/daRep/") ||
      mail.filePath.includes("\\daRep\\") ||
      mail.filePath.includes("/processed/") ||
      mail.filePath.includes("\\processed\\")
    );
  }

  return false; // Default to not replied
};

// Helper function to get folder status from reply status
export const getFolderStatusFromReply = (category, isReplied) => {
  if (category === "DungHan") {
    return isReplied ? "rep" : "mustRep";
  } else if (category === "QuaHan") {
    return isReplied ? "daRep" : "chuaRep";
  }
  return "mustRep"; // Default fallback
};

// Helper to determine if mail should be considered "replied" for filtering
export const isMailReplied = (mail) => {
  return getReplyStatusFromMail(mail);
};

// Helper to get ReviewMail status from folder path
export const getReviewMailStatus = (mail) => {
  if (mail.category !== "ReviewMail") {
    return null;
  }

  if (mail.filePath) {
    if (
      mail.filePath.includes("/processed/") ||
      mail.filePath.includes("\\processed\\")
    ) {
      return "processed";
    } else if (
      mail.filePath.includes("/pending/") ||
      mail.filePath.includes("\\pending\\")
    ) {
      return "pending";
    }
  }

  // Fallback to status field if available
  return mail.status || "pending";
};

/**
 * Calculate Original Category for Review Mails based on Date sent
 * Logic:
 * - If mail was sent within last 23h59m (< 24 hours) → On-time
 * - If mail was sent 24+ hours ago → Overdue
 *
 * @param {Object} mail - Mail object with Date field
 * @returns {Object} - { text: "On-time"|"Overdue", color: "success"|"danger" }
 */
export const calculateOriginalCategory = (mail) => {
  try {
    if (!mail.Date) {
      return { text: "Unknown", color: "secondary" };
    }

    // Parse mail date
    const mailDate = new Date(mail.Date);
    if (isNaN(mailDate.getTime())) {
      console.warn("Invalid mail date:", mail.Date);
      return { text: "Unknown", color: "secondary" };
    }

    // Get current time
    const currentDate = new Date();

    // Calculate time difference in milliseconds
    const timeDifference = currentDate - mailDate;

    // Convert to hours
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    // 23h59m = 23.983333... hours (approximately 24 hours)
    const THRESHOLD_HOURS = 24;

    if (hoursDifference < THRESHOLD_HOURS) {
      // Within 23h59m → On-time
      return { text: "On-time", color: "success" };
    } else {
      // Over 24 hours → Overdue
      return { text: "Overdue", color: "danger" };
    }
  } catch (error) {
    console.error("Error calculating original category:", error);
    return { text: "Unknown", color: "secondary" };
  }
};

/**
 * Get Original Category for Review Mails
 * First checks originalCategory field, then calculates from Date sent
 *
 * @param {Object} mail - Mail object
 * @returns {Object} - { text: "Valid"|"Expired"|"Unknown", color: string }
 */
export const getOriginalCategory = (mail) => {
  // If originalCategory is explicitly set from backend (auto-updated hourly)
  if (mail.originalCategory) {
    if (mail.originalCategory === "Valid") {
      return { text: "On-time", color: "success" };
    } else if (mail.originalCategory === "Expired") {
      return { text: "Overdue", color: "danger" };
    }
    // Legacy support for old format
    if (mail.originalCategory === "DungHan") {
      return { text: "On-time", color: "success" };
    } else if (mail.originalCategory === "QuaHan") {
      return { text: "Overdue", color: "danger" };
    }
  }

  // Fallback: Calculate from Date sent if originalCategory not set
  return calculateOriginalCategory(mail);
};
