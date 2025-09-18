import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../context/AuthProvider";
import { login } from "../api/user";
import LoadingButton from "../components/LoadingButton";

const Login = () => {
  const { setUser } = authContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoggingIn, setIsLogginIn] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLogginIn(true);
      const res = await login(formData);
      setMessage(res.data.message || "Login successful");
      setUser(res.data);
      navigate("/");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLogginIn(false);
    }
  };

  return (
    <div className="flex justify-center mt-20">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && (
          <p className="mb-4 text-red-600 font-semibold text-center">{error}</p>
        )}
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={(e) => handleChange(e)}
          required
          autoComplete="new-email"
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={(e) => handleChange(e)}
          required
          autoComplete="new-password"
          className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <LoadingButton
          type="submit"
          text="login"
          loadingText="Logging in..."
          loading={isLoggingIn}
        />

        {/* Signup link */}
        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Sign up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
