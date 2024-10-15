import React from "react";
import { Link } from "react-router-dom";
import { Button, Modal } from "flowbite-react";

export default function OrderSuccess() {
  return (
    <div className="max-w-4xl mx-auto p-4 pt-6">
      <Modal show={true} size="lg">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="text-lg font-normal text-gray-500 dark:text-gray-400">
              Order Placed Successfully!
            </h3>
            <div className="flex flex-col gap-4 mt-4">
              <p className="text-gray-500 dark:text-gray-400">
                Thank you for placing your order with us. We will process your
                order as soon as possible.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Your order number is: #123456
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                You can track the status of your order in your account
                dashboard.
              </p>
              <Link to="/orders">
                <Button color="success" className="w-full">
                  View Order Status
                </Button>
              </Link>
              <Link to="/">
                <Button color="gray" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

