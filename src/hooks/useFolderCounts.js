import { useMailContext } from "contexts/MailContext";
import { getReviewMailStatus } from "utils/replyStatusUtils.js";

export const useFolderCounts = () => {
  const { mails } = useMailContext();

  // Đếm mail trong thư mục DungHan/mustRep (sửa từ rep thành mustRep)
  const dungHanMustRepCount = mails.filter(
    (mail) => mail.category === "DungHan" && mail.status === "mustRep"
  ).length;

  // Đếm mail trong thư mục QuaHan/chuaRep  
  const quaHanChuaRepCount = mails.filter(
    (mail) => mail.category === "QuaHan" && mail.status === "chuaRep"
  ).length;

  // Đếm mail trong thư mục ReviewMail/pending
  const reviewMailPendingCount = mails.filter(
    (mail) => {
      // Sử dụng hàm getReviewMailStatus để xác định trạng thái pending
      const reviewStatus = getReviewMailStatus(mail);
      return mail.category === "ReviewMail" && reviewStatus === "pending";
    }
  ).length;

  // Debug logging chi tiết để kiểm tra
  const reviewMails = mails.filter(mail => mail.category === "ReviewMail");
  const reviewMailsWithStatus = reviewMails.map(mail => ({
    subject: mail.Subject?.substring(0, 30),
    status: mail.status,
    filePath: mail.filePath,
    reviewStatus: getReviewMailStatus(mail)
  }));

  console.log("📊 Folder Counts Debug:", {
    dungHanMustRepCount,
    quaHanChuaRepCount,
    reviewMailPendingCount,
    totalMails: mails.length,
    totalReviewMails: reviewMails.length,
    reviewMailsWithStatus,
    pendingMails: mails.filter(mail => mail.status === "pending"),
    reviewMailPending: mails.filter(mail => mail.category === "ReviewMail" && getReviewMailStatus(mail) === "pending")
  });

  return {
    dungHanMustRepCount, // Đổi tên biến cho chính xác
    quaHanChuaRepCount,
    reviewMailPendingCount,
    totalWarningCount: dungHanMustRepCount + quaHanChuaRepCount + reviewMailPendingCount,
    hasWarnings: dungHanMustRepCount > 0 || quaHanChuaRepCount > 0 || reviewMailPendingCount > 0
  };
};
