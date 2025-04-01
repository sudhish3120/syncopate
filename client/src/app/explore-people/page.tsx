"use client";
import React, { useRef, useEffect, useState } from "react";
import Nav from "../components/Nav";
import {
  Avatar,
  Box,
  CardMedia,
  LinearProgress,
  Typography,
} from "../../../node_modules/@mui/material/index";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import SessionExpired from "../components/SessionExpired";

enum MatchingStatus {
  YES = "YES",
  NO = "NO",
  UNKNOWN = "UNKNOWN",
}

interface Matching {
  id: string;
  username: string;
  profile_photo: string;
  concerts: Array<string>;
}

export default function ExplorePeople() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<Matching[]>([]);
  const [peopleIndex, setPeopleIndex] = useState<number>(0);
  const [noMatchings, setNoMatchings] = useState<boolean>(true);
  const [commonConcerts, setCommonConcerts] = useState<string[]>([]);

  const fetchCalled = useRef(false);
  const getConcertById = async (id: string) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/concerts/concert_by_id/?id=${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 401) {
        setError("session-expired");
        return;
      }

      if (res.status === 503) {
        setError("Service temporarily unavailable");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch concert");
      }
      const data = await res.json();
      const newConcert = data.concerts[0]?.name;
      // console.log(newConcert);
      if (newConcert) {
        setCommonConcerts((prevConcerts) => [...prevConcerts, newConcert]);
      }
      // console.log("concerts after being set: ", [
      //   ...commonConcerts,
      //   newConcert,
      // ]);
    } catch (err) {
      // console.error("Concert fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch concerts");
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
  }, []);

  const fetchMatchings = async () => {
    if (fetchCalled.current) return;
    fetchCalled.current = true;
    try {
      const res = await fetch("http://localhost:8000/api/concerts/matchings", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch db matchings");
      }
      const data = await res.json();
      // console.log(data);
      setPeople(data["matchings"] as Matching[]);
      if (data["matchings"] && data["matchings"].length > 0) {
        setNoMatchings(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // console.log("Component mounted");
    fetchMatchings();
  }, []);

  useEffect(() => {
    // console.log("people: ", people);
    // console.log("peopleIndex:", peopleIndex);
    if (people.length === 0 || peopleIndex >= people.length) {
      setNoMatchings(true);
    } else {
      setNoMatchings(false);
      setCommonConcerts([]);
      people[peopleIndex].concerts.forEach((c: string) => {
        getConcertById(c);
      });
    }

    // console.log("noMatchings:", noMatchings);
  }, [peopleIndex, people]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error === "session-expired") {
    return <SessionExpired />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const reviewMatching = async (
    decision: MatchingStatus,
    matchingId: string
  ) => {
    try {
      if (decision != MatchingStatus.YES && decision != MatchingStatus.NO) {
        // console.log("ERROR: unapproved action");
      } else {
        // console.log("ID: " + matchingId);
        const res = await fetch(
          "http://localhost:8000/api/concerts/review-matching/",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              matchingId: matchingId,
              decision: decision,
            }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch db matchings");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setPeopleIndex(peopleIndex + 1);
      if (peopleIndex + 1 >= people.length) {
        setNoMatchings(true);
      }
    }
  };
  return (
    <div>
      <Nav />
      <main className="container mx-auto  py-8 px-8 h-screen">
        <section className="mb-8">
          <LinearProgress
            variant="determinate"
            value={people ? (peopleIndex / people.length) * 100 : 0}
            sx={{ m: 3, height: 10 }}
            className="top-10 rounded-md"
          />
          {noMatchings ? (
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              className="pt-10 text-center"
            >
              You&apos;ve reached your matching limit. Please come back later!
            </Typography>
          ) : (
            <Box className="bg-space_black border-2 border-violet-700 rounded-3xl w-3/5 h-full mx-auto mt-20 flex flex-row relative ">
              {people[peopleIndex]["profile_photo"] ? (
                <CardMedia
                  component="img"
                  sx={{ height: 300, width: 300 }}
                  image={people[peopleIndex]["profile_photo"]}
                  alt="Profile Picture"
                  className="rounded-l-3xl"
                />
              ) : (
                <CardMedia component="div" className="rounded-l-3xl">
                  <Avatar
                    variant="square"
                    sx={{ height: 300, width: 300, fontSize: 100 }}
                  >
                    {people[peopleIndex]["username"]}
                  </Avatar>
                </CardMedia>
              )}
              <div className="p-6 shadow-lg w-full">
                <Typography
                  gutterBottom
                  variant="h5"
                  component="div"
                  className="font-semibold text-white"
                >
                  {people[peopleIndex]["username"]}
                </Typography>
                <div className="flex flex-col w-full">
                  <Typography
                    fontWeight={700}
                    className="text-yellow-300"
                    marginBottom={2}
                  >
                    {
                      (people[peopleIndex]["target_academic_term"] || people[peopleIndex]["target_faculty"]) ? (
                        <>{people[peopleIndex]["target_academic_term"]} {people[peopleIndex]["target_faculty"]}</>
                      ) : (<>unknown academic term and faculty</>)
                    }
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
                    {commonConcerts.length > 0 ? (
                      <>
                        <Typography>Common Concerts:</Typography>
                        {
                          commonConcerts.map((concert, index) => (
                            <Typography
                              key={index}
                              className="text-white"
                              fontWeight={600}
                              sx={{ marginBottom: 1 }}
                            >
                              {concert}
                            </Typography>
                          ))
                        }
                      </>
                    ) : (
                      <Typography fontWeight={600} className="text-gray-400">
                        No common concerts found.
                      </Typography>
                    )}
                  </Box>
                </div>
                <div className="flex justify-between mt-2">
                  <IoCloseCircleOutline
                    size={36}
                    onClick={() =>
                      reviewMatching(MatchingStatus.NO, people[peopleIndex]["id"])
                    }
                    className="text-red-600 hover:cursor-pointer"
                  />
                  <IoCheckmarkCircleOutline
                    size={36}
                    onClick={() =>
                      reviewMatching(
                        MatchingStatus.YES,
                        people[peopleIndex]["id"]
                      )
                    }
                    className="text-green-400 hover:cursor-pointer"
                  />
                </div>
              </div>
            </Box>
          )}
        </section>
      </main>
    </div>
  );
}
