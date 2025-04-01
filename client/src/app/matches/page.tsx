"use client";
import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import SessionExpired from "../components/SessionExpired";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Modal,
  Typography,
} from "../../../node_modules/@mui/material/index";

interface Match {
  username: string;
}

export default function Matches() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
      setMatches(data["matches"] as Match[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/user/", {
          credentials: "include",
        });

        if (res.status === 401) {
          setError("session-expired");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    fetchMatches();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error === "session-expired") {
    return <SessionExpired />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

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
            <>
              <Card key={match["username"]} onClick={() => setOpen(true)}>
                <CardContent>{match["username"]}</CardContent>
              </Card>
              <Modal key={"modal"} open={open} onClose={() => setOpen(false)}>
                <Box className="bg-space_black border-2 border-violet-700 rounded-md w-3/5 h-3/5 mx-auto mt-20 flex flex-row relative ">
                  {match["profile_photo"] ? (
                    <CardMedia
                      component="img"
                      sx={{ height: 300, width: 300 }}
                      image={match["profile_photo"]}
                      alt="Profile Picture"
                      className="rounded-md"
                    />
                  ) : (
                    <CardMedia component="div">
                      <Avatar
                        variant="square"
                        sx={{ height: 300, width: 300, fontSize: 100 }}
                      >
                        {match["username"][0]}
                      </Avatar>
                    </CardMedia>
                  )}
                  <div className="p-6 shadow-lg w-full relative">
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      className="font-semibold text-white"
                    >
                      {match["target_name"] || match["username"]}
                    </Typography>
                    <div className="flex flex-row space-x-4">
                      <Typography
                        gutterBottom
                        component="div"
                        variant="body1"
                        className="mt-2 text-violet-600"
                      >
                        {match["target_faculty"]}
                      </Typography>
                      <Typography
                        gutterBottom
                        component="div"
                        variant="body1"
                        className="mt-2 text-violet-600"
                      >
                        {match["target_academic_term"]}
                      </Typography>
                    </div>
                  </div>
                </Box>
              </Modal>
            </>
          ))
        ) : (
          <div>No matches available right now. Please come back later!</div>
        )}
      </main>
    </div>
  );
}
