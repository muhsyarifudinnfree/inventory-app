import React from "react";

const Footer = () => (
  <footer className="mt-auto pt-12 pb-6 border-t border-slate-200 text-center">
    <p className="text-sm text-slate-500">
      &copy; {new Date().getFullYear()} Inventory System. Built with React &
      Firebase.
    </p>
  </footer>
);

export default Footer;
