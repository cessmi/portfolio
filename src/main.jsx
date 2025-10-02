import { useState } from "react";
import ReactDOM from "react-dom/client";
import Loading from "./Loading.jsx";
import Home from "./Home.jsx";
import TransitionOverlay from "./TransitionOverlay.jsx";

function App() {
  const [done, setDone] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const handleFinish = () => {
    // start glitch overlay first
    setTransitioning(true);
    setTimeout(() => {
      setTransitioning(false);
      setDone(true);
    }, 1200); // overlay lasts 1.2s
  };

  return (
    <>
      {transitioning && <TransitionOverlay />}
      {!done ? <Loading onFinish={handleFinish} /> : <Home />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);