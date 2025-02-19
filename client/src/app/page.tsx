"use client";

import { useEffect, useState } from "react";
import { fetchHomeMessage } from "../../utils/api";

export default function Home() {
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHomeMessage()
      .then(data => {
        if (data) {
          setMessage(data.message);
        } else {
          setError("Failed to load message");
        }
      })
      .catch(() => setError("An error occurred"));
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold underline">Welcome to Syncopate!</h1>
      </main>
      <div>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : message ? (
          <p>{message}</p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
