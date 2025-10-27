import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Badge,
  Alert,
  Spinner,
  Card,
  CardBody,
} from "reactstrap";
import { API_BASE_URL } from "constants/api";

const AddSenderToGroupModal = ({ isOpen, toggle, senderEmail, onSuccess }) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load groups when modal opens
  useEffect(() => {
    if (isOpen && senderEmail) {
      loadGroups();
      setError("");
      setSuccess("");
    }
  }, [isOpen, senderEmail]);

  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`);
      if (!response.ok) {
        throw new Error("Failed to load groups");
      }
      const data = await response.json();

      // Filter out groups that already have this sender
      const availableGroups = data.filter(
        (group) => !group.members || !group.members.includes(senderEmail)
      );

      // Separate groups that already contain this sender
      const existingGroups = data.filter(
        (group) => group.members && group.members.includes(senderEmail)
      );

      setGroups({ available: availableGroups, existing: existingGroups });
    } catch (err) {
      console.error("Error loading groups:", err);
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedGroups.length === 0) {
      setError("Please select at least one group");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Add sender to each selected group
      const promises = selectedGroups.map(async (groupId) => {
        const group = groups.available.find((g) => g.id === groupId);
        if (!group) return;

        // Add sender to group members
        const updatedMembers = [...(group.members || []), senderEmail];

        const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...group,
            members: updatedMembers,
            updatedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update group ${group.name}`);
        }

        return await response.json();
      });

      await Promise.all(promises);

      setSuccess(
        `Successfully added sender to ${selectedGroups.length} group(s)!`
      );

      // Wait a moment to show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      }, 1500);
    } catch (err) {
      console.error("Error adding sender to groups:", err);
      setError(
        err.message || "Failed to add sender to groups. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedGroups([]);
    setError("");
    setSuccess("");
    toggle();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg" className="compact-modal">
      <ModalHeader toggle={handleClose}>
        Add Sender to Group
      </ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {/* Sender Info */}
          <Card className="bg-gradient-secondary shadow-sm mb-3">
            <CardBody className="p-3">
              <div className="d-flex align-items-center">
                <div className="avatar bg-white rounded-circle mr-3">
                  <span className="text-primary font-weight-bold">
                    <i className="ni ni-email-83"></i>
                  </span>
                </div>
                <div>
                  <h5 className="mb-0">Sender Email</h5>
                  <p className="mb-0 text-sm font-weight-bold text-primary">
                    {senderEmail}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Error/Success Messages */}
          {error && (
            <Alert color="danger" className="py-2">
              <i className="ni ni-support-16 mr-2"></i>
              <small>{error}</small>
            </Alert>
          )}

          {success && (
            <Alert color="success" className="py-2">
              <i className="ni ni-check-bold mr-2"></i>
              <small>{success}</small>
            </Alert>
          )}

          {/* Existing Groups */}
          {groups.existing && groups.existing.length > 0 && (
            <div className="mb-4">
              <Label className="form-control-label">
                <i className="ni ni-check-bold text-success mr-2"></i>
                Already in Groups
              </Label>
              <div className="d-flex flex-wrap gap-2">
                {groups.existing.map((group) => (
                  <Badge
                    key={group.id}
                    color="success"
                    pill
                    className="px-3 py-2"
                  >
                    <i className="ni ni-building mr-1"></i>
                    {group.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Groups to Add */}
          <FormGroup>
            <Label className="form-control-label">
              Select Groups to add Sender
            </Label>

            {loadingGroups ? (
              <div className="text-center py-4">
                <Spinner color="primary" />
                <p className="mt-2 text-muted">Loading groups...</p>
              </div>
            ) : groups.available && groups.available.length > 0 ? (
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  border: "1px solid #e9ecef",
                  borderRadius: "0.375rem",
                  padding: "0.75rem",
                }}
              >
                {groups.available.map((group) => (
                  <div
                    key={group.id}
                    className="custom-control custom-checkbox mb-2"
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #e9ecef",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      backgroundColor: selectedGroups.includes(group.id)
                        ? "#f6f9fc"
                        : "white",
                      transition: "all 0.2s",
                    }}
                    onClick={() => handleGroupToggle(group.id)}
                  >
                    <Input
                      type="checkbox"
                      id={`group-${group.id}`}
                      className="custom-control-input"
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                    />
                    <Label
                      className="custom-control-label mb-0"
                      htmlFor={`group-${group.id}`}
                      style={{ cursor: "pointer", width: "100%" }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{group.name}</strong>
                          {group.pic && (
                            <span className="ml-2 text-sm text-muted">
                              PIC: {group.pic}
                            </span>
                          )}
                        </div>
                        <Badge color="info" pill>
                          {group.members ? group.members.length : 0} members
                        </Badge>
                      </div>
                      {group.description && (
                        <small className="text-muted d-block mt-1">
                          {group.description}
                        </small>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <Alert color="info" className="py-3">
                <i className="ni ni-info-circle mr-2"></i>
                <small>
                  No available groups found. This sender is already in all
                  groups or no groups exist yet.
                </small>
              </Alert>
            )}
          </FormGroup>

          {/* Selection Summary */}
          {selectedGroups.length > 0 && (
            <Alert color="primary" className="py-2 mt-3">
              <i className="ni ni-check-bold mr-2"></i>
              <small>
                <strong>{selectedGroups.length}</strong> group(s) selected
              </small>
            </Alert>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="primary"
            type="submit"
            disabled={loading || selectedGroups.length === 0}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Adding...
              </>
            ) : (
              <>
                {/* <i className="ni ni-check-bold mr-2"></i> */}
                Add to {selectedGroups.length} Group(s)
              </>
            )}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AddSenderToGroupModal;
