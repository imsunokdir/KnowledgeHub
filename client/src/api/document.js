// src/api/document.js
import axiosInstance from "./axiosInstance";

export const createDoc = async ({ title, content }) =>
  await axiosInstance.post(
    "/document",
    { title, content },
    { withCredentials: true }
  );

export const getDocument = async (id) =>
  await axiosInstance.get(`/document/${id}`, { withCredentials: true });

export const getDocuments = async (page = 1, limit = 10) =>
  await axiosInstance.get(`/document?page=${page}&limit=${limit}`, {
    withCredentials: true,
  });

export const updateDocument = async (id, data) =>
  await axiosInstance.put(`/document/${id}`, data, { withCredentials: true });

export const summarizeDocument = async (id) =>
  await axiosInstance.post(
    `/document/${id}/summarize`,
    {},
    { withCredentials: true }
  );

export const generateTagsDocument = async (id) =>
  await axiosInstance.post(
    `/document/${id}/generate-tags`,
    {},
    { withCredentials: true }
  );

export const getDocumentVersions = async (id) =>
  await axiosInstance.get(`/document/${id}/history`, { withCredentials: true });

export const getRecentEdits = async () =>
  await axiosInstance.get(`/document/activity/recent`, {
    withCredentials: true,
  });
