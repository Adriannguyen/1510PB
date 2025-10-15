/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
/*eslint-disable*/
import { useState, useEffect } from "react";
import {
  NavLink as NavLinkRRD,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";
// Import notification hook
import { useNotificationCounts } from "contexts/MailContext.js";
import { useAuth } from "contexts/AuthContext.js";
import NewMailBadge from "components/NewMailBadge/NewMailBadge.js";
import { useNewMailLogic } from "hooks/useNewMailLogic.js";
import RealtimeClock from "components/RealtimeClock/RealtimeClock.js";
import { useFolderCounts } from "hooks/useFolderCounts.js";
import FolderWarningBadge from "components/FolderWarningBadge/FolderWarningBadge.js";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Media,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";

var ps;

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState();
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
    closeCollapse();
  };

  // Handle navigation click - refresh if same page, navigate if different
  const handleNavClick = (e, targetPath) => {
    const fullPath = props.layout + targetPath;

    // Check if we're already on this page
    if (location.pathname === fullPath) {
      e.preventDefault();
      // Refresh the current page
      window.location.reload();
    }
    // If different page, NavLinkRRD will handle navigation normally
    closeCollapse();
  };

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  // toggles collapse between opened and closed (true/false)
  const toggleCollapse = () => {
    setCollapseOpen((data) => !data);
  };
  // closes the collapse
  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  // Effect để lắng nghe sự kiện cập nhật số lượng mail
  useEffect(() => {
    const handleMailCountsUpdated = (event) => {
      console.log("📡 Sidebar received mailCountsUpdated event:", event.detail);
      // Trigger re-render để cập nhật badge
      setUpdateTrigger((prev) => prev + 1);
    };

    window.addEventListener("mailCountsUpdated", handleMailCountsUpdated);

    // Cleanup
    return () => {
      window.removeEventListener("mailCountsUpdated", handleMailCountsUpdated);
    };
  }, []);
  // Get notification counts and NEW logic
  const { dungHanCount, quaHanCount, showDungHanBadge, showQuaHanBadge } =
    useNotificationCounts();
  const { showNewBadge, newMailCounts } = useNewMailLogic();
  const { dungHanMustRepCount, quaHanChuaRepCount, reviewMailPendingCount } =
    useFolderCounts();

  // creates the links that appear in the left menu / Sidebar
  const createLinks = (routes) => {
    return routes
      .filter((prop) => !prop.invisible) // Filter out invisible routes
      .map((prop, key) => {
        // Add updateTrigger to key to force re-render when counts change
        const itemKey = `${key}-${updateTrigger}`;
        // Determine if this route should show NEW badge
        let notificationCount = 0;
        let showBadge = false;
        let isNewMail = false;

        if (prop.path === "/valid-mails" || prop.name === "Đúng hạn") {
          notificationCount = newMailCounts.dungHanMustRep;
          showBadge = newMailCounts.dungHanMustRep > 0;
          isNewMail = true;
        } else if (prop.path === "/expired-mails" || prop.name === "Quá hạn") {
          // Bỏ NEW badge khỏi mail quá hạn
          notificationCount = 0;
          showBadge = false;
          isNewMail = false;
        } else if (prop.path === "/server" || prop.name === "Server") {
          // Bỏ hiển thị số lượng cho Server
          notificationCount = 0;
          showBadge = false;
          isNewMail = false;
        } else if (prop.path === "/assignment" || prop.name === "Assignment") {
          // Hiển thị badge số 6 cho Assignment
          notificationCount = 6;
          showBadge = false;
          isNewMail = false;
        }

        return (
          <NavItem key={itemKey}>
            <NavLink
              to={prop.layout + prop.path}
              tag={NavLinkRRD}
              onClick={(e) => handleNavClick(e, prop.path)}
              className="d-flex align-items-center justify-content-between"
            >
              <div className="d-flex align-items-center">
                <i className={prop.icon} />
                {prop.name}
              </div>
              <div className="d-flex align-items-center">
                {/* Hiển thị badge NEW cho Valid Mails */}
                {showBadge && prop.path === "/valid-mails" && (
                  <span
                    className={`badge ${
                      isNewMail ? "badge-danger" : "badge-primary"
                    } badge-pill ml-2`}
                  >
                    {isNewMail ? "new" : notificationCount}
                  </span>
                )}

                {/* Hiển thị số lượng mail DungHan/mustRep nhấp nháy màu đỏ bên cạnh Valid Mails */}
                <FolderWarningBadge
                  count={dungHanMustRepCount}
                  show={prop.path === "/valid-mails"}
                />

                {/* Hiển thị số lượng mail QuaHan/chuaRep nhấp nháy màu đỏ bên cạnh Expired Mails */}
                <FolderWarningBadge
                  count={quaHanChuaRepCount}
                  show={prop.path === "/expired-mails"}
                />

                {/* Hiển thị số lượng mail ReviewMail/pending nhấp nháy màu đỏ bên cạnh Review Mails */}
                <FolderWarningBadge
                  count={reviewMailPendingCount}
                  show={prop.path === "/review-mails"}
                />

                {/* Badge cho Assignment và Server */}
                {(prop.path === "/assignment" || prop.path === "/server") && (
                  <span className="badge badge-warning badge-pill ml-2">
                    <i
                      className="ni ni-lock-circle-open"
                      style={{ fontSize: "10px" }}
                    />
                  </span>
                )}
              </div>
            </NavLink>
          </NavItem>
        );
      });
  };

  const { bgColor, routes, logo } = props;
  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>
        {/* Brand */}
        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </NavbarBrand>
        ) : null}
        {/* User */}
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav>
            <DropdownToggle nav className="nav-link-icon">
              <i className="ni ni-bell-55" />
            </DropdownToggle>
            <DropdownMenu
              aria-labelledby="navbar-default_dropdown_1"
              className="dropdown-menu-arrow"
              right
            >
              <DropdownItem>Action</DropdownItem>
              <DropdownItem>Another action</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Something else here</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img
                    alt="..."
                    src={require("../../assets/img/theme/1.jpg")}
                  />
                </span>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Welcome!</h6>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-single-02" />
                <span>My profile</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-lock-circle-open" />
                <span>Change Password</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-paper-diploma" />
                <span>About Us</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-sound-wave" />
                <span>Server</span>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()}>
                <i className="ni ni-user-run" />
                <span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>
        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          {/* Collapse header */}
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo ? (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink ? (
                    <Link to={logo.innerLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </Link>
                  ) : (
                    <a href={logo.outterLink}>
                      <img alt={logo.imgAlt} src={logo.imgSrc} />
                    </a>
                  )}
                </Col>
              ) : null}
              <Col className="collapse-close" xs="6">
                <button
                  className="navbar-toggler"
                  type="button"
                  onClick={toggleCollapse}
                >
                  <span />
                  <span />
                </button>
              </Col>
            </Row>
          </div>
          {/* Form */}
          <Form className="mt-4 mb-3 d-md-none">
            <InputGroup className="input-group-rounded input-group-merge">
              <Input
                aria-label="Search"
                className="form-control-rounded form-control-prepended"
                placeholder="Search"
                type="search"
              />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="fa fa-search" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>
          {/* Navigation */}
          <Nav navbar>{createLinks(routes)}</Nav>
          {/* Divider */}
          <hr className="my-3" />
          {/* Realtime Clock */}
          {/* <div className="px-3 mb-3">
            <RealtimeClock />
          </div> */}

          {/* Logout Button - Positioned at absolute bottom */}
          <div className="px-3 mt-auto">
            <Button
              color="secondary"
              size="nm"
              block
              onClick={handleLogout}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="ni ni-user-run mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = {
  routes: [{}],
};

Sidebar.propTypes = {
  // links that will be displayed inside the component
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    // innerLink is for links that will direct the user within the app
    // it will be rendered as <Link to="...">...</Link> tag
    innerLink: PropTypes.string,
    // outterLink is for links that will direct the user outside the app
    // it will be rendered as simple <a href="...">...</a> tag
    outterLink: PropTypes.string,
    // the image src of the logo
    imgSrc: PropTypes.string.isRequired,
    // the alt for the img
    imgAlt: PropTypes.string.isRequired,
  }),
};

export default Sidebar;
