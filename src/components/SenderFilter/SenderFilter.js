import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  FormGroup,
  Label,
  Popover,
  PopoverBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { useGroupContext } from "contexts/GroupContext";
import "./SenderFilter.css";

/**
 * Sender Filter Component with Group and Personal Email tabs
 * 
 * Features:
 * - Tab 1: Filter by Group Sender
 * - Tab 2: Filter by Personal Email (filtered by selected groups)
 * - Search functionality in both tabs
 * - Checkbox selection
 */
const SenderFilter = ({
  mails = [],
  selectedGroups = [],
  selectedPersonalEmails = [],
  onApply,
  onClear,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelectedGroups, setLocalSelectedGroups] = useState([...selectedGroups]);
  const [localSelectedEmails, setLocalSelectedEmails] = useState([...selectedPersonalEmails]);
  const targetRef = useRef(null);
  const { groups, getGroupInfo } = useGroupContext();

  useEffect(() => {
    setLocalSelectedGroups([...selectedGroups]);
    setLocalSelectedEmails([...selectedPersonalEmails]);
  }, [selectedGroups, selectedPersonalEmails]);

  const toggle = () => setPopoverOpen(!popoverOpen);
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setSearchTerm("");
    }
  };

  // Get unique groups from mails
  const getUniqueGroups = () => {
    const groupSet = new Set();
    
    mails.forEach((mail) => {
      const sender = mail.From || mail.from || mail.EncryptedFrom;
      if (sender) {
        const groupInfo = getGroupInfo(sender);
        if (groupInfo && groupInfo.groupName) {
          groupSet.add(JSON.stringify({
            id: groupInfo.groupId,
            name: groupInfo.groupName,
          }));
        }
      }
    });

    return Array.from(groupSet).map(item => JSON.parse(item))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get unique personal emails (filtered by selected groups if any)
  const getUniqueEmails = () => {
    const emailSet = new Set();
    
    mails.forEach((mail) => {
      const sender = mail.From || mail.from || mail.EncryptedFrom;
      if (sender) {
        // If groups are selected, only show emails from those groups
        if (localSelectedGroups.length > 0) {
          const groupInfo = getGroupInfo(sender);
          if (groupInfo && localSelectedGroups.includes(groupInfo.groupId)) {
            emailSet.add(sender);
          }
        } else {
          // No group filter, show all emails
          emailSet.add(sender);
        }
      }
    });

    return Array.from(emailSet).sort((a, b) => a.localeCompare(b));
  };

  const uniqueGroups = getUniqueGroups();
  const uniqueEmails = getUniqueEmails();

  // Filter groups based on search
  const filteredGroups = uniqueGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter emails based on search
  const filteredEmails = uniqueEmails.filter((email) =>
    email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle group checkbox
  const handleGroupCheckbox = (groupId) => {
    if (localSelectedGroups.includes(groupId)) {
      setLocalSelectedGroups(localSelectedGroups.filter((id) => id !== groupId));
    } else {
      setLocalSelectedGroups([...localSelectedGroups, groupId]);
    }
  };

  // Handle email checkbox
  const handleEmailCheckbox = (email) => {
    if (localSelectedEmails.includes(email)) {
      setLocalSelectedEmails(localSelectedEmails.filter((e) => e !== email));
    } else {
      setLocalSelectedEmails([...localSelectedEmails, email]);
    }
  };

  // Handle select all groups
  const handleSelectAllGroups = () => {
    if (localSelectedGroups.length === filteredGroups.length) {
      setLocalSelectedGroups([]);
    } else {
      setLocalSelectedGroups(filteredGroups.map((g) => g.id));
    }
  };

  // Handle select all emails
  const handleSelectAllEmails = () => {
    if (localSelectedEmails.length === filteredEmails.length) {
      setLocalSelectedEmails([]);
    } else {
      setLocalSelectedEmails([...filteredEmails]);
    }
  };

  // Apply filter
  const handleApply = () => {
    onApply({
      groups: localSelectedGroups,
      emails: localSelectedEmails,
    });
    setPopoverOpen(false);
  };

  // Clear filter
  const handleClear = () => {
    setLocalSelectedGroups([]);
    setLocalSelectedEmails([]);
    onClear();
    setPopoverOpen(false);
  };

  const hasActiveFilter = selectedGroups.length > 0 || selectedPersonalEmails.length > 0;
  const activeCount = selectedGroups.length + selectedPersonalEmails.length;

  return (
    <>
      <Button
        color={hasActiveFilter ? "primary" : "secondary"}
        size="sm"
        innerRef={targetRef}
        onClick={toggle}
        className={`filter-button ${hasActiveFilter ? "active" : ""}`}
        title="Filter Sender"
      >
        <i className="fas fa-filter" />
        {hasActiveFilter && (
          <span className="filter-count ml-1">({activeCount})</span>
        )}
      </Button>

      <Popover
        placement="bottom-start"
        isOpen={popoverOpen}
        target={targetRef}
        toggle={toggle}
        className="sender-filter-popover"
      >
        <PopoverBody>
          <div className="filter-header">
            <h6 className="mb-2">
              <i className="fas fa-user mr-2" />
              Filter: Sender
            </h6>
          </div>

          {/* Tabs */}
          <Nav tabs className="mb-3">
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "groups" })}
                onClick={() => toggleTab("groups")}
                style={{ cursor: "pointer" }}
              >
                <i className="fas fa-users mr-1" />
                Groups
                {localSelectedGroups.length > 0 && (
                  <span className="badge badge-primary ml-1">
                    {localSelectedGroups.length}
                  </span>
                )}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "emails" })}
                onClick={() => toggleTab("emails")}
                style={{ cursor: "pointer" }}
              >
                <i className="fas fa-envelope mr-1" />
                Personal
                {localSelectedEmails.length > 0 && (
                  <span className="badge badge-primary ml-1">
                    {localSelectedEmails.length}
                  </span>
                )}
              </NavLink>
            </NavItem>
          </Nav>

          {/* Search box */}
          <FormGroup className="mb-2">
            <Input
              type="text"
              placeholder={`Search ${activeTab === "groups" ? "groups" : "emails"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              autoFocus
            />
          </FormGroup>

          {/* Tab content */}
          <TabContent activeTab={activeTab}>
            {/* Groups Tab */}
            <TabPane tabId="groups">
              {/* Select All */}
              <FormGroup check className="mb-2 pb-2 border-bottom">
                <Label check>
                  <Input
                    type="checkbox"
                    checked={
                      filteredGroups.length > 0 &&
                      localSelectedGroups.length === filteredGroups.length
                    }
                    onChange={handleSelectAllGroups}
                  />
                  <span className="font-weight-bold">
                    {localSelectedGroups.length === 0
                      ? "Select All Groups"
                      : `Selected (${localSelectedGroups.length}/${filteredGroups.length})`}
                  </span>
                </Label>
              </FormGroup>

              {/* Groups list */}
              <div className="filter-items-list">
                {filteredGroups.length === 0 ? (
                  <div className="text-muted text-center py-2">
                    <i className="fas fa-search mr-2" />
                    No groups found
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <FormGroup check key={group.id} className="filter-item">
                      <Label check>
                        <Input
                          type="checkbox"
                          checked={localSelectedGroups.includes(group.id)}
                          onChange={() => handleGroupCheckbox(group.id)}
                        />
                        <span className="filter-item-label">
                          <i className="fas fa-users mr-2 text-primary" />
                          {group.name}
                        </span>
                      </Label>
                    </FormGroup>
                  ))
                )}
              </div>
            </TabPane>

            {/* Personal Emails Tab */}
            <TabPane tabId="emails">
              {localSelectedGroups.length > 0 && (
                <div className="alert alert-info py-2 px-2 mb-2" style={{ fontSize: "0.75rem" }}>
                  <i className="fas fa-info-circle mr-1" />
                  Showing emails from {localSelectedGroups.length} selected group(s)
                </div>
              )}

              {/* Select All */}
              <FormGroup check className="mb-2 pb-2 border-bottom">
                <Label check>
                  <Input
                    type="checkbox"
                    checked={
                      filteredEmails.length > 0 &&
                      localSelectedEmails.length === filteredEmails.length
                    }
                    onChange={handleSelectAllEmails}
                  />
                  <span className="font-weight-bold">
                    {localSelectedEmails.length === 0
                      ? "Select All Emails"
                      : `Selected (${localSelectedEmails.length}/${filteredEmails.length})`}
                  </span>
                </Label>
              </FormGroup>

              {/* Emails list */}
              <div className="filter-items-list">
                {filteredEmails.length === 0 ? (
                  <div className="text-muted text-center py-2">
                    <i className="fas fa-search mr-2" />
                    {localSelectedGroups.length > 0
                      ? "No emails in selected groups"
                      : "No emails found"}
                  </div>
                ) : (
                  filteredEmails.map((email) => {
                    const groupInfo = getGroupInfo(email);
                    return (
                      <FormGroup check key={email} className="filter-item">
                        <Label check>
                          <Input
                            type="checkbox"
                            checked={localSelectedEmails.includes(email)}
                            onChange={() => handleEmailCheckbox(email)}
                          />
                          <span className="filter-item-label">
                            <i className="fas fa-envelope mr-2 text-success" />
                            {email}
                            {groupInfo && (
                              <small className="d-block text-muted ml-4">
                                <i className="fas fa-users mr-1" />
                                {groupInfo.groupName}
                              </small>
                            )}
                          </span>
                        </Label>
                      </FormGroup>
                    );
                  })
                )}
              </div>
            </TabPane>
          </TabContent>

          {/* Action buttons */}
          <div className="filter-actions mt-3 pt-2 border-top">
            <Button
              color="primary"
              size="sm"
              onClick={handleApply}
              className="mr-2"
              disabled={localSelectedGroups.length === 0 && localSelectedEmails.length === 0}
            >
              <i className="fas fa-check mr-1" />
              Apply
            </Button>
            <Button
              color="secondary"
              size="sm"
              onClick={handleClear}
              className="mr-2"
            >
              <i className="fas fa-times mr-1" />
              Clear
            </Button>
            <Button
              color="light"
              size="sm"
              onClick={() => setPopoverOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </PopoverBody>
      </Popover>
    </>
  );
};

export default SenderFilter;
