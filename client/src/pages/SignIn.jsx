import {
  Alert,
  Button,
  Label,
  Modal,
  Spinner,
  TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import OAuth from "../components/OAuth";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'; // Import eye icons


export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [otp, setOtp] = useState(""); // add otp state
  const [showModal, setShowModal] = useState(false); // add modal state
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  useEffect(() => {
    let interval;
    if (showModal && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showModal, timer]);

  const handleSubmit = async (e, isDemo = false, demoData = null) => {
    if (e) {
      e.preventDefault();
    }
    if (!isDemo && (!formData.email || !formData.password)) {
      return dispatch(signInFailure("Please fill all the fields"));
    }
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isDemo ? demoData : formData),
      });
      const data = await res.json();
      console.log(data);
      if (data.success === false) {
        if (data.message === "Please verify your account first") {
          setShowModal(true); // show modal to enter OTP
        } else {
          dispatch(signInFailure(data.message));
        }
      }

      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false); // hide modal after OTP is verified
        dispatch(signInSuccess(data));
        navigate("/");
      } else {
        dispatch(signInFailure(data.message));
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (data.success) {
        setTimer(300);
        setCanResend(false);
      } else {
        dispatch(signInFailure(data.message));
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleDemoLogin = () => {
    handleSubmit(null, true, {
      email: "sample@gmail.com",
      password: "123456",
    });
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* left */}
        <div className="flex-1">
          <Link to="/" className="font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              ReBook
            </span>
          </Link>
          <p className="text-sm mt-5">
            Connecting readers across the world.
            <br /> You can sign in with your email and password or with Google.
          </p>
        </div>
        {/* right */}

        <div className="flex-1">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Your email" />
              <TextInput
                type="email"
                placeholder="name@company.com"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your password" htmlFor="password" />
              <div className="relative">
                <TextInput
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  id="password"
                  onChange={handleChange}
          
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center rounded-full p-1 text-gray-500 hover:text-gray-600 transition-colors focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <AiFillEyeInvisible size={20} />
                  ) : (
                    <AiFillEye size={20} />
                  )}
                </button>
              </div>
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Loading...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-5">
            <span>Dont Have an account?</span>
            <Link to="/sign-up" className="text-blue-500">
              Sign Up
            </Link>
          </div>
          <div className="flex gap-2 text-sm mt-5">
            <span>Forgot Password??</span>
            <Link to="/reset-password" className="text-blue-500">
              Reset
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
          {/* <div className="flex gap-2 mt-5">
            <Button onClick={handleDemoLogin} gradientDuoTone="greenToBlue">
              Demo Login
            </Button>
            <Button
              onClick={() => navigate("/admin/sign-in")}
              gradientDuoTone="redToYellow"
            >
              Admin Login
            </Button>
          </div> */}
        </div>
      </div>
      {/* Modal for OTP verification */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Verify Your Account"
      >
        <TextInput
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.trim())}
        />
        <p>
          Time remaining: {Math.floor(timer / 60)}:
          {(timer % 60).toString().padStart(2, "0")}
        </p>
        <Button
          gradientDuoTone="purpleToPink"
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6}
        >
          Verify OTP
        </Button>
        <Button onClick={handleResendOtp} disabled={!canResend}>
          Resend OTP
        </Button>
      </Modal>
    </div>
  );
}
