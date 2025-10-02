// // src/Home.jsx
// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import PMBLogo from "./PMBLogo.jsx";
// import NeonBackground from "./NeonBackground.jsx";
// import Nav from "./Nav.jsx";
// import Footer from "./Footer.jsx";
// import FloatingSprites from "./FloatingSprites.jsx";
// import TypeConsole from "./TypeConsole.jsx";
// import { SoundToggleButton } from "./Howler.jsx";
// import SupermanComet from "./SupermanComet.jsx";
// import MousePointer from "./MousePointer.jsx";

// export default function Home() {
//   const [akira, setAkira] = useState(false);

//   useEffect(() => {
//     document.body.classList.toggle("akira-mode", akira);
//     return () => document.body.classList.remove("akira-mode");
//   }, [akira]);

//   return (
//     <motion.div
//       className="home-root min-h-screen grid place-items-center"
//       style={{ background: "var(--bg)" }}
//       initial={{ opacity: 0, filter: "contrast(300%) hue-rotate(30deg)" }}
//       animate={{ opacity: 1, filter: "contrast(100%) hue-rotate(0deg)" }}
//       transition={{ duration: 0.9, ease: "easeOut" }}
//     >
//       {/* PMB logo overlay (independent of HUD) */}
//       <div className="absolute inset-0 z-[60] grid place-items-center pointer-events-none">
//         <motion.div className="pointer-events-auto">
//           <PMBLogo />
//         </motion.div>
//       </div>

//       {/* HUD frame (background, nav, console, footer) */}
//       <div className="hud-frame relative w-full max-w-[1100px] h-[78vh] mx-auto">
//         <div className="bg-texture" aria-hidden />
//         <NeonBackground akira={akira} zoom={0} />
//         <MousePointer />
//         <SupermanComet />
//         <FloatingSprites count={10} />
//         <div className="vhs-overlay" aria-hidden />
//         <Nav onTogglePalette={() => setAkira((a) => !a)} paletteLabel={akira ? "Cyan Mode" : "AKIRA Mode"} />
//         <div className="corner tl" />
//         <div className="corner tr" />
//         <div className="corner bl" />
//         <div className="corner br" />
//         <section className="absolute bottom-16 left-0 right-0 z-20 grid place-items-center">
//           <TypeConsole />
//         </section>
//         <Footer />
//         <div className="absolute bottom-2 right-2 z-20">
//           <SoundToggleButton className="btn-neon" />
//         </div>
//       </div>
//     </motion.div>
//   );
// }