/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* About Us Page
* Created: October 2025

=========================================================

*/

import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  Badge,
} from "reactstrap";
import CompactHeader from "components/Headers/CompactHeader.js";

const AboutUs = () => {
  const features = [
    {
      icon: "ni ni-email-83",
      title: "Mail Management",
      description:
        "Comprehensive mail tracking system with automatic categorization and status monitoring",
      color: "primary",
    },
    {
      icon: "ni ni-time-alarm",
      title: "Real-time Updates",
      description:
        "Instant synchronization with WebSocket technology for live mail updates",
      color: "info",
    },
    {
      icon: "ni ni-badge",
      title: "Smart Assignment",
      description:
        "Automatic PIC assignment based on sender groups for efficient workflow",
      color: "warning",
    },
    {
      icon: "ni ni-chart-bar-32",
      title: "Analytics Dashboard",
      description:
        "Powerful statistics and charts to monitor mail performance and trends",
      color: "success",
    },
    {
      icon: "ni ni-lock-circle-open",
      title: "Secure & Encrypted",
      description:
        "Advanced encryption for sensitive data with role-based access control",
      color: "danger",
    },
    {
      icon: "ni ni-world-2",
      title: "Multi-user Support",
      description:
        "Team collaboration with group management and permission controls",
      color: "default",
    },
  ];

  const techStack = [
    { name: "React 18", icon: "⚛️", description: "Modern UI framework" },
    { name: "Node.js", icon: "🟢", description: "Backend server" },
    { name: "Socket.io", icon: "🔌", description: "Real-time communication" },
    { name: "Chart.js", icon: "📊", description: "Data visualization" },
    { name: "Bootstrap 4", icon: "🎨", description: "UI components" },
    { name: "Chokidar", icon: "👁️", description: "File watching" },
  ];

  const teamMembers = [
    {
      name: "Development Team",
      role: "Full Stack Development",
      avatar: "ni ni-laptop",
      color: "primary",
    },
    {
      name: "Design Team",
      role: "UI/UX Design",
      avatar: "ni ni-palette",
      color: "info",
    },
    {
      name: "QA Team",
      role: "Quality Assurance",
      avatar: "ni ni-check-bold",
      color: "success",
    },
  ];

  const stats = [
    { value: "1.2.4", label: "Version", icon: "ni ni-tag" },
    { value: "2025", label: "Year", icon: "ni ni-calendar-grid-58" },
    { value: "React", label: "Framework", icon: "ni ni-atom" },
    { value: "MIT", label: "License", icon: "ni ni-books" },
  ];

  return (
    <>
      <CompactHeader />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* Hero Section */}
        <Row>
          <Col>
            <Card className="shadow border-0 mb-4">
              <CardBody className="py-5">
                <Row className="align-items-center">
                  <Col lg="8">
                    <div className="pl-4">
                      <h1 className="display-3 text-primary mb-3">
                        <i className="ni ni-world-2 mr-3"></i>
                        Mail Management System
                      </h1>
                      <h2 className="text-muted mb-4">
                        Advanced Email Tracking & Assignment Platform
                      </h2>
                      <p className="lead text-muted mb-0">
                        A comprehensive solution for managing, tracking, and organizing
                        emails with real-time updates, smart assignment, and powerful
                        analytics. Built with modern technologies for optimal performance
                        and user experience.
                      </p>
                    </div>
                  </Col>
                  <Col lg="4" className="text-center">
                    <div
                      className="icon icon-shape bg-gradient-primary shadow rounded-circle text-white"
                      style={{ width: "150px", height: "150px", margin: "0 auto" }}
                    >
                      <i
                        className="ni ni-email-83"
                        style={{ fontSize: "4rem", lineHeight: "150px" }}
                      ></i>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Stats Section */}
        <Row className="mb-4">
          {stats.map((stat, index) => (
            <Col lg="3" md="6" key={index}>
              <Card className="card-stats shadow mb-4">
                <CardBody>
                  <Row>
                    <div className="col">
                      <span className="h2 font-weight-bold mb-0">{stat.value}</span>
                      <p className="mt-2 mb-0 text-muted text-sm">
                        <i className={`${stat.icon} mr-2`}></i>
                        {stat.label}
                      </p>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-gradient-primary text-white rounded-circle shadow">
                        <i className={stat.icon}></i>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Features Section */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">
                  <i className="ni ni-support-16 text-primary mr-2"></i>
                  Key Features
                </h2>
              </CardHeader>
              <CardBody>
                <Row>
                  {features.map((feature, index) => (
                    <Col lg="4" md="6" className="mb-4" key={index}>
                      <div className="d-flex align-items-start">
                        <div
                          className={`icon icon-shape bg-gradient-${feature.color} text-white rounded-circle shadow mr-3`}
                        >
                          <i className={feature.icon}></i>
                        </div>
                        <div>
                          <h3 className="mb-2">{feature.title}</h3>
                          <p className="text-muted mb-0">{feature.description}</p>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Technology Stack */}
        <Row className="mb-4">
          <Col lg="6">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">
                  <i className="ni ni-atom text-info mr-2"></i>
                  Technology Stack
                </h2>
              </CardHeader>
              <CardBody>
                <div className="list-group list-group-flush">
                  {techStack.map((tech, index) => (
                    <div
                      className="list-group-item px-0 d-flex align-items-center"
                      key={index}
                    >
                      <span className="mr-3" style={{ fontSize: "1.5rem" }}>
                        {tech.icon}
                      </span>
                      <div>
                        <h4 className="mb-0">{tech.name}</h4>
                        <small className="text-muted">{tech.description}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Team Section */}
          <Col lg="6">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">
                  <i className="ni ni-circle-08 text-success mr-2"></i>
                  Our Team
                </h2>
              </CardHeader>
              <CardBody>
                {teamMembers.map((member, index) => (
                  <div
                    className={`media align-items-center ${
                      index < teamMembers.length - 1 ? "mb-4 pb-4 border-bottom" : ""
                    }`}
                    key={index}
                  >
                    <div
                      className={`icon icon-shape bg-gradient-${member.color} text-white rounded-circle shadow mr-3`}
                    >
                      <i className={member.avatar}></i>
                    </div>
                    <div className="media-body">
                      <h3 className="mb-1">{member.name}</h3>
                      <p className="text-muted mb-0">{member.role}</p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* System Info */}
            <Card className="shadow mt-4">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">
                  <i className="ni ni-settings-gear-65 text-warning mr-2"></i>
                  System Information
                </h2>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <h4 className="mb-2">
                    <Badge color="primary" className="mr-2">
                      Version
                    </Badge>
                    1.2.4
                  </h4>
                </div>
                <div className="mb-3">
                  <h4 className="mb-2">
                    <Badge color="success" className="mr-2">
                      Status
                    </Badge>
                    Production Ready
                  </h4>
                </div>
                <div className="mb-3">
                  <h4 className="mb-2">
                    <Badge color="info" className="mr-2">
                      Updated
                    </Badge>
                    October 2025
                  </h4>
                </div>
                <div className="mb-3">
                  <h4 className="mb-2">
                    <Badge color="warning" className="mr-2">
                      License
                    </Badge>
                    MIT
                  </h4>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* System Architecture */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h2 className="mb-0">
                  <i className="ni ni-spaceship text-danger mr-2"></i>
                  System Architecture
                </h2>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg="4" className="mb-4">
                    <div className="text-center">
                      <div className="icon icon-shape bg-gradient-primary text-white rounded-circle shadow mb-3 mx-auto">
                        <i className="ni ni-laptop"></i>
                      </div>
                      <h3>Frontend Layer</h3>
                      <p className="text-muted">
                        React 18 with Reactstrap components, Context API for state
                        management, and Socket.io client for real-time updates
                      </p>
                    </div>
                  </Col>
                  <Col lg="4" className="mb-4">
                    <div className="text-center">
                      <div className="icon icon-shape bg-gradient-success text-white rounded-circle shadow mb-3 mx-auto">
                        <i className="ni ni-world-2"></i>
                      </div>
                      <h3>Backend Layer</h3>
                      <p className="text-muted">
                        Node.js with Express server, WebSocket for real-time
                        communication, and Chokidar for file system monitoring
                      </p>
                    </div>
                  </Col>
                  <Col lg="4" className="mb-4">
                    <div className="text-center">
                      <div className="icon icon-shape bg-gradient-warning text-white rounded-circle shadow mb-3 mx-auto">
                        <i className="ni ni-archive-2"></i>
                      </div>
                      <h3>Data Layer</h3>
                      <p className="text-muted">
                        JSON file-based storage system with automatic categorization,
                        encryption support, and group management
                      </p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Credits */}
        <Row>
          <Col>
            <Card className="shadow">
              <CardBody className="text-center py-4">
                <h3 className="mb-3">Built with ❤️ using Argon Dashboard React</h3>
                <p className="text-muted mb-0">
                  <i className="ni ni-bulb-61 text-warning mr-2"></i>
                  Powered by modern web technologies and best practices
                </p>
                <hr className="my-4" />
                <p className="text-muted mb-0">
                  © 2025 Mail Management System. All rights reserved.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AboutUs;
