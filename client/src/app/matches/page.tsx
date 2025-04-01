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
  const [openMatch, setOpenMatch] = useState<Match | null>(null);

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
          // const response = await res.json();
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
      console.log("matches: ", data["matches"]);
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
    <div className="relative pt-20">
      <Nav />
      <main className="container mx-auto  py-8 px-8 h-screen relative">
        <Typography variant="h3" marginBottom={2}>
          View Your Matches
        </Typography>
        {matches.length > 0 ? (
          matches.map((match, index) => (
            <React.Fragment key={`match-${index}`}>
              <Card
                key={`card-${index}`}
                onClick={() => setOpenMatch(match)}
                className="flex align-middle justify-between px-3 mb-10"
              >
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  {match["target_name"] || match["username"]}
                </CardContent>
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
                open={openMatch === match}
                onClose={() => setOpenMatch(null)}
              >
                <Box className="bg-space_black rounded-md w-3/5 h-3/5 mx-auto mt-20 flex flex-row relative">
                  {match["profile_photo"] ? (
                    <CardMedia
                      component="img"
                      sx={{ width: "50%" }}
                      image={match["profile_photo"]}
                      alt="Profile Picture"
                    />
                  ) : (
                    <CardMedia component="div">
                      <Avatar variant="square" sx={{ width: "50%" }}>
                        {match["username"][0]}
                      </Avatar>
                    </CardMedia>
                  )}
                  <div className="p-6 shadow-lg w-full relative">
                    <Typography
                      variant="h3"
                      component="div"
                      className="font-semibold text-white"
                    >
                      {match["target_name"] || match["username"]}
                    </Typography>
                    <div className="flex flex-col mt-2">
                      <Typography
                        fontWeight={600}
                        marginBottom={1}
                        className="text-yellow-600"
                      >
                        {match["target_faculty"] || "unknown faculty"}
                        {((!match["target_faculty"] &&
                          !match["target_academic_term"]) ||
                          (match["target_faculty"] &&
                            match["target_academic_term"])) &&
                          " - "}
                        {match["target_academic_term"] ||
                          "unknown academic term"}
                      </Typography>
                      <Box
                        sx={{
                          maxHeight: 200,
                          overflowY: "auto",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          padding: 2,
                          borderRadius: 1,
                          width: "100%",
                        }}
                      >
                        <div className="mb-3">
                          <Typography>Top Artists:</Typography>
                          {match["top_artists"].length > 0 ? (
                            match["top_artists"].map((artist, index) => (
                              <Typography
                                key={index}
                                className="text-white"
                                fontWeight={600}
                              >
                                {artist}
                              </Typography>
                            ))
                          ) : (
                            <Typography
                              key={index}
                              className="text-white"
                              fontWeight={600}
                              sx={{ marginBottom: 1 }}
                            >
                              No top artists.
                            </Typography>
                          )}
                        </div>
                        <div>
                          <Typography>Top Genres:</Typography>
                          {match["top_genres"].length > 0 ? (
                            match["top_genres"].map((genre, index) => (
                              <Typography
                                key={index}
                                className="text-white"
                                fontWeight={600}
                              >
                                {genre}
                              </Typography>
                            ))
                          ) : (
                            <Typography
                              key={index}
                              className="text-white"
                              fontWeight={600}
                              sx={{ marginBottom: 1 }}
                            >
                              No top genres.
                            </Typography>
                          )}
                        </div>
                      </Box>
                    </div>
                    <div className="mt-3">
                      {match["user_socials"]["discord"] && (
                        <div className="flex">
                          <Typography fontWeight={800} marginRight={1}>
                            Discord:
                          </Typography>
                          <Typography>
                            @{match["user_socials"]["discord"]}
                          </Typography>
                        </div>
                      )}
                      {match["user_socials"]["instagram"] && (
                        <div className="flex">
                          <Typography fontWeight={800} marginRight={1}>
                            Instagram:
                          </Typography>
                          <Typography>
                            {match["user_socials"]["instagram"]}
                          </Typography>
                        </div>
                      )}
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
