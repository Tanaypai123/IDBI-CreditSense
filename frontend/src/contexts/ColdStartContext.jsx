import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Info } from 'lucide-react';
import { activeRequestNotifier } from '../services/api';

const ColdStartContext = createContext(null);

export function ColdStartProvider({ children }) {
  const [showNotification, setShowNotification] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = activeRequestNotifier.subscribe((count) => {
      if (count > 0) {
        // If there's an active request and the timer isn't already running, start it
        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            setShowNotification(true);
          }, 5000);
        }
      } else {
        // If there are no active requests, clear the timer and hide the notification immediately
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setShowNotification(false);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ColdStartContext.Provider value={{ showNotification }}>
      {children}

      <AnimatePresence>
        {showNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* Premium Glassmorphic Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-xl md:max-w-lg font-inter text-slate-700"
            >
              {/* Decorative top border gradient line matching IDBI green/orange banking colors */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00796B] to-[#F26C21]" />

              <div className="flex flex-col items-center text-center space-y-6">
                {/* Spin loader */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-12 w-12 rounded-full border-4 border-[#00796B]/20 animate-pulse" />
                  <Loader2 className="h-8 w-8 text-[#00796B] animate-spin" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black tracking-tight text-[#00796B] font-poppins">
                    ⏳ Starting AI Engine...
                  </h3>
                  <p className="text-[11px] font-bold text-[#F26C21] uppercase tracking-wider font-poppins">
                    This prototype is hosted on Render Free Tier.
                  </p>
                </div>

                <div className="text-xs text-slate-550 leading-relaxed space-y-4 border-t border-slate-100 pt-5 text-left w-full">
                  <p className="font-semibold text-slate-650">
                    The first request may take 30–90 seconds while the server wakes up from an idle state.
                  </p>
                  <p className="text-slate-500">
                    Please keep this page open. Once the server becomes active, all subsequent predictions will be significantly faster.
                  </p>

                  {/* Glassmorphic Tip box */}
                  <div className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4 flex items-start space-x-3 text-slate-600">
                    <Info className="h-4.5 w-4.5 text-[#F26C21] flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700 block font-poppins text-[10px] uppercase tracking-wider">💡 Tip:</span>
                      <p className="text-[11.5px] leading-normal text-slate-550">
                        The server only needs to wake up once. After that, predictions are usually completed within a few seconds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase font-inter border-t border-slate-50 pt-4 w-full">
                  Thank you for your patience.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ColdStartContext.Provider>
  );
}

export function useColdStart() {
  const context = useContext(ColdStartContext);
  if (!context) {
    throw new Error('useColdStart must be used within a ColdStartProvider');
  }
  return context;
}
