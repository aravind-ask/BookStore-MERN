import { Modal, Table, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import {
  addNewAddress,
  deleteAddress,
  editAddress,
  fetchAddress,
} from "../redux/address/addressSlice";

export default function DashAddress() {
  const dispatch = useDispatch();
  const { addressList, isLoading } = useSelector((state) => state.address);
  const { currentUser } = useSelector((state) => state.user);
  const [newAddress, setNewAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [addressIdToDelete, setAddressIdToDelete] = useState("");
  const [addressIdToEdit, setAddressIdToEdit] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState({});

  useEffect(() => {
    dispatch(fetchAddress(currentUser._id));
  }, [dispatch, currentUser._id]);

  const handleAddNewAddress = async () => {
    try {
      await dispatch(addNewAddress(newAddress));
      setNewAddress({
        name: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEditAddress = async () => {
    try {
      console.log("edit:", addressToEdit._id);
      console.log("Addressedit:", addressToEdit);
      await dispatch(
        editAddress({
          userId: currentUser._id,
          addressId: addressToEdit._id,
          formData: addressToEdit,
        })
      );
      setNewAddress({
        name: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        phone: "",
      });
      dispatch(fetchAddress(currentUser._id));
      setShowEditModal(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteAddress = async () => {
    setShowModal(false);
    try {
      await dispatch(
        deleteAddress({ userId: currentUser._id, addressId: addressIdToDelete })
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {addressList.length > 0 ? (
        <>
          <div className="flex justify-center mt-4">
            <Button
              color="success"
              onClick={() => setShowModal(true)}
              className="w-full"
            >
              Add New Address
            </Button>
          </div>
          <Table hoverable className="shadow-md mt-10">
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Address</Table.HeadCell>
              <Table.HeadCell>City</Table.HeadCell>
              <Table.HeadCell>State</Table.HeadCell>
              <Table.HeadCell>pinCode</Table.HeadCell>
              <Table.HeadCell>Country</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
              <Table.HeadCell>
                <span>Delete</span>
              </Table.HeadCell>
            </Table.Head>
            {addressList.map((address) => (
              <Table.Body key={address._id} className="divide-y">
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{address.name}</Table.Cell>
                  <Table.Cell>{address.address}</Table.Cell>
                  <Table.Cell>{address.city}</Table.Cell>
                  <Table.Cell>{address.state}</Table.Cell>
                  <Table.Cell>{address.pinCode}</Table.Cell>
                  <Table.Cell>{address.phone}</Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setAddressToEdit(address);
                        setShowEditModal(true);
                        setAddressIdToEdit(address._id);
                      }}
                      className="text-teal-500 hover:underline cursor-pointer"
                    >
                      <AiOutlineEdit className="h-5 w-5" />
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowDeleteModal(true);
                        setAddressIdToDelete(address._id);
                      }}
                      className="text-red-500 hover:underline cursor-pointer"
                    >
                      <AiOutlineDelete className="h-5 w-5" />
                    </span>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          <Modal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            popup
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
                <h3 className="text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this address?
                </h3>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    color="failure"
                    onClick={handleDeleteAddress}
                    className="w-full"
                  >
                    Delete
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            popup
            size="md"
          >
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <h3 className="text-lg font-normal text-gray-500 dark:text-gray-400">
                  Edit Address
                </h3>
                <form className="flex flex-col gap-4 mt-4">
                  <input
                    type="text"
                    value={addressToEdit.name}
                    onChange={(e) =>
                      setAddressToEdit({
                        ...addressToEdit,
                        name: e.target.value,
                      })
                    }
                    placeholder="name"
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    value={addressToEdit.address}
                    onChange={(e) =>
                      setAddressToEdit({
                        ...addressToEdit,
                        address: e.target.value,
                      })
                    }
                    placeholder="address"
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    value={addressToEdit.city}
                    onChange={(e) =>
                      setAddressToEdit({
                        ...addressToEdit,
                        city: e.target.value,
                      })
                    }
                    placeholder="City"
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    value={addressToEdit.state}
                    onChange={(e) =>
                      setAddressToEdit({
                        ...addressToEdit,
                        state: e.target.value,
                      })
                    }
                    placeholder="State"
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    value={addressToEdit.pinCode}
                    onChange={(e) =>
                      setAddressToEdit({
                        ...addressToEdit,
                        pinCode: e.target.value,
                      })
                    }
                    placeholder="Pin Code"
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    value={addressToEdit.phone}
                    onChange={(e) =>
                      setAddressToEdit({
                        ...addressToEdit,
                        phone: e.target.value,
                      })
                    }
                    placeholder="Phone"
                    className="input input-bordered w-full"
                  />
                  <div className="flex justify-center gap-4">
                    <Button
                      color="success"
                      onClick={handleEditAddress}
                      className="w-full"
                    >
                      Save
                    </Button>
                    <Button
                      color="gray"
                      onClick={() => setShowEditModal(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Modal.Body>
          </Modal>
        </>
      ) : (
        <div className="flex justify-center">
          <p className="text-lg font-normal text-gray-500 dark:text-gray-400">
            No addresses found.
          </p>
        </div>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="text-lg font-normal text-gray-500 dark:text-gray-400">
              Add New Address
            </h3>
            <form className="flex flex-col gap-4 mt-4">
              <input
                type="text"
                value={newAddress.name}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, name: e.target.value })
                }
                placeholder="Name"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.address}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, address: e.target.value })
                }
                placeholder="Address"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                placeholder="City"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                placeholder="State"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.pinCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, pinCode: e.target.value })
                }
                placeholder="Pin Code"
                className="input input-bordered w-full"
              />
              <input
                type="text"
                value={newAddress.phone}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, phone: e.target.value })
                }
                placeholder="Phone"
                className="input input-bordered w-full"
              />
              <div className="flex justify-center gap-4">
                <Button
                  color="success"
                  onClick={handleAddNewAddress}
                  className="w-full"
                >
                  Save
                </Button>
                <Button
                  color="gray"
                  onClick={() => setShowModal(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
