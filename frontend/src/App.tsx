import { useEffect, useState } from "react";
import { getHealth } from "./lib/api";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Loading...");
  const [details, setDetails] = useState("");
  const [dbInfo, setDbInfo] = useState("");

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

  const checkDb = async () => {
    try {
      const r = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health/db`);
      const d = await r.json();
      setDbInfo(JSON.stringify(d, null, 2));
    } catch {
      console.log('Db error occued.');
    }
  };

  return (
    <div>
      <h1>API Status: {status}</h1>
      <p>{details}</p>
      <button onClick={checkDb}>Ping Firestore (Emulator)</button>
      {dbInfo && <pre>{dbInfo}</pre>}
    </div>
  )
}

export default App;
