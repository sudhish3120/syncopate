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
import { IoCheckmarkCircleOutline } from "react-icons/io5";

interface Match {
  username: string;
}

export default function Matches() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [matches, setMatches] = useState<Match[]>([]);
  const [concerts, setConcerts] = useState<string[]>([]);

  const deleteMatch = async (user: string) => {
    // console.log("invoked");
    // console.log(concerts);
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
              concerts: concerts,
            }),
          }
        );
        if (res.ok) {
          const response = await res.json();
          // console.log(response);
        } else {
          const response = await res.json();
          // console.log(response);
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
      // console.log("matches: ", data["matches"]);
      setMatches(data["matches"] as Match[]);
      // Flatten all concerts into a single array
      const allConcerts = data["matches"].flatMap(
        (match) => match.concerts || []
      );
      setConcerts(allConcerts);
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
        return (
          <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        );
    }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="font-sans  bg-black relative pt-20">
      <Nav />
      <main className="container mx-auto  py-8 px-8 h-screen relative">
        <h2 className="text-3xl font-md text-white mb-4">View Your Matches</h2>
        {matches.length > 0 ? (
          matches.map((match, index) => (
            <React.Fragment key={`match-${index}`}>
              <Card key={`card-${index}`} onClick={() => setOpen(true)}>
                <CardContent>{match["username"]}</CardContent>
                <CardContent
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography style={{ marginRight: "8px" }}>
                    I&apos;ve reached out
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
              <Modal
                key={`modal-${index}`}
                open={open}
                onClose={() => setOpen(false)}
              >
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
                        sx={{
                          height: 300,
                          width: 300,
                          fontSize: 100,
                        }}
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
            </React.Fragment>
          ))
        ) : (
          <div>No matches available right now. Please come back later!</div>
        )}
      </main>
    </div>
  );
}
