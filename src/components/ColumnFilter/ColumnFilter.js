import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  FormGroup,
  Label,
  Popover,
  PopoverBody,
} from "reactstrap";
import "./ColumnFilter.css";

/**
 * Excel-style Column Filter Component
 * 
 * @param {string} columnName - Name of the column (for display)
 * @param {array} items - Array of items to filter (can be strings or objects)
 * @param {function} getItemKey - Function to get unique key from item
 * @param {function} getItemLabel - Function to get display label from item
 * @param {array} selectedItems - Currently selected items
 * @param {function} onApply - Callback when filter is applied
 * @param {function} onClear - Callback when filter is cleared
 * @param {object} filterIcon - Icon element for filter button
 */
const ColumnFilter = ({
  columnName,
  items = [],
  getItemKey,
  getItemLabel,
  selectedItems = [],
  onApply,
  onClear,
  filterIcon = <i className="fas fa-filter" />,
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelected, setLocalSelected] = useState([...selectedItems]);
  const targetRef = useRef(null);

  useEffect(() => {
    setLocalSelected([...selectedItems]);
  }, [selectedItems]);

  const toggle = () => setPopoverOpen(!popoverOpen);

  // Filter items based on search term
  const filteredItems = items.filter((item) => {
    const label = getItemLabel(item).toLowerCase();
    return label.includes(searchTerm.toLowerCase());
  });

  // Handle checkbox change
  const handleCheckboxChange = (item) => {
    const key = getItemKey(item);
    if (localSelected.includes(key)) {
      setLocalSelected(localSelected.filter((k) => k !== key));
    } else {
      setLocalSelected([...localSelected, key]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (localSelected.length === filteredItems.length) {
      setLocalSelected([]);
    } else {
      setLocalSelected(filteredItems.map((item) => getItemKey(item)));
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

  const hasActiveFilter = selectedItems.length > 0;

  return (
    <>
      <Button
        color={hasActiveFilter ? "primary" : "secondary"}
        size="sm"
        innerRef={targetRef}
        onClick={toggle}
        className={`filter-button ${hasActiveFilter ? "active" : ""}`}
        title={`Filter ${columnName}`}
      >
        {filterIcon}
        {hasActiveFilter && (
          <span className="filter-count ml-1">({selectedItems.length})</span>
        )}
      </Button>

      <Popover
        placement="bottom-start"
        isOpen={popoverOpen}
        target={targetRef}
        toggle={toggle}
        className="column-filter-popover"
      >
        <PopoverBody>
          <div className="filter-header">
            <h6 className="mb-2">
              <i className="fas fa-filter mr-2" />
              Filter: {columnName}
            </h6>
          </div>

          {/* Search box */}
          <FormGroup className="mb-2">
            <Input
              type="text"
              placeholder={`Search ${columnName}...`}
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
                  filteredItems.length > 0 &&
                  localSelected.length === filteredItems.length
                }
                onChange={handleSelectAll}
                indeterminate={
                  localSelected.length > 0 &&
                  localSelected.length < filteredItems.length
                }
              />
              <span className="font-weight-bold">
                {localSelected.length === 0
                  ? "Select All"
                  : `Selected (${localSelected.length}/${filteredItems.length})`}
              </span>
            </Label>
          </FormGroup>

          {/* Items list */}
          <div className="filter-items-list">
            {filteredItems.length === 0 ? (
              <div className="text-muted text-center py-2">
                <i className="fas fa-search mr-2" />
                No items found
              </div>
            ) : (
              filteredItems.map((item) => {
                const key = getItemKey(item);
                const label = getItemLabel(item);
                const isChecked = localSelected.includes(key);

                return (
                  <FormGroup check key={key} className="filter-item">
                    <Label check>
                      <Input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(item)}
                      />
                      <span className="filter-item-label">{label}</span>
                    </Label>
                  </FormGroup>
                );
              })
            )}
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

export default ColumnFilter;
