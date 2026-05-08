import { RouterProvider } from "react-router";
import { router } from "./routes.tsx";
import { Toaster } from "./components/ui/sonner";
import { Suspense } from "react";

export default function App() {
  return (
    <>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="top-center" richColors />
    </>
  );
}
