import { useEffect, useState } from "react";
import { getHealth } from "./lib/api";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Loading...");
  const [details, setDetails] = useState("");

  useEffect(() => {
    getHealth()
      .then((data) => {
        setStatus(data.status);
        setDetails(
          `${data.service} @ ${new Date(data.ts).toLocaleTimeString()}`
        );
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  return (
    <div>
      <h1>API Status: {status}</h1>
      <p>{details}</p>
    </div>
  );
}

export default App;
