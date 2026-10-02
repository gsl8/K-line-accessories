import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './contexts/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingContact } from './components/FloatingContact';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Admin } from './pages/Admin';

function Storefront({ children }: {children: React.ReactNode;}) {
  return (
    <div className="w-full min-h-screen bg-paper font-sans text-ink antialiased">
      <Header />
      {children}
      <Footer />
      <FloatingContact />
    </div>);

}

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
            <Storefront>
                <Home />
              </Storefront>
            } />
          
          <Route
            path="/shop"
            element={
            <Storefront>
                <Shop />
              </Storefront>
            } />
          
          <Route path="/catalog" element={<Navigate to="/shop" replace />} />
          
          <Route
            path="/product/:id"
            element={
            <Storefront>
                <ProductDetail />
              </Storefront>
            } />
          
          <Route
            path="/admin"
            element={
            <div className="w-full min-h-screen bg-paper font-sans text-ink antialiased">
                <Admin />
              </div>
            } />
          
          <Route
            path="*"
            element={
            <Storefront>
                <Home />
              </Storefront>
            } />
          
        </Routes>
      </BrowserRouter>
    </StoreProvider>);

}
