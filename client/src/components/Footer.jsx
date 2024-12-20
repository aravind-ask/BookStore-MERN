import { Footer } from "flowbite-react";
import { Link } from "react-router-dom";
import {
  BsFacebook,
  BsInstagram,
  BsTwitter,
  BsGithub,
  BsDribbble,
} from "react-icons/bs";

export default function FooterCom() {
  return (
    <Footer container className="border mt-20 border-t-8 border-teal-500">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid w-full justify-between sm:flex md:grid-cols-1">
          <div className="mt-5">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-lg sm:text-xl font-semibold dark:text-white"
            >
              <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
                ReBook
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-8 mt-4 sm:grid-cols-4 sm:gap-6">
            <div>
              <Footer.Title title="Account" />
              <Footer.LinkGroup col>
                <Link
                  to="/dashboard?tab=profile"
                  className="text-gray-600 hover:text-teal-500"
                >
                  My Account
                </Link>
                <Link
                  to="/profile/cart"
                  className="text-gray-600 hover:text-teal-500"
                >
                  Cart
                </Link>
                <Link
                  to="/profile/wishlist"
                  className="text-gray-600 hover:text-teal-500"
                >
                  Wishlist
                </Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Quick Links" />
              <Footer.LinkGroup col>
                <Link to="/about" className="text-gray-600 hover:text-teal-500">
                  About Us
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-teal-500"
                >
                  Contact Us
                </Link>
                {/* <Footer.Link href="#">FAQ</Footer.Link> */}
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Follow us" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="https://github.com/aravind-ask"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Github
                </Footer.Link>
                <Footer.Link href="https://www.linkedin.com/in/aravind-sk1507">
                  LinkedIn
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Legal" />
              <Footer.LinkGroup col>
                <Footer.Link href="#">Privacy Policy</Footer.Link>
                <Footer.Link href="#">Terms &amp; Conditions</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright
            href="#"
            by="ReBook"
            year={new Date().getFullYear()}
          />
          <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
            <Footer.Icon href="#" icon={BsFacebook} />
            <Footer.Icon href="#" icon={BsInstagram} />
            <Footer.Icon href="#" icon={BsTwitter} />
            <Footer.Icon
              href="https://github.com/aravind-ask"
              icon={BsGithub}
            />
            <Footer.Icon href="#" icon={BsDribbble} />
          </div>
        </div>
      </div>
    </Footer>
  );
}
