import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Header from "./components/Header";
import Footer from "./components/Footer";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import CreatePost from "./pages/CreatePost";
import UpdateBook from "./pages/UpdateBook";
import PostPage from "./pages/PostPage";
import ScrollToTop from "./components/ScrollToTop";
import Search from "./pages/Search";
import LoginProtected from "./components/LoginProtected";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/sign-in"
          element={
            <LoginProtected>
              <SignIn />
            </LoginProtected>
          }
        />
        <Route
          path="/sign-up"
          element={
            <LoginProtected>
              <SignUp />
            </LoginProtected>
          }
        />
        <Route path="/books" element={<Search />} />
        <Route path="/book/:bookSlug" element={<PostPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-book/:bookId" element={<UpdateBook />} />
        </Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
