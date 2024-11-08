import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Alert } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function WarningPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="max-w-md w-full shadow-lg rounded-lg p-6 bg-white text-center">
        <div className="flex justify-center mb-4">
          <HiOutlineExclamationCircle className="text-red-500 w-16 h-16" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Access Restricted
        </h2>
        <p className="text-gray-600 mt-2">
          Your account has been blocked. Please contact support for assistance.
        </p>

        <Alert color="warning" className="mt-4">
          <span className="font-medium">Note:</span> This restriction might be
          due to violations of our policies.
        </Alert>

        <div className="flex flex-col gap-4 mt-6">
          <Button color="failure" onClick={() => navigate("/contact-support")}>
            Contact Support
          </Button>
          <Button color="gray" onClick={() => navigate("/sign-in")}>
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
