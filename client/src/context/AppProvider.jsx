import { AuthProvider } from "./AuthProvider";
import { DocsProvider } from "./DocsContext";

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <DocsProvider>{children}</DocsProvider>
    </AuthProvider>
  );
};
