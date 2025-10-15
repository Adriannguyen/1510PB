import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Badge,
  Alert
} from 'reactstrap';
import './MailDetailsModal.css'; // Custom CSS for fixed layout
import { copyWithFeedback } from 'utils/clipboardUtils';
import { getReplyStatusFromMail } from '../../utils/replyStatusUtils';

const MailDetailsModal = ({
  isOpen,
  toggle,
  selectedMail,
  formatDate,
  getTypeColor,
  getHoursRemaining,
  getDaysExpired,
  getGroupInfo,
  getStatusBadge,
  truncateText
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!selectedMail) return null;

  // Copy subject to clipboard with fallback for non-secure contexts
  const handleCopySubject = async () => {
    if (!selectedMail.Subject) return;

    const success = await copyWithFeedback(selectedMail.Subject, {
      onSuccess: () => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 3000);
      },
      onError: (error) => {
        console.error('Failed to copy subject:', error);
      },
      showAlert: true,
      alertPrefix: 'Failed to copy subject'
    });

    if (!success) {
      console.warn('Copy operation was not successful');
    }
  };

  // Open reply link with mail ID
  const handleReply = () => {
    let mailSeq = '4171'; // Default fallback
    
    // NEW LOGIC: Check if mail is replied and has idRep
    const isReplied = getReplyStatusFromMail(selectedMail);
    if (isReplied && selectedMail.idRep) {
      mailSeq = selectedMail.idRep.toString();
    } 
    // EXISTING LOGIC: Fall back to current extraction methods
    else if (selectedMail.fileName) {
      // Extract ID from fileName (e.g., "13579.json" -> "13579")
      const match = selectedMail.fileName.match(/(\d+)\.json$/);
      if (match) {
        mailSeq = match[1];
      }
    } else if (selectedMail.id) {
      // Use mail ID if available
      mailSeq = selectedMail.id.toString();
    } else if (selectedMail.Subject) {
      // Generate a simple hash from subject as fallback
      mailSeq = Math.abs(selectedMail.Subject.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)).toString();
    }

    // Construct the reply URL
    const replyUrl = `http://uts.net/mailapp/mail-detail?isFromDetail=false&openYN=true&folderID=1&mailSeq=${mailSeq}`;

    // Open in new tab
    window.open(replyUrl, '_blank');
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Email Details
      </ModalHeader>
      <ModalBody>
        {/* Copy Success Alert */}
        {copySuccess && (
          <Alert color="success" className="mb-3">
            <i className="fas fa-check-circle mr-2" />
            Subject copied to clipboard successfully!
          </Alert>
        )}

        <p><strong>Subject:</strong> {selectedMail.Subject}</p>
        <p><strong>Sender:</strong>{' '}
          {getGroupInfo ? (
            (() => {
              const groupInfo = getGroupInfo(selectedMail.From);
              return (
                <span>
                  {groupInfo.displayName}
                </span>
              );
            })()
          ) : (
            selectedMail.From
          )}
        </p>
        {getGroupInfo && (() => {
          const groupInfo = getGroupInfo(selectedMail.From);
          if (groupInfo && groupInfo.isGroup) {
            return (
              <p>
                <n className="text-muted">
                  <b>Personal Email:</b> <i>{selectedMail.From}</i>
                </n>
              </p>
            );
          }
          return null;
        })()}
        <p><strong>Type:</strong> <Badge color={getTypeColor(selectedMail.Type)} pill>{selectedMail.Type}</Badge></p>

        {/* Mail Status - only for AllMails */}
        {getStatusBadge && (
          <p><strong>Mail Status:</strong> {getStatusBadge(selectedMail.isExpired)}</p>
        )}

        {/* Reply Status */}
        <p><strong>{getStatusBadge ? 'Reply Status' : 'Status'}:</strong>
          {selectedMail.category === "ReviewMail" ? (
            <Badge color={selectedMail.isReplied ? "success" : "info"} pill>
              {selectedMail.isReplied ? "Processed" : "Under Review"}
            </Badge>
          ) : (
            <Badge color={selectedMail.isReplied ? "success" : "warning"} pill>
              {selectedMail.isReplied ? "Replied" : "Pending"}
            </Badge>
          )}
        </p>
        <p><strong>Assigned PIC:</strong>
          {selectedMail.assignedTo ? (
            <Badge color="info" pill className="ml-2">
              {selectedMail.assignedTo.type === 'pic' ?
                `PIC: ${selectedMail.assignedTo.picName || 'Unknown'}` :
                `Group: ${selectedMail.assignedTo.groupName || 'Unknown'}`
              }
            </Badge>
          ) : (
            <Badge color="secondary" pill className="ml-2">Unassigned</Badge>
          )}
        </p>
        <p><strong>Date Sent:</strong> {formatDate(selectedMail.Date)}</p>
        
        {/* Time Since Sent - only show for review mails */}
        {selectedMail.category === "ReviewMail" && (
          <p><strong>Time Since Sent:</strong> 
            {(() => {
              if (!selectedMail.Date || !Array.isArray(selectedMail.Date) || selectedMail.Date.length === 0) {
                return "N/A";
              }

              try {
                const [date, time] = selectedMail.Date;
                let mailDate;

                if (time) {
                  // If time is provided, combine date and time
                  mailDate = new Date(`${date}T${time}`);
                } else {
                  // If only date is provided, use date
                  mailDate = new Date(date);
                }

                const currentDate = new Date();

                // Check if date is valid
                if (isNaN(mailDate.getTime())) {
                  return "N/A";
                }

                // Calculate time difference in hours
                const hoursDifference = Math.floor(
                  (currentDate - mailDate) / (1000 * 60 * 60)
                );

                if (hoursDifference < 24) {
                  // Less than 24 hours - show hours
                  if (hoursDifference <= 0) {
                    return "Just now";
                  } else if (hoursDifference === 1) {
                    return "1 hour ago";
                  } else {
                    return `${hoursDifference} hours ago`;
                  }
                } else {
                  // 24 hours or more - show days
                  const daysDifference = Math.floor(hoursDifference / 24);
                  if (daysDifference === 1) {
                    return "1 day ago";
                  } else {
                    return `${daysDifference} days ago`;
                  }
                }
              } catch (error) {
                console.error("Error calculating time since sent:", error);
                return "N/A";
              }
            })()}
          </p>
        )}

        {/* File Information */}
        

        {/* Date Move - only show for review mails */}
        {selectedMail.category === "ReviewMail" && selectedMail.dateMoved && (
          <p><strong>Date Moved to Review:</strong> {formatDate(selectedMail.dateMoved)}</p>
        )}

        {/* Reply Deadline - only show for valid mails */}
        {getHoursRemaining && (
          <p><strong>Reply Deadline:</strong>
            {(() => {
              const hoursLeft = getHoursRemaining(selectedMail.Date);
              let badgeColor = "success";
              let displayText = "";

              if (hoursLeft <= 0) {
                badgeColor = "danger";
                displayText = "Expired";
              } else if (hoursLeft <= 2) {
                badgeColor = "danger";
                displayText = `${hoursLeft} hours left`;
              } else if (hoursLeft <= 6) {
                badgeColor = "warning";
                displayText = `${hoursLeft} hours left`;
              } else {
                badgeColor = "success";
                displayText = `${hoursLeft} hours left`;
              }

              return (
                <Badge color={badgeColor} pill className="ml-2">
                  {displayText}
                </Badge>
              );
            })()}
          </p>
        )}

        {/* Days Expired - only show for expired mails */}
        {getDaysExpired && (
          <p><strong>Days Expired:</strong> <Badge color="danger" pill>{getDaysExpired(selectedMail.Date)} days</Badge></p>
        )}

        {/* Summary Content */}
        {selectedMail.SummaryContent && (
          <>
            <p><strong>Summary Content:</strong></p>
            <p
              dangerouslySetInnerHTML={{
                __html: selectedMail.SummaryContent.replace(/\n/g, '<br/>')
              }}
            />
          </>
        )}
        <hr/>
        <p><strong>File Information:</strong>
          <div className="ml-3">
            {selectedMail.id && (
              <div>
                <i className="fas fa-hashtag mr-1 text-muted"></i>
                <small className="text-muted">ID: {selectedMail.id}</small>
              </div>
            )}
            {selectedMail.fileName && (
              <div>
                <i className="fas fa-file mr-1 text-muted"></i>
                <small className="text-muted">File: {selectedMail.fileName}</small>
              </div>
            )}
            {selectedMail.filePath && (
              <div>
                <i className="fas fa-folder mr-1 text-muted"></i>
                <small className="text-muted">Path: {truncateText ? truncateText(selectedMail.filePath, 50) : selectedMail.filePath}</small>
              </div>
            )}
            <div>
              <i className="fas fa-link mr-1 text-muted"></i>
              <small className="text-muted">Mail Sequence ID:
                <Badge color="info" size="sm" className="ml-1">
                  {(() => {
                    const isReplied = getReplyStatusFromMail(selectedMail);
                    if (isReplied && selectedMail.idRep) {
                      return selectedMail.idRep.toString();
                    } else if (selectedMail.fileName) {
                      const match = selectedMail.fileName.match(/(\d+)\.json$/);
                      return match ? match[1] : 'N/A';
                    } else if (selectedMail.id) {
                      return selectedMail.id.toString();
                    } else if (selectedMail.Subject) {
                      return Math.abs(selectedMail.Subject.split('').reduce((a, b) => {
                        a = ((a << 5) - a) + b.charCodeAt(0);
                        return a & a;
                      }, 0)).toString();
                    }
                    return '4171';
                  })()}
                </Badge>
              </small>
            </div>
          </div>
        </p>
        {/* Detailed Content */}
        {selectedMail.Body && (
          <>
            <hr />
            <h5>Detailed Content:</h5>
            <div dangerouslySetInnerHTML={{ __html: selectedMail.Body }} />
          </>
        )}
      </ModalBody>
      <ModalFooter>
      <Button color="info" onClick={handleCopySubject}>
        {/* <i className="fas fa-copy mr-1" /> */}
        Copy Subject
      </Button>
      <Button color="primary" onClick={handleReply}>
        {/* <i className="fas fa-external-link-alt mr-1" /> */}
        Open in Knox Mail
      </Button>
      <Button color="secondary" onClick={toggle}>
        {/* <i className="fas fa-times mr-1" /> */}
        Close
      </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MailDetailsModal;
