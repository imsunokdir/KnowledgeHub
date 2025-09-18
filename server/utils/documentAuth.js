exports.canEdit = (doc, currentUser) => {
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;
  return (
    doc.createdBy && doc.createdBy.toString() === currentUser._id.toString()
  );
};
