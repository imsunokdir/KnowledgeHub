import axiosInstance from "./axiosInstance";

export const askQuestion = async (question) =>
  await axiosInstance.post("/qa", { question }, { withCredentials: true });
