import React from "react";
import {
  Table,
  Badge,
  Media,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
} from "reactstrap";
import DecryptedSender from "../DecryptedSender/DecryptedSender";
import {
  getReplyStatusFromMail,
  getOriginalCategory,
} from "../../utils/replyStatusUtils";

const MailTable = ({
  mails,
  getTypeColor,
  getGroupInfo,
  formatDate,
  getHoursRemaining,
  getDaysExpired,
  getTimeSinceSent,
  truncateText,
  handleViewDetails,
  handleAssignMail,
  handleMoveToReview, // New prop for move to review functionality
  handleMoveBack, // New prop for move back from review functionality
  onStatusClick, // New prop for status click functionality
  onSenderClick, // New prop for sender click functionality
  mailType = "valid", // 'valid', 'expired', 'review', 'all'
  // New props for checkbox functionality
  selectedMails = [],
  onSelectMail,
  onSelectAll,
  showCheckboxes = false,
}) => {
  // Sticky styles for checkbox column
  const stickyCheckboxStyle = {
    position: "sticky",
    left: 0,
    zIndex: 10,
    backgroundColor: "white",
    minWidth: "60px",
    maxWidth: "60px",
    width: "60px",
  };
  // Debug log to check props
  console.log("🔧 MailTable props:", {
    mailType,
    handleMoveToReview: typeof handleMoveToReview,
    handleMoveBack: typeof handleMoveBack,
    mailsCount: mails?.length,
  });

  const renderReplyDeadline = (mail) => {
    // Check if mail is replied - if so, hide deadline completely EXCEPT for review mails
    const isReplied = getReplyStatusFromMail(mail);
    if (isReplied && mailType !== "review") {
      return null;
    }

    if (mailType === "expired") {
      // For expired mails, show days expired
      const daysExpired = getDaysExpired ? getDaysExpired(mail.Date) : 0;
      return (
        <Badge color="danger" pill>
          {daysExpired} days expired
        </Badge>
      );
    } else if (mailType === "valid" && getHoursRemaining) {
      // For valid mails, show hours remaining
      const hoursLeft = getHoursRemaining(mail.Date);
      let badgeColor = "success";
      let displayText = "";

      if (hoursLeft <= 0) {
        badgeColor = "danger";
        displayText = "Overdue";
      } else if (hoursLeft <= 2) {
        badgeColor = "danger";
        displayText = `${hoursLeft}h left`;
      } else if (hoursLeft <= 6) {
        badgeColor = "warning";
        displayText = `${hoursLeft}h left`;
      } else {
        badgeColor = "success";
        displayText = `${hoursLeft}h left`;
      }

      return (
        <Badge color={badgeColor} pill>
          {displayText}
        </Badge>
      );
    } else if (mailType === "review") {
      // For review mails, ALWAYS show formatted date (Date Sent) regardless of reply status
      return (
        <span className="text-sm text-muted">{formatDate(mail.Date)}</span>
      );
    } else {
      // For all mails or fallback, show formatted date
      return (
        <span className="text-sm text-muted">{formatDate(mail.Date)}</span>
      );
    }
  };

  const renderStatus = (mail) => {
    const isReplied = getReplyStatusFromMail(mail);

    if (mail.category === "ReviewMail") {
      return (
        <Badge
          color={isReplied ? "success" : "info"}
          pill
          style={{ cursor: onStatusClick ? "pointer" : "default" }}
          onClick={() => onStatusClick && onStatusClick(mail)}
        >
          {isReplied ? "Processed" : "Pending"}
        </Badge>
      );
    } else {
      return (
        <Badge color={isReplied ? "success" : "warning"} pill>
          {isReplied ? "Replied" : "Unreplied"}
        </Badge>
      );
    }
  };

  const getDeadlineColumnTitle = () => {
    switch (mailType) {
      case "expired":
        return "Days Expired";
      case "valid":
        return "Reply Deadline";
      case "review":
        return "Date";
      case "all":
        return "Date";
      default:
        return "Date";
    }
  };

  return (
    <div className="mail-table-container">
      <Table className="align-items-center table-flush" responsive>
      <thead className="thead-light">
        <tr>
          {showCheckboxes && (
            <th
              scope="col"
              className="sticky-checkbox"
              style={{
                ...stickyCheckboxStyle,
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <Input
                type="checkbox"
                onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                checked={
                  selectedMails.length > 0 &&
                  selectedMails.length === mails.length
                }
                style={{ margin: "0 auto" }}
              />
            </th>
          )}
          <th scope="col">Subject</th>
          <th scope="col">Sender</th>
          <th scope="col">Type</th>
          <th scope="col">Reply Status</th>
          <th scope="col">Assigned PIC</th>
          {mailType !== "review" && mailType !== "all" && (
            <th scope="col">Date</th>
          )}
          <th scope="col">{getDeadlineColumnTitle()}</th>
                {mailType === "review" && <th scope="col">Category</th>}
          <th scope="col" />
        </tr>
      </thead>
      <tbody>
        {mails.map((mail, index) => {
          const mailId = mail.id || `${mail.Subject}-${mail.From}`;
          const isSelected = selectedMails.includes(mailId);
          // Create unique key using index, fileName and filePath to ensure uniqueness
          const uniqueKey = `${index}-${mail.fileName || mailId}-${
            mail.filePath || ""
          }`.replace(/[^a-zA-Z0-9-_]/g, "-");

          return (
            <tr key={uniqueKey}>
              {showCheckboxes && (
                <td
                  className="sticky-checkbox"
                  style={{
                    ...stickyCheckboxStyle,
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <Input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      onSelectMail && onSelectMail(mailId, e.target.checked)
                    }
                    style={{ margin: "0 auto" }}
                  />
                </td>
              )}
              <th scope="row">
                <Media className="align-items-center">
                  <Media>
                    <span
                      className="mb-0 text-sm font-weight-bold text-primary cursor-pointer"
                      onClick={() =>
                        handleViewDetails && handleViewDetails(mail)
                      }
                      style={{ cursor: "pointer" }}
                      title="Click to view details"
                    >
                      {truncateText(mail.Subject, 30)}
                      {(() => {
                        // Show NEW icon for DungHan/mustRep unread mails
                        const shouldShowNew =
                          mail &&
                          mail.category === "DungHan" &&
                          mail.status === "mustRep" &&
                          !mail.isRead;

                        if (shouldShowNew) {
                          return (
                            <Badge
                              color="danger"
                              pill
                              className="ml-2"
                              style={{
                                fontSize: "0.6rem",
                                animation: "pulse 2s infinite",
                              }}
                            >
                              NEW
                            </Badge>
                          );
                        }
                        return null;
                      })()}
                    </span>
                  </Media>
                </Media>
              </th>
              <td>
                {(() => {
                  const groupInfo = getGroupInfo(mail.From);
                  if (groupInfo.isGroup) {
                    return (
                      <div>
                        <span
                          className="font-weight-bold"
                          title={`Group: ${groupInfo.displayName}`}
                        >
                          {truncateText(groupInfo.displayName, 30)}
                        </span>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        onClick={() =>
                          onSenderClick && onSenderClick(mail.From)
                        }
                        style={{
                          cursor: onSenderClick ? "pointer" : "default",
                        }}
                        title={
                          onSenderClick ? "Click to add sender to group" : ""
                        }
                      >
                        <DecryptedSender
                          encryptedFrom={mail.From}
                          fallbackText="Unknown Sender"
                          showEncrypted={false}
                          className="text-muted"
                        />
                        {onSenderClick && (
                          <Badge
                            color="light"
                            pill
                            className="ml-1"
                            style={{ fontSize: "0.65rem" }}
                          >
                            <i className="ni ni-fat-add"></i>
                          </Badge>
                        )}
                      </div>
                    );
                  }
                })()}
              </td>
              <td>
                <Badge color="" pill>
                  {mail.Type}
                </Badge>
              </td>
              <td>{renderStatus(mail)}</td>
              <td>
                {mail.assignedTo ? (
                  <div
                    onClick={() => handleAssignMail && handleAssignMail(mail)}
                    style={{ cursor: "pointer" }}
                    title="Click to reassign"
                  >
                    <div className="text-sm">
                      {mail.assignedTo.type === "pic" ? (
                        <span className="font-weight-bold text-primary">
                          {mail.assignedTo.picName || "Unknown PIC"}
                        </span>
                      ) : (
                        <span className="font-weight-bold text-info">
                          {mail.assignedTo.groupName || "Unknown Group"}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Badge
                    color="secondary"
                    pill
                    onClick={() => handleAssignMail && handleAssignMail(mail)}
                    style={{ cursor: "pointer" }}
                    title="Click to assign"
                  >
                    Unassigned
                  </Badge>
                )}
              </td>
              {mailType !== "review" && mailType !== "all" && (
                <td>
                  <span className="text-sm text-muted">
                    {formatDate(mail.Date)}
                  </span>
                </td>
              )}
              <td>{renderReplyDeadline(mail)}</td>
              {mailType === "review" && (
                <td>
                  {(() => {
                    // Check reply status - only show OG Category if status is "Pending"
                    const isReplied = getReplyStatusFromMail(mail);
                    
                    // Hide OG Category if Reply Status is "Processed" (isReplied = true)
                    if (isReplied) {
                      return null;
                    }
                    
                    // Show OG Category only when Reply Status is "Pending" (isReplied = false)
                    // Use getOriginalCategory utility function
                    // This reads mail.originalCategory or calculates from Date sent
                    const status = getOriginalCategory(mail);

                    return (
                      <Badge color={status.color} pill>
                        {status.text}
                      </Badge>
                    );
                  })()}
                </td>
              )}
              <td className="text-right">
                <UncontrolledDropdown>
                  <DropdownToggle
                    className="btn-icon-only text-light"
                    href="#pablo"
                    role="button"
                    size="sm"
                    color=""
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="fas fa-ellipsis-v" />
                  </DropdownToggle>
                  <DropdownMenu
                    className="dropdown-menu-arrow mail-actions-dropdown"
                    right
                    style={{ zIndex: 1080 }}
                  >
                    <DropdownItem
                      href="#pablo"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewDetails(mail);
                      }}
                    >
                      <i className="fas fa-list-ul mr-2" />
                      Details
                    </DropdownItem>
                    <DropdownItem
                      href="#pablo"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAssignMail(mail);
                      }}
                    >
                      <i className="fas fa-user-plus mr-2" />
                      Assign to PIC
                    </DropdownItem>
                    {(() => {
                      const shouldShowMoveToReview =
                        (mailType === "valid" || mailType === "expired") &&
                        handleMoveToReview &&
                        mail.Subject &&
                        mail.From;

                      console.log("🔍 Move to Review button check:", {
                        mailType,
                        hasHandler: !!handleMoveToReview,
                        hasSubject: !!mail.Subject,
                        hasFrom: !!mail.From,
                        shouldShow: shouldShowMoveToReview,
                        mailId: mail.id,
                      });

                      return shouldShowMoveToReview ? (
                        <DropdownItem
                          href="#pablo"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log(
                              "🔄 Move to Review clicked for mail:",
                              mail.Subject
                            );
                            console.log("📧 Mail data:", mail);
                            console.log(
                              "🎯 handleMoveToReview function:",
                              typeof handleMoveToReview
                            );
                            try {
                              handleMoveToReview(mail);
                            } catch (error) {
                              console.error(
                                "❌ Error in handleMoveToReview:",
                                error
                              );
                            }
                          }}
                        >
                          <i className="fas fa-arrow-down mr-2" />
                          Move to Review
                        </DropdownItem>
                      ) : null;
                    })()}
                    {mailType === "review" && handleMoveBack && (
                      <DropdownItem
                        href="#pablo"
                        onClick={(e) => {
                          e.preventDefault();
                          handleMoveBack(mail);
                        }}
                      >
                        <i className="fas fa-arrow-up mr-2" />
                        Move Back
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </td>
            </tr>
          );
        })}
      </tbody>
      </Table>
    </div>
  );
};

export default MailTable;
