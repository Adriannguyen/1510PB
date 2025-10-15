import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Label,
  FormGroup,
  Button,
} from "reactstrap";
import { useMailContext, useMailStats, useExpiredRepliedMails, useExpiredUnrepliedMails } from "contexts/MailContext";
import AntdDatePicker from "components/DateInput/AntdDatePicker";
import "./MailStatisticsChart.css";

const MailStatisticsChart = () => {
  const { mails } = useMailContext();
  const mailStats = useMailStats();
  const expiredRepliedMails = useExpiredRepliedMails();
  const expiredUnrepliedMails = useExpiredUnrepliedMails();

  // State for date filtering
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Temporary state for date inputs (before apply)
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  // Filter mails based on date range
  const filteredMails = useMemo(() => {
    if (!startDate && !endDate) {
      return mails;
    }

    return mails.filter((mail) => {
      if (!mail.Date || !Array.isArray(mail.Date) || mail.Date.length < 2) {
        return false;
      }

      try {
        const [dateStr, timeStr] = mail.Date;
        const mailDate = new Date(`${dateStr}T${timeStr}`);

        // Check start date
        if (startDate) {
          const filterStartDate = new Date(startDate);
          filterStartDate.setHours(0, 0, 0, 0);
          if (mailDate < filterStartDate) {
            return false;
          }
        }

        // Check end date
        if (endDate) {
          const filterEndDate = new Date(endDate);
          filterEndDate.setHours(23, 59, 59, 999);
          if (mailDate > filterEndDate) {
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error("Error parsing mail date:", error);
        return false;
      }
    });
  }, [mails, startDate, endDate]);

  // Helper function to format date as dd/mm/yyyy
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Apply filters function
  const applyFilters = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
  };

  // Clear filters function
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setTempStartDate("");
    setTempEndDate("");
  };

  // Calculate statistics by replicating hook logic for consistency
  const filteredStats = useMemo(() => {
    const stats = {
      validReplied: 0,
      validUnreplied: 0,
      expiredReplied: 0,
      expiredUnreplied: 0,
      reviewProcessed: 0,
      reviewPending: 0,
      total: 0,
      valid: 0,
      expired: 0,
    };

    // Expired Unreplied: QuaHan/chuaRep (from useExpiredUnrepliedMails logic)
    const expiredUnreplied = filteredMails.filter(
      (mail) => mail.category === "QuaHan" && mail.status === "chuaRep"
    );
    stats.expiredUnreplied = expiredUnreplied.length;

    // Expired Replied: QuaHan/daRep (from useExpiredRepliedMails logic)
    const expiredReplied = filteredMails.filter(
      (mail) => mail.category === "QuaHan" && mail.status === "daRep"
    );
    stats.expiredReplied = expiredReplied.length;
    stats.expired = stats.expiredReplied + stats.expiredUnreplied;

    // Valid Mails: DungHan (from useValidMails logic)
    const validMails = filteredMails.filter(
      (mail) => mail.category === "DungHan"
    );
    stats.valid = validMails.length;

    // Valid Replied: DungHan && isReplied (using isReplied boolean)
    const validReplied = validMails.filter((mail) => mail.isReplied);
    stats.validReplied = validReplied.length;

    // Valid Unreplied: DungHan && !isReplied (using isReplied boolean)
    const validUnreplied = validMails.filter((mail) => !mail.isReplied);
    stats.validUnreplied = validUnreplied.length;
    
    // Review Mails: ReviewMail (filtered by isReplied)
    const reviewMails = filteredMails.filter(
      (mail) => mail.category === "ReviewMail"
    );
    stats.reviewProcessed = reviewMails.filter((mail) => mail.isReplied).length;
    stats.reviewPending = reviewMails.filter((mail) => !mail.isReplied).length;

    stats.total = stats.valid + stats.expired + stats.reviewProcessed + stats.reviewPending;

    console.log("📊 Filtered stats (replicated logic):", {
      total: stats.total,
      valid: stats.valid,
      expired: stats.expired,
      validReplied: stats.validReplied,
      validUnreplied: stats.validUnreplied,
      expiredReplied: stats.expiredReplied,
      expiredUnreplied: stats.expiredUnreplied,
      reviewProcessed: stats.reviewProcessed,
      reviewPending: stats.reviewPending,
    });

    return stats;
  }, [filteredMails]);

  // All 6 chart data items in one chart (Review split into 2 columns)
  const chartData = [
    {
      label: "Reply (Valid)",
      value: filteredStats.validReplied || 0,
      color: "#2dce89", // Green
    },
    {
      label: "Non-reply (Valid)",
      value: filteredStats.validUnreplied || 0,
      color: "#2dce89", // Green
    },
    {
      label: "Reply (Expired)",
      value: filteredStats.expiredReplied || 0,
      color: "#fb6340", // Red
    },
    {
      label: "Non-reply (Expired)",
      value: filteredStats.expiredUnreplied || 0,
      color: "#fb6340", // Red
    },
    {
      label: "Processed (Review)",
      value: filteredStats.reviewProcessed || 0,
      color: "#8965e0", // Purple
    },
    {
      label: "Under Review (Review)",
      value: filteredStats.reviewPending || 0,
      color: "#8965e0", // Purple
    },
  ];

  const maxValue = Math.max(...chartData.map((item) => item.value));

  return (
    <Card className="bg-gradient-default shadow">
      <CardHeader className="bg-transparent">
        <Row className="align-items-center">
          <div className="col">
            <h6 className="text-uppercase text-light ls-1 mb-1">Overview</h6>
            <h2 className="text-white mb-0">
              Summary Chart
              {/* {(startDate || endDate) && (
                <small className="text-light ml-2">
                  (Filtered: {filteredStats.total} mails
                  {startDate && ` from ${formatDateDisplay(startDate)}`}
                  {endDate && ` to ${formatDateDisplay(endDate)}`})
                </small>
              )} */}
            </h2>
          </div>
          <div className="col-auto">
            <Row className="align-items-end">
              <Col xs="auto">
                <FormGroup className="mb-0">
                  <Label className="text-light text-sm mb-1">From: </Label>
                  <AntdDatePicker
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    size="small"
                    style={{ width: "140px" }}
                  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup className="mb-0">
                  <Label className="text-light text-sm mb-1">To: </Label>
                  <AntdDatePicker
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    size="small"
                    style={{ width: "140px" }}
                  />
                </FormGroup>
              </Col>
              <Col xs="auto">
                <FormGroup className="mb-0">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={applyFilters}
                    disabled={!tempStartDate && !tempEndDate}
                    title="Apply date filters"
                    style={{ height: "28px", marginRight: "8px" }}
                  >
                    <i className="fas fa-check mr-1"></i>
                    Apply
                  </Button>
                  <Button
                    color="warning"
                    size="sm"
                    onClick={clearFilters}
                    disabled={
                      !startDate && !endDate && !tempStartDate && !tempEndDate
                    }
                    title="Clear date filters"
                    style={{ height: "28px" }}
                  >
                    <i className="fas fa-times mr-1"></i>
                    Clear
                  </Button>
                </FormGroup>
              </Col>
            </Row>
          </div>
        </Row>
      </CardHeader>
      <CardBody>
        {/* Custom Horizontal Bar Chart - All 5 values */}
        <div className="chart-container" style={{ minHeight: "400px" }}>
          <div className="chart-bars">
            {chartData.map((item, index) => (
              <div key={index} className="chart-bar-item mb-3">
                <Row className="align-items-center">
                  <Col xs="3" className="text-right pr-3">
                    <span
                      className="text-light font-weight-bold"
                      style={{ fontSize: "13px" }}
                    >
                      {item.label}
                    </span>
                  </Col>
                  <Col xs="7">
                    <div className="progress-wrapper chart-grid">
                      <div
                        className="progress"
                        style={{
                          height: "25px",
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderRadius: "3px",
                        }}
                      >
                        <div
                          className="progress-bar"
                          role="progressbar"
                          title={`${item.label}: ${item.value} mails`}
                          style={{
                            width: `${
                              maxValue > 0 ? (item.value / maxValue) * 100 : 0
                            }%`,
                            backgroundColor: item.color,
                            transition: "width 0.6s ease",
                            borderRadius: "3px",
                            cursor: "pointer",
                            "--target-width": `${
                              maxValue > 0 ? (item.value / maxValue) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col xs="2" className="text-left pl-3">
                    <span className="text-light font-weight-bold text-sm">
                      {item.value}
                    </span>
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          {/* X-axis scale */}
          <div className="mt-4">
            <Row>
              <Col xs="3"></Col>
              <Col xs="7">
                <div className="d-flex justify-content-between text-light text-xs">
                  {(() => {
                    // Calculate appropriate scale based on maxValue
                    const scaleMax = Math.ceil(maxValue / 5) * 5; // Round up to nearest 5
                    const adjustedMax = Math.max(scaleMax, 10); // Minimum scale of 10
                    const step = Math.max(Math.ceil(adjustedMax / 10), 1); // Show ~10 ticks
                    const ticks = [];

                    for (let i = 0; i <= adjustedMax; i += step) {
                      ticks.push(i);
                    }

                    return ticks.map((tick, index) => (
                      <span key={index} style={{ fontSize: "10px" }}>
                        {tick}
                      </span>
                    ));
                  })()}
                </div>
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "#ffd600",
                    marginTop: "5px",
                    border: "1px solid #ffd600",
                  }}
                ></div>
              </Col>
              <Col xs="2"></Col>
            </Row>
          </div>

          {/* Summary */}
          <div
            className="mt-4 pt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Row>
              <Col xs="3">
                <div className="text-center">
                  <span className="text-light text-sm">Total Valid</span>
                  <div className="h4 text-white font-weight-bold">
                    {filteredStats.valid}
                  </div>
                </div>
              </Col>
              <Col xs="3">
                <div className="text-center">
                  <span className="text-light text-sm">Total Expired</span>
                  <div className="h4 text-white font-weight-bold">
                    {filteredStats.expired}
                  </div>
                </div>
              </Col>
              <Col xs="3">
                <div className="text-center">
                  <span className="text-light text-sm">Total Review</span>
                  <div className="h4 text-white font-weight-bold">
                    {filteredStats.reviewProcessed + filteredStats.reviewPending}
                  </div>
                </div>
              </Col>
              <Col xs="3">
                <div className="text-center">
                  <span className="text-light text-sm">Total Mails</span>
                  <div className="h4 text-white font-weight-bold">
                    {filteredStats.total}
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default MailStatisticsChart;
