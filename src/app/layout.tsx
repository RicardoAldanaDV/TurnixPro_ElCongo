"use client";

import "./globals.css";
import LayoutWrapper from "./layoutWrapper";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";


export default function RootLayout({ children }: any) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = "TurnixPro — Gestión de Turnos";
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <html lang="es">
      <body className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
          <AnimatePresence mode="wait">
            {showSplash ? (
              <motion.div
                key="splash"
                className="fixed inset-0 flex flex-col items-center justify-center bg-black"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <Image
                    src="/logo.png"
                    alt="Logo Alcaldía"
                    width={200}
                    height={200}
                    className="drop-shadow-[0_0_25px_#00aaff]"
                  />
                </motion.div>
                <h1 className="mt-6 text-2xl font-bold text-blue-400 drop-shadow-[0_0_10px_#00aaff]">
                  ALCALDÍA SANTA ANA ESTE DISTRITO COATEPEQUE
                </h1>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <LayoutWrapper>{children}</LayoutWrapper>
              </motion.div>
            )}
          </AnimatePresence>
      </body>
    </html>
  );
}
