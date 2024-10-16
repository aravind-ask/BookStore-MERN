import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Modal,
  Toast,
} from "flowbite-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PasswordReset() {
  const [email, setEmail] = useState();
  const [otp, setOtp] = useState();
  const [newPassword, setNewPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!email) {
      return setErrorMessage("Please fill out all fields.");
    }
    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      if (response.data.success) {
        setShowModal(true);
        setSuccessMessage("OTP sent successfully");
      } else {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage("Error sending OTP. Please try again.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!otp || !newPassword || !confirmPassword) {
      return setErrorMessage("Please fill out all fields.");
    }
    if (newPassword !== confirmPassword) {
      return setErrorMessage("New password and confirm password do not match.");
    }
    try {
      const response = await axios.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      const res = response.json()
      console.log(res)
      console.log(response);
      if (response.data.success) {
        setSuccessMessage("Password reset successfully");
        navigate("/sign-in");
      } 
      if(!response.data.success) {
        setErrorMessage(response.data.message);
      }
    } catch (error) {
      setErrorMessage("Error resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-center mb-6">
          Reset Password
        </h3>
        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
            <div>
              <Label value="Your email" />
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <Link to="/sign-in" className="text-blue-500">
              Go back
            </Link>
          </div>

          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Toast
              className="mt-5"
              color="success"
              icon={true}
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Toast>
          )}

          <Modal
            show={showModal}
            size="md"
            popup={true}
            onClose={() => setShowModal(false)}
          >
            <Modal.Header />
            <Modal.Body>
              <h3 className="mb-4 text-lg font-semibold">
                Enter OTP and New Password
              </h3>
              {errorMessage && (
                <Alert className="mt-5" color="failure">
                  {errorMessage}
                </Alert>
              )}
              <form className="flex flex-col gap-4">
                <div>
                  <Label value="OTP" />
                  <TextInput
                    type="text"
                    placeholder="Enter OTP"
                    id="otp"
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <div>
                  <Label value="New Password" />
                  <TextInput
                    type="password"
                    placeholder="Enter new password"
                    id="newPassword"
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label value="Confirm Password" />
                  <TextInput
                    type="password "
                    placeholder="Confirm new password"
                    id="confirmPassword"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  gradientDuoTone="purpleToPink"
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="pl-3">Loading...</span>
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </div>
  );
}
