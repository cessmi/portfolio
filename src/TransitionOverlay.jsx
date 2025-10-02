import { motion } from "framer-motion";
import "./index.css";

export default function TransitionOverlay() {
  return (
    <motion.div
      className="transition-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.8, 0], filter: ["contrast(100%)", "contrast(300%)", "contrast(100%)"] }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <div className="transition-static" />
    </motion.div>
  );
}