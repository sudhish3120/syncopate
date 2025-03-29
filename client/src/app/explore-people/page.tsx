"use client";
import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Nav from "../components/Nav";
import {
  Avatar,
  Box,
  Button,
  CardActions,
  CardContent,
  CardMedia,
  LinearProgress,
  Typography,
} from "../../../node_modules/@mui/material/index";
import { useRef } from "react";

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
  const [people, setPeople] = useState<MatchingStatus[]>([]);
  const [peopleIndex, setPeopleIndex] = useState<number>(0);
  const [noMatchings, setNoMatchings] = useState<boolean>(true);
  const [commonConcerts, setCommonConcerts] = useState<Array<String>>();

  const fetchCalled = useRef(false);
  const getConcertById = async (id: String) => {
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
      const concertName = data.concerts[0]?.name;
      if (concertName) {
        setCommonConcerts((prev) => [...prev, concertName]);
      }
    } catch (err) {
      console.error("Concert fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch concerts");
    }
  };
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
      console.log(data);
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
    fetchMatchings();
  }, []);

  useEffect(() => {
    if (people.length > 0) {
      console.log(peopleIndex);
      setCommonConcerts([]);
      people[peopleIndex]["concerts"].forEach((c) => {
        getConcertById(c);
      });
    }
  }, [peopleIndex, people]);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
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
        console.log("ERROR: unapproved action");
      } else {
        console.log("ID: " + matchingId);
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
    <div className="font-sans bg-gray-50">
      <Nav />
      <main className="container mx-auto  py-8 px-8 h-screen">
        <section className="mb-8">
          <LinearProgress
            variant="determinate"
            value={people ? (peopleIndex / people.length) * 100 : 0}
            sx={{ m: 3, height: 10 }}
          />
          {noMatchings ? (
            <Typography
              gutterBottom
              variant="h5"
              component="div"
              sx={{ color: "black" }}
            >
              You&apos;ve reached your matching limit. Please come back later!
            </Typography>
          ) : (
            <Box className="bg-space_black rounded-md w-full h-full mx-auto mt-20 flex flex-row relative">
              {people[peopleIndex]["profile_photo"] ? (
                <CardMedia
                  component="img"
                  style={{ width: "60%" }}
                  sx={{ height: 500, width: 500 }}
                  image={people[peopleIndex]["profile_photo"]}
                  alt="Profile Picture"
                />
              ) : (
                <CardMedia component="div">
                  <Avatar
                    variant="square"
                    sx={{ height: 500, width: 500, fontSize: 200 }}
                  >
                    {people[peopleIndex]["username"][0]}
                  </Avatar>
                </CardMedia>
              )}
              <Box>
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    className="font-semibold text-white"
                  >
                    {people[peopleIndex]["username"]}
                  </Typography>
                  <Box>
                    {/* Top songs: {people[peopleIndex]["topSongs"].join(", ")} */}
                  </Box>
                  <Box>
                    {/* Top artists: {people[peopleIndex]["topArtists"].join(", ")} */}
                  </Box>
                </CardContent>
                <CardActions sx={{ display: "flex" }}>
                  <Button
                    onClick={() =>
                      reviewMatching(
                        MatchingStatus.NO,
                        people[peopleIndex]["id"]
                      )
                    }
                  >
                    NO
                  </Button>
                  <Button
                    onClick={() =>
                      reviewMatching(
                        MatchingStatus.YES,
                        people[peopleIndex]["id"]
                      )
                    }
                  >
                    YES
                  </Button>
                </CardActions>
                <Typography
                  gutterBottom
                  variant="h5"
                  component="div"
                  className="font-semibold text-white pb-10"
                >
                  You both want to go to:
                </Typography>
                {commonConcerts ? (
                  <ul>
                    {commonConcerts.map((concert, index) => (
                      <li key={index} className="text-white">
                        {concert}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography>H</Typography>
                )}
              </Box>
            </Box>
            // <Card sx={{ display: 'flex' }}>
            //     {
            //         people[peopleIndex]["image"] ? (
            //             <CardMedia
            //                 sx={{ height: 500, width: 500 }}
            //                 image={people[peopleIndex]["image"]}
            //                 alt="Profile Picture"
            //             />
            //         ) : (
            //             <CardMedia component="div">
            //                 <Avatar variant="square" sx={{ height: 500, width: 500, fontSize: 200 }}>
            //                     {people[peopleIndex]["username"][0]}
            //                 </Avatar>
            //             </CardMedia>
            //         )
            //     }
            //     <Box>
            //         <CardContent>
            //             <Typography gutterBottom variant="h5" component="div">
            //                 {people[peopleIndex]["username"]}
            //             </Typography>
            //             <Box>
            //                 {/* Top songs: {people[peopleIndex]["topSongs"].join(", ")} */}
            //             </Box>
            //             <Box>
            //                 {/* Top artists: {people[peopleIndex]["topArtists"].join(", ")} */}
            //             </Box>
            //         </CardContent>
            //         <CardActions sx={{ display: 'flex' }}>
            //             <Button onClick={() => reviewMatching(MatchingStatus.NO, people[peopleIndex]["id"])}>NO</Button>
            //             <Button onClick={() => reviewMatching(MatchingStatus.YES, people[peopleIndex]["id"])}>YES</Button>
            //         </CardActions>
            //     </Box>
            // </Card>
          )}
        </section>
      </main>
    </div>
  );
}
