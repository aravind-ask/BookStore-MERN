import { Modal, Table, Button, Spinner, Pagination } from "flowbite-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { FaCheck, FaTimes, FaUnlock, FaLock } from "react-icons/fa";

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userIdToUpdate, setUserIdToUpdate] = useState("");
  const [updateAction, setUpdateAction] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [totalPages, setTotalPages] = useState(1); // Total pages for pagination
  const usersPerPage = 9; // Define users per page

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true); // Start loading
      try {
        const res = await fetch(
          `/api/user/getusers?page=${currentPage}&limit=${usersPerPage}`
        );
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          setFilteredUsers(data.users); // Initially set filtered users to full list
          setTotalPages(data.totalPages || 1); // Ensure totalPages has a fallback value
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id, currentPage]); // Refetch users when currentPage changes

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = users.filter((user) => {
      const username = user.username.toLowerCase();
      const email = user.email.toLowerCase();
      return username.includes(query) || email.includes(query);
    });
    setFilteredUsers(filtered);
  };

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`/api/user/${updateAction}/${userIdToUpdate}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((user) => {
            if (user._id === userIdToUpdate) {
              user.isBlocked = updateAction === "block";
            }
            return user;
          })
        );
        setShowModal(false);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // Update the current page
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {currentUser.isAdmin ? (
        <>
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search users"
            className="w-full mb-4 p-2 pl-10 text-sm text-gray-700"
          />
          {/* Loading Spinner */}
          {isLoading ? (
            <div className="flex justify-center">
              <Spinner aria-label="Loading users" size="lg" />
            </div>
          ) : (
            <>
              {filteredUsers.length > 0 ? (
                <>
                  <Table hoverable className="shadow-md">
                    <Table.Head>
                      <Table.HeadCell>Date created</Table.HeadCell>
                      <Table.HeadCell>User image</Table.HeadCell>
                      <Table.HeadCell>Username</Table.HeadCell>
                      <Table.HeadCell>Email</Table.HeadCell>
                      <Table.HeadCell>Admin</Table.HeadCell>
                      <Table.HeadCell>Block/Unblock</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {filteredUsers.map((user) => (
                        <Table.Row
                          key={user._id}
                          className="bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                          <Table.Cell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </Table.Cell>
                          <Table.Cell>
                            <img
                              src={user.profilePicture}
                              alt={user.username}
                              className="w-10 h-10 object-cover bg-gray-500 rounded-full"
                            />
                          </Table.Cell>
                          <Table.Cell>{user.username}</Table.Cell>
                          <Table.Cell>{user.email}</Table.Cell>
                          <Table.Cell>
                            {user.isAdmin ? (
                              <FaCheck className="text-green-500" />
                            ) : (
                              <FaTimes className="text-red-500" />
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {user.isBlocked ? (
                              <span
                                onClick={() => {
                                  setShowModal(true);
                                  setUserIdToUpdate(user._id);
                                  setUpdateAction("unblock");
                                }}
                                className="font-medium text-yellow-500 hover:underline cursor-pointer"
                              >
                                <FaLock className="inline-block mr-1" /> Blocked
                              </span>
                            ) : (
                              <span
                                onClick={() => {
                                  setShowModal(true);
                                  setUserIdToUpdate(user._id);
                                  setUpdateAction("block");
                                }}
                                className="font-medium text-yellow-500 hover:underline cursor-pointer"
                              >
                                <FaUnlock className="inline-block mr-1" />{" "}
                                Unblocked
                              </span>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                  {/* Pagination Component */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    className="mt-4"
                  />
                </>
              ) : (
                <p>No users found!</p>
              )}
            </>
          )}
        </>
      ) : (
        <p>You have no users yet!</p>
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
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              {updateAction === "block"
                ? `Are you sure you want to block this user?`
                : `Are you sure you want to unblock this user?`}
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color={updateAction === "block" ? "failure" : "success"}
                onClick={handleUpdateUser}
              >
                {updateAction === "block" ? "Block" : "Unblock"}
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
