import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface SubLink {
  name: string;
  path: string;
}

interface FlyoutLinkProps {
  label: string;
  href?: string;
  children?: React.ReactNode;
  subLinks?: SubLink[];
}

const FlyoutLink = ({ label, href, subLinks, children }: FlyoutLinkProps) => {
  const [open, setOpen] = useState(false);
  const showFlyout = open && (subLinks || children);

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative h-full w-fit"
    >
      {/* Main Link Trigger */}
      <div className="relative z-20">
        {href ? (
          <Link
            to={href}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {label}
            {(subLinks || children) && <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />}
          </Link>
        ) : (
          <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
            {label}
            {(subLinks || children) && <ChevronDown size={14} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />}
          </button>
        )}
        
        {/* Animated Underline */}
        <span
          style={{ transform: showFlyout ? "scaleX(1)" : "scaleX(0)" }}
          className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full bg-blue-600 transition-transform duration-300 ease-out"
        />
      </div>

      {/* The Mega Menu Dropdown */}
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 top-12 -translate-x-1/2 bg-white dark:bg-slate-900 text-black dark:text-white p-4 shadow-2xl rounded-xl border border-gray-100 dark:border-slate-700 min-w-[200px] z-50"
          >
            {/* Decorative Triangle */}
            <div className="absolute -top-6 left-0 right-0 h-6 bg-transparent" />
            <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white dark:bg-slate-900 border-l border-t border-gray-100 dark:border-slate-700" />

            {/* Content Logic */}
            {subLinks && (
              <div className="flex flex-col gap-1">
                {subLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className="block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-left"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlyoutLink;