import React, { useEffect, useState } from "react";
import { AutoComplete, Select, Button, message, Tag } from "antd";
import { getUsers } from "../api/user";
import { addMember } from "../api/document";

const { Option } = Select;

const AddMemberForm = ({ documentId, members = [], onMemberAdded }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  // Fetch users matching input
  const handleSearch = async (value) => {
    setEmail(value);
    if (!value) {
      setOptions([]);
      return;
    }
    try {
      const res = await getUsers(value); // e.g., GET /users?search=email
      setOptions(
        res.data.data.map((user) => ({ value: user.email, label: user.email }))
      );
    } catch (err) {
      console.error("fetch users failed", err);
    }
  };

  const handleSubmit = async () => {
    if (!email) {
      message.warning("Please select a user");
      return;
    }

    setLoading(true);
    try {
      const res = await addMember(documentId, { email, role });
      message.success("Member added successfully!");
      setEmail("");
      setRole("viewer");
      setOptions([]);
      console.log("red:", res);
      if (onMemberAdded) onMemberAdded(res.data.members); // update parent
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message || "Failed to add member. Try again."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("members:", members);
  }, [members]);
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
      <h4 className="text-slate-900 font-semibold">Add Member</h4>

      {/* Existing members */}
      {members.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <Tag
              key={m.user._id}
              color={
                m.role === "admin"
                  ? "red"
                  : m.role === "editor"
                  ? "blue"
                  : "green"
              }
            >
              {m.user.email} ({m.role})
            </Tag>
          ))}
        </div>
      )}

      {/* Email input */}
      <AutoComplete
        options={options}
        onSearch={handleSearch}
        value={email}
        onSelect={(val) => setEmail(val)}
        placeholder="Search user by email"
        className="w-full"
      />

      {/* Role select */}
      <Select value={role} onChange={setRole} className="w-full">
        <Option value="viewer">Viewer</Option>
        <Option value="editor">Editor</Option>
        <Option value="admin">Admin</Option>
      </Select>

      {/* Submit button */}
      <Button
        type="primary"
        onClick={handleSubmit}
        loading={loading}
        className="w-full"
      >
        Add Member
      </Button>
    </div>
  );
};

export default AddMemberForm;
