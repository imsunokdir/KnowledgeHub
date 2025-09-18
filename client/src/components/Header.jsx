import React from "react";
import { authContext } from "../context/AuthProvider";
import Avatar from "@mui/material/Avatar";
import { Login } from "@mui/icons-material";
import { Dropdown, Space, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../api/user";
import ArticleIcon from "@mui/icons-material/Article";

const Header = () => {
  const { user, isAuth, setUser } = authContext();
  const navigate = useNavigate();
  const location = useLocation();

  // AntD message API
  const [messageApi, contextHolder] = message.useMessage();
  const key = "logoutMessage";

  const handleLogout = async () => {
    try {
      messageApi.open({
        key,
        type: "loading",
        content: "Logging out...",
      });

      const response = await logout();

      if (response.status === 200) {
        setUser(null);
        navigate("/login");
        messageApi.open({
          key,
          type: "success",
          content: "Logged out successfully!",
          duration: 2,
        });
      }
    } catch (error) {
      console.log("Logout error:", error);
      messageApi.open({
        key,
        type: "error",
        content: "Error logging out. Please try again.",
      });
    }
  };

  const items = [
    isAuth && {
      label: (
        <a className="no-underline" onClick={() => navigate("/document")}>
          Create Document
        </a>
      ),
      key: "create-doc",
      icon: <ArticleIcon sx={{ width: 20, height: 20 }} />,
    },
    isAuth
      ? {
          label: (
            <a className="no-underline" onClick={handleLogout}>
              Logout
            </a>
          ),
          key: "logout",
          icon: <Login sx={{ width: 18, height: 18 }} />,
        }
      : {
          label: (
            <a className="no-underline" onClick={() => navigate("/login")}>
              Login/Register
            </a>
          ),
          key: "login",
          icon: <Login sx={{ width: 18, height: 18 }} />,
        },
  ];

  // Decide what to show in the button
  const isTeamPage = location.pathname === "/team-qa";
  const navButtonLabel = isTeamPage ? "Dashboard" : "Team Q&A";
  const navButtonTarget = isTeamPage ? "/" : "/team-qa";

  return (
    <>
      {contextHolder} {/* Important for AntD message */}
      <header className="bg-blue-500 shadow-md p-4 fixed top-0 left-0 w-full z-50">
        <nav className="container mx-auto flex justify-between items-center">
          {/* Left side: Logo + Navigation button */}
          <div className="flex items-center space-x-4">
            <div>{/* Logo placeholder */}</div>
            {isAuth && (
              <button
                onClick={() => navigate(navButtonTarget)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium"
              >
                {navButtonLabel}
              </button>
            )}
          </div>

          {/* Right side: Greeting + dropdown */}
          <div className="flex items-center space-x-2">
            {isAuth && user?.name && (
              <span className="font-semibold text-gray-700">
                Hi, {user.name}
              </span>
            )}
            <Dropdown
              menu={{ items }}
              trigger={["click"]}
              className="bg-white shadow-md p-1 rounded-[50px] cursor-pointer hover:shadow-lg"
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <Avatar className="shadow-md ml-1" />
                  <div className="hamburger flex flex-col justify-between h-4 w-5 mr-1">
                    <span className="bg-gray-700 h-0.5 w-full rounded"></span>
                    <span className="bg-gray-700 h-0.5 w-full rounded"></span>
                    <span className="bg-gray-700 h-0.5 w-full rounded"></span>
                  </div>
                </Space>
              </a>
            </Dropdown>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
