import axiosInstance from "./axiosInstance";

export const login = async ({ email, password }) =>
  await axiosInstance.post(
    "/auth/login",
    {
      email,
      password,
    },
    { withCredentials: true }
  );

export const register = async ({ email, password, name }) =>
  await axiosInstance.post(
    "/auth/register",
    {
      email,
      password,
      name,
    },
    { withCredentials: true }
  );

export const getUser = async () =>
  await axiosInstance.get("/auth/me", { withCredentials: true });

export const logout = async () =>
  await axiosInstance.post("/auth/logout", {}, { withCredentials: true });

export const getUsers = async (search = "") =>
  await axiosInstance.get("/user/get-users", {
    params: { search },
  });
