"use client";
import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Button from "@mui/material/Button";
import {
  Card,
  CardContent,
  Typography,
} from "../../../node_modules/@mui/material/index";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

interface Match {
  username: string;
}

export default function Matches() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);

  const deleteMatch = async (user: String) => {
    console.log("invoked");
    try {
      if (user) {
        const res = await fetch(
          "http://localhost:8000/api/concerts/delete_match/",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: user,
            }),
          }
        );
        if (res.ok) {
          const response = await res.json();
          console.log(response);
        } else {
          const response = await res.json();
          console.log(response);
          throw new Error(response.error || "delete failed");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    }
  };
  const fetchMatches = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/concerts/matches", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch db matches");
      }
      const data = await res.json();
      console.log("matches: ", data);
      setMatches(data["matches"] as Match[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="font-sans  bg-black relative pt-20">
      <Nav />
      <main className="container mx-auto  py-8 px-8 h-screen relative">
        <h2 className="text-3xl font-md text-white mb-4">View Your Matches</h2>
        {matches ? (
          matches.map((match) => (
            <Card key={match["username"]}>
              <CardContent>{match["username"]}</CardContent>
              <CardContent style={{ display: "flex", alignItems: "center" }}>
                <Typography style={{ marginRight: "8px" }}>
                  I've reached out
                </Typography>
                <IoCheckmarkCircleOutline
                  onClick={() => {
                    deleteMatch(match["username"]);
                    const updatedMatches = matches.filter(
                      (m) => m.username !== match["username"]
                    );
                    setMatches(updatedMatches);
                  }}
                  size={36}
                  className="text-black hover:cursor-pointer"
                  style={{ color: "green" }}
                />
              </CardContent>
            </Card>
          ))
        ) : (
          <div>No matches available right now. Please come back later!</div>
        )}
      </main>
    </div>
  );
}
