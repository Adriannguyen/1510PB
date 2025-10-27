/*!

=========================================================
* About Us Modal Component
* Created: October 2025
=========================================================

*/

import React from "react";
import { Modal, ModalBody } from "reactstrap";

const AboutUsModal = ({ isOpen, toggle }) => {
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      className="about-us-modal"
      contentClassName="modal-compact"
    >
      <ModalBody className="p-0">
        <div className="d-flex align-items-stretch">
          {/* Left Side - Logo */}
          <div
            className="d-flex align-items-center justify-content-center bg-white"
            style={{
              width: "40%",
              padding: "30px 25px",
              borderRight: "1px solid #e9ecef",
            }}
          >
            <div className="text-center">
              <img
                src={process.env.PUBLIC_URL + "/2.jpg"}
                alt="Logo"
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "contain",
                  marginBottom: "12px",
                }}
              />
<<<<<<< HEAD
              <h4 className="mb-0 font-weight-bold text-primary">
                MAIL SYSTEM
              </h4>
=======
              <h4 className="mb-0 font-weight-bold text-primary">PROMPT BOX</h4>
>>>>>>> c60f2993ad775ada0a775ccda1f1abcd3496cd30
            </div>
          </div>

          {/* Right Side - Info */}
          <div
            className="d-flex flex-column justify-content-center"
            style={{
              width: "60%",
              padding: "30px 25px",
              background: "linear-gradient(87deg, #f7f8f9 0, #ffffff 100%)",
            }}
          >
            <h5
              className="font-weight-bold mb-2"
              style={{ color: "#32325d", fontSize: "1rem" }}
            >
              PROMPT BOX
            </h5>
<<<<<<< HEAD
            <p
              className="mb-3 text-muted font-weight-600"
              style={{ fontSize: "0.875rem" }}
            >
              Nguyễn Phú Đức
=======
            <p className="mb-3 text-muted font-weight-600" style={{ fontSize: "0.875rem" }}>
              AI-driven Mail System
>>>>>>> c60f2993ad775ada0a775ccda1f1abcd3496cd30
            </p>

            <div className="mb-0">
              <p className="mb-1" style={{ fontSize: "0.8125rem" }}>
                <strong>Version:</strong> 2025.0519.1020.00.Release
              </p>
              <p className="mb-1" style={{ fontSize: "0.8125rem" }}>
                <strong>Contact:</strong>{" "}
                <a
                  //href="mailto:phu.duc.ng@example.com"
                  className="text-primary"
                  style={{ textDecoration: "none" }}
                >
                  phu.duc.ng, cong.ngx
                </a>
              </p>
              <p className="mb-1" style={{ fontSize: "0.8125rem" }}>
                <a
                  href="#opensource"
                  className="text-default"
                  style={{ textDecoration: "none" }}
                  onClick={(e) => e.preventDefault()}
                >
                  Open source license
                </a>
              </p>
              <p className="mb-0" style={{ fontSize: "0.8125rem" }}>
                <a
                  href="#terms"
                  className="text-default"
                  style={{ textDecoration: "none" }}
                  onClick={(e) => e.preventDefault()}
                >
                  Terms of service
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button onClick={toggle} className="btn-close-modal" aria-label="Close">
          <i className="ni ni-fat-remove"></i>
        </button>
      </ModalBody>

      {/* Custom CSS */}
      <style jsx="true">{`
        .about-us-modal {
          display: flex !important;
          align-items: center !important;
        }

        .about-us-modal .modal-dialog {
          max-width: 550px !important;
          width: 100% !important;
          margin: 0 auto !important;
          display: flex !important;
          align-items: center !important;
          min-height: auto !important;
          max-height: none !important;
        }

        .about-us-modal .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 15px 35px rgba(50, 50, 93, 0.2),
            0 5px 15px rgba(0, 0, 0, 0.17);
          overflow: hidden;
          width: 100%;
          height: auto !important;
          max-height: none !important;
        }

        .modal-compact {
          width: 100%;
          max-width: 550px;
        }

        .about-us-modal .modal-body {
          padding: 0 !important;
          position: relative;
          height: auto !important;
        }

        .about-us-modal .d-flex.align-items-stretch {
          min-height: auto !important;
          height: auto !important;
        }

        .about-us-modal h4 {
          color: #5e72e4;
          font-size: 0.875rem;
          letter-spacing: 0.5px;
        }

        .about-us-modal h5 {
          font-size: 1rem;
          letter-spacing: 0.3px;
        }

        .about-us-modal .text-muted {
          color: #8898aa !important;
        }

        .about-us-modal a {
          transition: all 0.2s ease;
        }

        .about-us-modal a:hover {
          opacity: 0.8;
        }

        .btn-close-modal {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.05);
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .btn-close-modal:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .btn-close-modal i {
          font-size: 0.875rem;
          color: #525f7f;
        }

        @media (max-width: 768px) {
          .about-us-modal .modal-dialog {
            max-width: 95% !important;
            margin: 0 auto !important;
          }

          .about-us-modal .d-flex.align-items-stretch {
            flex-direction: column !important;
          }

          .about-us-modal .d-flex.align-items-stretch > div {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid #e9ecef;
            padding: 25px 20px !important;
          }
        }
      `}</style>
    </Modal>
  );
};

export default AboutUsModal;
