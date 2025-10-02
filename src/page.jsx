"use client";
import * as motion from "motion/react-client"

export default function Home() {
return (
    <motion.div
        initial={{ scale:0, opacity: 0}}
        animate={{ scale:1, opacity: 1 }}
        transition={{ duration: 0.8 }}
    >
    <p className="text-5xl max-w-[700px] mt-[10rem] mx-auto font-bold underline">"PMB"</p>
    </motion.div>
)}

