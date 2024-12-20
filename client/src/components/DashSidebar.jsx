import { Sidebar } from "flowbite-react";
import {
  HiUser,
  HiArrowSmRight,
  HiOutlineUserGroup,
  HiChartPie,
} from "react-icons/hi";
import {
  FaHome,
  FaBook,
  FaShoppingCart,
  FaWallet,
  FaListAlt,
  FaPercent, 
  FaTicketAlt,
  FaChartLine,
  FaStar, 
} from "react-icons/fa";

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { signoutSuccess } from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
          {currentUser && currentUser.isAdmin && (
            <Link to="/dashboard?tab=dash">
              <Sidebar.Item
                active={tab === "dash" || !tab}
                icon={HiChartPie}
                as="div"
              >
                Dashboard
              </Sidebar.Item>
            </Link>
          )}
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              label={currentUser.isAdmin ? "Admin" : "User"}
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>
          {currentUser.isAdmin && (
            <Link to="/dashboard?tab=books">
              <Sidebar.Item active={tab === "books"} icon={FaBook} as="div">
                Books
              </Sidebar.Item>
            </Link>
          )}
          {!currentUser.isAdmin && (
            <Link to="/dashboard?tab=address">
              <Sidebar.Item active={tab === "address"} icon={FaHome} as="div">
                My Addresses
              </Sidebar.Item>
            </Link>
          )}
          {!currentUser.isAdmin && (
            <Link to="/dashboard?tab=orders">
              <Sidebar.Item
                active={tab === "orders"}
                icon={FaShoppingCart}
                as="div"
              >
                My Orders
              </Sidebar.Item>
            </Link>
          )}
          {!currentUser.isAdmin && (
            <Link to="/dashboard?tab=wallet">
              <Sidebar.Item active={tab === "wallet"} icon={FaWallet} as="div">
                {" "}
                Wallet
              </Sidebar.Item>
            </Link>
          )}
          {currentUser.isAdmin && (
            <>
              <Link to="/dashboard?tab=users">
                <Sidebar.Item
                  active={tab === "users"}
                  icon={HiOutlineUserGroup}
                  as="div"
                >
                  Users
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=orders">
                <Sidebar.Item
                  active={tab === "orders"}
                  icon={FaShoppingCart}
                  as="div"
                >
                  All Orders
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=categories">
                <Sidebar.Item
                  active={tab === "categories"}
                  icon={FaListAlt}
                  as="div"
                >
                  Categories
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=coupons">
                <Sidebar.Item
                  active={tab === "coupons"}
                  icon={FaTicketAlt}
                  as="div"
                >
                  Coupons
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=offers">
                <Sidebar.Item
                  active={tab === "offers"}
                  icon={FaPercent}
                  as="div"
                >
                  Offers
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=sales">
                <Sidebar.Item
                  active={tab === "sales"}
                  icon={FaChartLine}
                  as="div"
                >
                  Sales
                </Sidebar.Item>
              </Link>
              <Link to="/dashboard?tab=bestSellers">
                <Sidebar.Item
                  active={tab === "bestSellers"}
                  icon={FaStar}
                  as="div"
                >
                  Best Sellers
                </Sidebar.Item>
              </Link>
            </>
          )}
          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
