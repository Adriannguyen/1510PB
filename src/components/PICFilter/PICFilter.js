import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  FormGroup,
  Label,
  Popover,
  PopoverBody,
  Badge,
} from "reactstrap";
import "./PICFilter.css";

/**
 * Assigned PIC Filter Component
 * 
 * Features:
 * - Search PICs by name
 * - Checkbox selection (limit 10 per view with scroll)
 * - Shows assigned mail count per PIC
 * - Shows unassigned mails option
 */
const PICFilter = ({
  mails = [],
  selectedPICs = [],
  onApply,
  onClear,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelected, setLocalSelected] = useState([...selectedPICs]);
  const targetRef = useRef(null);

  useEffect(() => {
    setLocalSelected([...selectedPICs]);
  }, [selectedPICs]);

  const toggle = () => setPopoverOpen(!popoverOpen);

  // Get unique PICs with mail counts
  const getPICsWithCounts = () => {
    const picMap = new Map();
    let unassignedCount = 0;

    mails.forEach((mail) => {
      if (mail.assignedTo && mail.assignedTo.picId) {
        const picId = mail.assignedTo.picId;
        const picName = mail.assignedTo.picName || "Unknown PIC";
        const picEmail = mail.assignedTo.picEmail || "";

        if (picMap.has(picId)) {
          picMap.set(picId, {
            ...picMap.get(picId),
            count: picMap.get(picId).count + 1,
          });
        } else {
          picMap.set(picId, {
            id: picId,
            name: picName,
            email: picEmail,
            count: 1,
          });
        }
      } else {
        unassignedCount++;
      }
    });

    // Convert to array and sort by name
    const picsArray = Array.from(picMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Add unassigned option if there are unassigned mails
    if (unassignedCount > 0) {
      picsArray.unshift({
        id: "__unassigned__",
        name: "Unassigned",
        email: "",
        count: unassignedCount,
      });
    }

    return picsArray;
  };

  const picsWithCounts = getPICsWithCounts();

  // Filter PICs based on search
  const filteredPICs = picsWithCounts.filter((pic) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pic.name.toLowerCase().includes(searchLower) ||
      pic.email.toLowerCase().includes(searchLower)
    );
  });

  // Handle checkbox change
  const handleCheckboxChange = (picId) => {
    if (localSelected.includes(picId)) {
      setLocalSelected(localSelected.filter((id) => id !== picId));
    } else {
      setLocalSelected([...localSelected, picId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (localSelected.length === filteredPICs.length) {
      setLocalSelected([]);
    } else {
      setLocalSelected(filteredPICs.map((pic) => pic.id));
    }
  };

  // Apply filter
  const handleApply = () => {
    onApply(localSelected);
    setPopoverOpen(false);
  };

  // Clear filter
  const handleClear = () => {
    setLocalSelected([]);
    onClear();
    setPopoverOpen(false);
  };

  const hasActiveFilter = selectedPICs.length > 0;

  return (
    <>
      <Button
        color={hasActiveFilter ? "primary" : "secondary"}
        size="sm"
        innerRef={targetRef}
        onClick={toggle}
        className={`filter-button ${hasActiveFilter ? "active" : ""}`}
        title="Filter Assigned PIC"
      >
        <i className="fas fa-user-tie" />
        {hasActiveFilter && (
          <span className="filter-count ml-1">({selectedPICs.length})</span>
        )}
      </Button>

      <Popover
        placement="bottom-start"
        isOpen={popoverOpen}
        target={targetRef}
        toggle={toggle}
        className="pic-filter-popover"
      >
        <PopoverBody>
          <div className="filter-header">
            <h6 className="mb-2">
              <i className="fas fa-user-tie mr-2" />
              Filter: Assigned PIC
            </h6>
          </div>

          {/* Search box */}
          <FormGroup className="mb-2">
            <Input
              type="text"
              placeholder="Search PIC by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              autoFocus
            />
          </FormGroup>

          {/* Select All checkbox */}
          <FormGroup check className="mb-2 pb-2 border-bottom">
            <Label check>
              <Input
                type="checkbox"
                checked={
                  filteredPICs.length > 0 &&
                  localSelected.length === filteredPICs.length
                }
                onChange={handleSelectAll}
              />
              <span className="font-weight-bold">
                {localSelected.length === 0
                  ? "Select All"
                  : `Selected (${localSelected.length}/${filteredPICs.length})`}
              </span>
            </Label>
          </FormGroup>

          {/* PICs list */}
          <div className="filter-items-list pic-list">
            {filteredPICs.length === 0 ? (
              <div className="text-muted text-center py-2">
                <i className="fas fa-search mr-2" />
                No PICs found
              </div>
            ) : (
              filteredPICs.map((pic) => {
                const isChecked = localSelected.includes(pic.id);
                const isUnassigned = pic.id === "__unassigned__";

                return (
                  <FormGroup check key={pic.id} className="filter-item pic-item">
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(pic.id)}
                      />
                      <span className="filter-item-content">
                        <span className="pic-info">
                          {isUnassigned ? (
                            <>
                              <i className="fas fa-user-slash mr-2 text-muted" />
                              <span className="pic-name text-muted">
                                {pic.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-user-circle mr-2 text-info" />
                              <span className="pic-name">{pic.name}</span>
                            </>
                          )}
                        </span>
                        <Badge color={isUnassigned ? "secondary" : "primary"} pill>
                          {pic.count}
                        </Badge>
                      </span>
                      {!isUnassigned && pic.email && (
                        <small className="pic-email d-block ml-4 text-muted">
                          <i className="fas fa-envelope mr-1" />
                          {pic.email}
                        </small>
                      )}
                    </Label>
                  </FormGroup>
                );
              })
            )}
          </div>

          {/* Summary */}
          <div className="filter-summary mt-2 p-2 bg-light rounded">
            <small className="text-muted">
              <i className="fas fa-info-circle mr-1" />
              Total: {picsWithCounts.length} PIC(s), {mails.length} mail(s)
            </small>
          </div>

          {/* Action buttons */}
          <div className="filter-actions mt-3 pt-2 border-top">
            <Button
              color="primary"
              size="sm"
              onClick={handleApply}
              className="mr-2"
              disabled={localSelected.length === 0}
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

export default PICFilter;
