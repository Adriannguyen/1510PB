/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Change Password Page
* Created: October 2025

=========================================================

*/

import React, { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
  Alert,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "reactstrap";
import CompactHeader from "components/Headers/CompactHeader.js";
import { useAuth } from "contexts/AuthContext.js";
import { API_BASE_URL } from "constants/api.js";

const ChangePassword = () => {
  const { user, updateUser } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: "",
  });

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      return { score: 0, text: "", color: "" };
    }

    let score = 0;
    let text = "";
    let color = "";

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Determine strength
    if (score <= 2) {
      text = "Weak";
      color = "danger";
    } else if (score <= 4) {
      text = "Medium";
      color = "warning";
    } else {
      text = "Strong";
      color = "success";
    }

    return { score, text, color };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculate strength for new password
    if (name === "newPassword") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswordChange = () => {
    // Check if all fields are filled
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage({
        type: "danger",
        text: "Please fill in all password fields",
      });
      return false;
    }

    // Check password length (same as Profile.js - minimum 6 characters)
    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: "danger",
        text: "New password must be at least 6 characters long",
      });
      return false;
    }

    // Check if new password matches confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "danger",
        text: "New passwords do not match",
      });
      return false;
    }

    // Check if new password is different from current
    if (passwordData.currentPassword === passwordData.newPassword) {
      setMessage({
        type: "danger",
        text: "New password must be different from current password",
      });
      return false;
    }

    return true;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validatePasswordChange()) {
      return;
    }

    setIsChanging(true);

    try {
      // Use updateUser from AuthContext (same as Profile.js)
      const result = await updateUser({
        username: user.username,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: "Password changed successfully! You can now login with your new password.",
        });
        // Clear form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength({ score: 0, text: "", color: "" });
      } else {
        setMessage({
          type: "danger",
          text: result.error || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        type: "danger",
        text: "An error occurred while changing password. Please try again.",
      });
    } finally {
      setIsChanging(false);
    }
  };

  // Old implementation (hidden) - Direct API call approach
  // This code is commented out to preserve the original implementation
  /*
  const handlePasswordChangeOld = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validatePasswordChange()) {
      return;
    }

    setIsChanging(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user.username}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Password changed successfully! You can now login with your new password.",
        });
        // Clear form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordStrength({ score: 0, text: "", color: "" });
      } else {
        setMessage({
          type: "danger",
          text: data.message || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({
        type: "danger",
        text: "An error occurred while changing password. Please try again.",
      });
    } finally {
      setIsChanging(false);
    }
  };
  */

  const handleCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordStrength({ score: 0, text: "", color: "" });
    setMessage({ type: "", text: "" });
  };

  return (
    <>
      <CompactHeader />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">
                      {/* <i className="ni ni-lock-circle-open text-primary mr-2"></i> */}
                      Change Password
                    </h3>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {message.text && (
                  <Alert color={message.type} toggle={() => setMessage({ type: "", text: "" })}>
                    {message.text}
                  </Alert>
                )}

                <Form onSubmit={handlePasswordChange}>
                  <h6 className="heading-small text-muted mb-4">
                    Password Information
                  </h6>
                  <div className="pl-lg-4">
                    {/* Current Password */}
                    <FormGroup>
                      <label className="form-control-label" htmlFor="currentPassword">
                        Current Password <span className="text-danger">*</span>
                      </label>
                      <InputGroup>
                        <Input
                          className="form-control-alternative"
                          id="currentPassword"
                          name="currentPassword"
                          placeholder="Enter current password"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <InputGroupAddon addonType="append">
                          <InputGroupText
                            style={{ cursor: "pointer" }}
                            onClick={() => togglePasswordVisibility("current")}
                          >
                            <i
                              className={`ni ${
                                showPasswords.current ? "ni-bold-down" : "ni-bold-right"
                              }`}
                            />
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormGroup>

                    <hr className="my-4" />

                    {/* New Password */}
                    <FormGroup>
                      <label className="form-control-label" htmlFor="newPassword">
                        New Password <span className="text-danger">*</span>
                      </label>
                      <InputGroup>
                        <Input
                          className="form-control-alternative"
                          id="newPassword"
                          name="newPassword"
                          placeholder="Enter new password (min. 6 characters)"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <InputGroupAddon addonType="append">
                          <InputGroupText
                            style={{ cursor: "pointer" }}
                            onClick={() => togglePasswordVisibility("new")}
                          >
                            <i
                              className={`ni ${
                                showPasswords.new ? "ni-bold-down" : "ni-bold-right"
                              }`}
                            />
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      {passwordStrength.text && (
                        <small className={`text-${passwordStrength.color} mt-2 d-block`}>
                          Password Strength: <strong>{passwordStrength.text}</strong>
                        </small>
                      )}
                      <small className="text-muted mt-1 d-block">
                        Use 6+ characters with a mix of letters, numbers & symbols
                      </small>
                    </FormGroup>

                    {/* Confirm Password */}
                    <FormGroup>
                      <label className="form-control-label" htmlFor="confirmPassword">
                        Confirm New Password <span className="text-danger">*</span>
                      </label>
                      <InputGroup>
                        <Input
                          className="form-control-alternative"
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Re-enter new password"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                        <InputGroupAddon addonType="append">
                          <InputGroupText
                            style={{ cursor: "pointer" }}
                            onClick={() => togglePasswordVisibility("confirm")}
                          >
                            <i
                              className={`ni ${
                                showPasswords.confirm ? "ni-bold-down" : "ni-bold-right"
                              }`}
                            />
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      {passwordData.confirmPassword &&
                        passwordData.newPassword !== passwordData.confirmPassword && (
                          <small className="text-danger mt-2 d-block">
                            Passwords do not match
                          </small>
                        )}
                      {passwordData.confirmPassword &&
                        passwordData.newPassword === passwordData.confirmPassword && (
                          <small className="text-success mt-2 d-block">
                            <i className="ni ni-check-bold mr-1"></i>
                            Passwords match
                          </small>
                        )}
                    </FormGroup>

                    <hr className="my-4" />

                    {/* Action Buttons */}
                    <div className="text-right">
                      <Button
                        color="secondary"
                        onClick={handleCancel}
                        disabled={isChanging}
                      >
                        {/* <i className="ni ni-fat-remove mr-1"></i> */}
                        Cancel
                      </Button>
                      <Button
                        color="primary"
                        type="submit"
                        disabled={isChanging}
                        className="ml-2"
                      >
                        {isChanging ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm mr-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Changing...
                          </>
                        ) : (
                          <>
                            {/* <i className="ni ni-lock-circle-open mr-1"></i> */}
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>

          {/* Security Tips Sidebar */}
          <Col className="order-xl-2" xl="4">
            <Card className="card-profile shadow">
              <CardBody className="pt-4">
                <div className="text-center mb-3">
                  <i
                    className="ni ni-lock-circle-open"
                    style={{ fontSize: "3rem", color: "#5e72e4" }}
                  ></i>
                </div>
                <h3 className="mb-3">Password Security Tips</h3>
                <ul className="list-unstyled">
                  <li className="py-2">
                    <i className="ni ni-check-bold text-success mr-2"></i>
                    Use at least 6 characters
                  </li>
                  <li className="py-2">
                    <i className="ni ni-check-bold text-success mr-2"></i>
                    Mix uppercase and lowercase letters
                  </li>
                  <li className="py-2">
                    <i className="ni ni-check-bold text-success mr-2"></i>
                    Include numbers and symbols
                  </li>
                  <li className="py-2">
                    <i className="ni ni-check-bold text-success mr-2"></i>
                    Avoid common words or patterns
                  </li>
                  <li className="py-2">
                    <i className="ni ni-check-bold text-success mr-2"></i>
                    Don't reuse passwords
                  </li>
                </ul>
                <hr className="my-3" />
                <p className="text-sm text-muted">
                  <i className="ni ni-alert-circle-exc text-warning mr-2"></i>
                  Never share your password with anyone
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ChangePassword;
