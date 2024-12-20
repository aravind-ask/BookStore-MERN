import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSidebar from "../components/DashSidebar";
import DashProfile from "../components/DashProfile";
import DashPosts from "../components/DashPosts";
import DashUsers from "../components/DashUsers";
import DashComments from "../components/DashComments";
import DashboardComp from "../components/DashboardComp";
import DashCategory from "../components/DashCategory";
import DashAddress from "../components/DashAddress";
import OrderList from "../components/OrderList";
import DashWallet from "../components/DashWallet";
import DashCoupon from "../components/DashCoupons";
import DashOffers from "../components/DashOffers";
import DashSales from "../components/DashSales";
import BestSellers from "../components/BestSellers";
import CreatePost from "../pages/CreatePost";


export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        {/* Sidebar */}
        <DashSidebar />
      </div>
      {/* profile... */}
      {tab === "profile" && <DashProfile />}
      {/* posts... */}
      {tab === "books" && <DashPosts />}
      {/* users */}
      {tab === "users" && <DashUsers />}
      {/* comments  */}
      {tab === "comments" && <DashComments />}
      {/* Address  */}
      {tab === "address" && <DashAddress />}
      {/* Orders  */}
      {tab === "orders" && <OrderList />}
      {/* Wallet  */}
      {tab === "wallet" && <DashWallet />}
      {/* categories  */}
      {tab === "categories" && <DashCategory />}
      {/* Coupons  */}
      {tab === "coupons" && <DashCoupon />}
      {/* Offers  */}
      {tab === "offers" && <DashOffers />}
      {/* Offers  */}
      {tab === "sales" && <DashSales />}
      {/* Offers  */}
      {tab === "bestSellers" && <BestSellers />}
      {/* dashboard comp */}
      {tab === "dash" && <DashboardComp />}
      {/* dashboard comp */}
      {tab === "add" && <CreatePost />}
    </div>
  );
}
