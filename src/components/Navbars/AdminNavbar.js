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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext.js";
import { useState } from "react";
import AboutUsModal from "components/AboutUsModal/AboutUsModal.js";
// reactstrap components
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Form,
  FormGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  InputGroup,
  Navbar,
  Nav,
  Container,
  Media,
} from "reactstrap";

const AdminNavbar = (props) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);

  const toggleAboutUs = () => setIsAboutUsOpen(!isAboutUsOpen);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  // Handle page title click - refresh current page
  const handleTitleClick = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  return (
    <>
      <Navbar
        className="navbar-top navbar-dark"
        expand="md"
        id="navbar-main"
        style={{ position: "relative", zIndex: 1000 }}
      >
        <Container fluid>
          <div
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            onClick={handleTitleClick}
            style={{ cursor: "pointer" }}
          >
            {props.brandText}
          </div>
          {/* <Form className="navbar-search navbar-search-dark form-inline mr-3 d-none d-md-flex ml-lg-auto">
            <FormGroup className="mb-0">
              <InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>
                    <i className="fas fa-search" />
                  </InputGroupText>
                </InputGroupAddon>
                <Input placeholder="Search" type="text" />
              </InputGroup>
            </FormGroup>
          </Form> */}
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img alt="..." src={process.env.PUBLIC_URL + "/2.jpg"} />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {user?.fullName || user?.username || "User"}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu
                className="dropdown-menu-arrow"
                right
                style={{ zIndex: 9999 }}
              >
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Welcome!</h6>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-single-02" />
                  <span>My profile</span>
                </DropdownItem>
                <DropdownItem to="/admin/change-password" tag={Link}>
                  <i className="ni ni-lock-circle-open" />
                  <span>Change Password</span>
                </DropdownItem>
                <DropdownItem onClick={toggleAboutUs}>
                  <i className="ni ni-paper-diploma" />
                  <span>About Us</span>
                </DropdownItem>
                <DropdownItem to="/admin/server" tag={Link}>
                  <i className="ni ni-sound-wave" />
                  <span>Server</span>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem href="#pablo" onClick={handleLogout}>
                  <i className="ni ni-user-run" />
                  <span>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* About Us Modal */}
      <AboutUsModal isOpen={isAboutUsOpen} toggle={toggleAboutUs} />
    </>
  );
};

export default AdminNavbar;
