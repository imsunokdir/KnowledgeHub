import TanStackProvider from "../tanStack/TanStackProvider";
import { AuthProvider } from "./AuthProvider";
import { DocsProvider } from "./DocsContext";
import { TeamQnAProvider } from "./TeamQnAContext";

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <TanStackProvider>
        <TeamQnAProvider>
          <DocsProvider>{children}</DocsProvider>
        </TeamQnAProvider>
      </TanStackProvider>
    </AuthProvider>
  );
};
