import axiosInstance from "./axiosInstance";

export const searchDocs = async ({ query, type }) =>
  await axiosInstance.post(
    "/search/document",
    { query, type },
    { withCredentials: true }
  );
