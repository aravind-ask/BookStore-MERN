import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Table,
  TextInput,
  Label,
  Toast,
  ToggleSwitch,
} from "flowbite-react";
import { HiCheckCircle, HiXCircle, HiPencilAlt, HiTrash } from "react-icons/hi";

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    expiryDate: "",
    isActive: true,
    maxUsage: 0,
  });
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null); // For editing coupon

  // Fetch coupons from API on load
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch("/api/coupon");
        const data = await res.json();
        setCoupons(data);
      } catch (error) {
        console.error("Failed to fetch coupons", error);
        setMessage("Failed to fetch coupons");
        setIsError(true);
      }
    };
    fetchCoupons();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value });
  };

  // Handle create or update coupon
  const handleCreateOrUpdateCoupon = async (e) => {
    e.preventDefault();
    const url = editingCouponId
      ? `/api/coupon/edit/${editingCouponId}`
      : "/api/coupon";
    const method = editingCouponId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create or update coupon");
      }

      // Update coupon list
      if (editingCouponId) {
        setCoupons(
          coupons.map((coupon) =>
            coupon._id === editingCouponId ? data.coupon : coupon
          )
        );
      } else {
        setCoupons([...coupons, data.coupon]);
      }

      setMessage(
        editingCouponId
          ? "Coupon updated successfully"
          : "Coupon created successfully"
      );
      setIsError(false);
      setNewCoupon({ code: "", discount: "", expiryDate: "", isActive: true });
      setEditingCouponId(null); // Reset editing state
    } catch (error) {
      setMessage(error.message || "An error occurred");
      setIsError(true);
    }
  };

  // Handle edit coupon
  const handleEditCoupon = (coupon) => {
    setNewCoupon(coupon);
    setEditingCouponId(coupon._id);
  };

  // Handle delete coupon
  const handleDeleteCoupon = async (couponId) => {
    try {
      const res = await fetch(`/api/coupon/${couponId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete coupon");

      setCoupons(coupons.filter((coupon) => coupon._id !== couponId));
      setMessage("Coupon deleted successfully");
      setIsError(false);
    } catch (error) {
      setMessage(error.message || "An error occurred");
      setIsError(true);
    }
  };

  // Handle toggle active/inactive
  const toggleCouponActive = async (coupon) => {
    try {
      const updatedCoupon = { ...coupon, isActive: !coupon.isActive };
      const res = await fetch(`/api/coupon/${coupon._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCoupon),
      });

      if (!res.ok) throw new Error("Failed to update coupon status");

      setCoupons(
        coupons.map((c) => (c._id === coupon._id ? updatedCoupon : c))
      );
      setMessage("Coupon status updated successfully");
      setIsError(false);
    } catch (error) {
      setMessage(error.message || "An error occurred");
      setIsError(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Coupon Management</h1>

      {/* Toast Notification */}
      {message && (
        <div className="fixed top-5 right-5 z-50">
          <Toast>
            {isError ? (
              <HiXCircle className="h-5 w-5 text-red-500" />
            ) : (
              <HiCheckCircle className="h-5 w-5 text-green-500" />
            )}
            <div className="ml-3 text-sm font-normal">{message}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}

      {/* Main layout: Coupons list on the left, form on the right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Coupons Table */}
        <Card className="lg:w-2/3">
          <h2 className="text-xl font-bold mb-4">Existing Coupons</h2>
          {coupons.length > 0 ? (
            <Table hoverable className="shadow-md">
              <Table.Head>
                <Table.HeadCell>Coupon Code</Table.HeadCell>
                <Table.HeadCell>Discount (%)</Table.HeadCell>
                <Table.HeadCell>Expiry Date</Table.HeadCell>
                <Table.HeadCell>Active?</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {coupons.map((coupon) => (
                  <Table.Row key={coupon._id}>
                    <Table.Cell>{coupon.code}</Table.Cell>
                    <Table.Cell>{coupon.discount}</Table.Cell>
                    <Table.Cell>
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <ToggleSwitch
                        checked={coupon.isActive}
                        label=""
                        onChange={() => toggleCouponActive(coupon)}
                      />
                    </Table.Cell>
                    <Table.Cell className="flex space-x-2">
                      <Button
                        size="xs"
                        color="info"
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        <HiPencilAlt className="mr-1" /> Edit
                      </Button>
                      <Button
                        size="xs"
                        color="failure"
                        onClick={() => handleDeleteCoupon(coupon._id)}
                      >
                        <HiTrash className="mr-1" /> Delete
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <p className="text-gray-500">No coupons available.</p>
          )}
        </Card>

        {/* Create Coupon Form */}
        <Card className="lg:w-1/3 shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            {editingCouponId ? "Edit Coupon" : "Create New Coupon"}
          </h2>
          <form
            onSubmit={handleCreateOrUpdateCoupon}
            className="flex flex-col gap-4"
          >
            <div>
              <Label htmlFor="code">Coupon Code</Label>
              <TextInput
                id="code"
                name="code"
                placeholder="Enter coupon code"
                value={newCoupon.code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <Label htmlFor="discount">Discount (%)</Label>
                <TextInput
                  id="discount"
                  name="discount"
                  type="number"
                  placeholder="e.g. 10"
                  value={newCoupon.discount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="maxusage">Maximum Usage</Label>
                <TextInput
                  id="maxUsage"
                  name="maxUsage"
                  type="number"
                  value={newCoupon.maxUsage}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="w-1/2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <TextInput
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={newCoupon.expiryDate}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" gradientDuoTone="purpleToBlue">
              {editingCouponId ? "Update Coupon" : "Create Coupon"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
