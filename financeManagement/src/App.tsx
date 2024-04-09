import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/homePage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import MainPage from "./pages/mainMenu";
import TaxTransactionPage from "./pages/taxTransactionPage";
import TaxTransDownloadPage from "./pages/taxTransDownloadPage";
import UploadBankTransactionListsPage from "./pages/uploadBankTransactionListsPage";
import SettingsPage from "./pages/settingsPage";
import { useHooks } from "./hooks";
import { ThemeProvider } from "@/components/theme-provider";
import React from "react";
import { BackgroupAnimation } from "./feature/BackgroundAnimation";
import ViewUploadedTransactionsPage from "./pages/viewUploadedTransactionsPage";
import ViewBankTransactionLists from "./pages/viewBankTransactionListsPage";
import FinanceDepartmentFeatures from "./pages/financeDepartmentFeaturesPage";
import MissingTransactionsPage from "./pages/missingTransactionsPage";



interface ProtectedRouteProps {
  children: React.ReactNode;
}

function App() {
  const { logedInUser } = useHooks();

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    if (!logedInUser) {
      return <Navigate to="/" />;
    } else {
      return children;
    }
  };

  return (
    <>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <div className="w-full h-svh">
          <BackgroupAnimation />
          <div className="absolute z-10 w-full top-0">
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />}></Route>
                <Route path="/login" element={<LoginPage />}></Route>
                <Route path="/signup" element={<SignUpPage />}></Route>
                <Route
                  path="/main"
                  element={
                    <ProtectedRoute>
                      <MainPage />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/main/missing-transactions"
                  element={
                    <ProtectedRoute>
                      <MissingTransactionsPage />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/main/finance-department-features"
                  element={
                    <ProtectedRoute>
                      <FinanceDepartmentFeatures />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/main/tax-transaction-form"
                  element={
                    <ProtectedRoute>
                      <TaxTransactionPage />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/main/download-transaction"
                  element={
                    <ProtectedRoute>
                      <TaxTransDownloadPage />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/main/upload-bank-transaction-lists"
                  element={
                    <ProtectedRoute>
                      <UploadBankTransactionListsPage />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/main/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/main/view-uploaded-transactions"
                  element={
                    <ProtectedRoute>
                      <ViewUploadedTransactionsPage />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/main/view-bank-transaction-lists"
                  element={
                    <ProtectedRoute>
                      <ViewBankTransactionLists />
                    </ProtectedRoute>
                  }
                ></Route>
              </Routes>
            </Router>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}

export default App;
