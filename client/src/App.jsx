import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import { CartProvider } from "./context/CartContext";
import { PromoProvider } from "./context/PromoContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import ScrollToTop from "./components/common/ScrollToTop";
import ProtectedRoute, { AdminRoute } from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <PromoProvider>
            <AlertProvider>
              <ScrollToTop />
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:code" element={<ProductDetailPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  } />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            </AlertProvider>
          </PromoProvider>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
