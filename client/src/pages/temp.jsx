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

export default function Addresses() {
  const dispatch = useDispatch();
  const { addressList, isLoading } = useSelector((state) => state.address);
  const { currentUser } = useSelector((state) => state.auth);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [addressIdToDelete, setAddressIdToDelete] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAddress(currentUser._id));
  }, [dispatch, currentUser._id]);

  const handleAddNewAddress = async () => {
    try {
      await dispatch(addNewAddress(newAddress));
      setNewAddress({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleEditAddress = async (addressId) => {
    try {
      await dispatch(editAddress(currentUser._id, addressId, newAddress));
      setNewAddress({
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteAddress = async () => {
    setShowModal(false);
    try {
      await dispatch(deleteAddress(currentUser._id, addressIdToDelete));
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {addressList.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Street</Table.HeadCell>
              <Table.HeadCell>City</Table.HeadCell>
              <Table.HeadCell>State</Table.HeadCell>
              <Table.HeadCell>Zip</Table.HeadCell>
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
                  <Table.Cell>{address.street}</Table.Cell>
                  <Table.Cell>{address.city}</Table.Cell>
                  <Table.Cell>{address.state}</Table.Cell>
                  <Table.Cell>{address.zip}</Table.Cell>
                  <Table.Cell>{address.country}</Table.Cell>
                  <Table.Cell>
                    <Link
                      className="text-teal-500 hover:underline"
                      to={`/update-address/${address._id}`}
                    >
                      <AiOutlineEdit className="h-5 w-5" />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
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
            show={showModal}
            onClose={() => setShowModal(false)}
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
                    onClick={() => setShowModal(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No addresses found.
        </p>
      )}
      <div className="flex justify-center mt-4">
        <Button
          color="success"
          onClick={handleAddNewAddress}
          className="w-full"
        >
          Add New Address
        </Button>
      </div>
    </div>
  );
}
