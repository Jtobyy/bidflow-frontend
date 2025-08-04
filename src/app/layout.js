import { Space_Grotesk } from "next/font/google";
import { ToastContainer } from "react-toastify";

import "./globals.css";
import { AuthProvider } from "./hooks/useAuth";
import { ErrorProvider } from "./hooks/useError";
import { NotificationProvider } from "./hooks/useNotification";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Bidflow",
  description: "Bidflow Procurement Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} font-sans antialiased`}>
        <AuthProvider>
          <ErrorProvider>
            <NotificationProvider>
              {children}
              <ToastContainer
                  position="bottom-left"
                  autoClose={5000}
                  hideProgressBar={true}
                  newestOnTop={true}
                  closeOnClick
                  rtl={false}
                  draggable
                  pauseOnHover
              />
            </NotificationProvider>
          </ErrorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}