"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Nav from "../components/Nav";
import { Avatar, Box, Button, Card, CardActions, CardContent, CardMedia, Grid, Stack, Typography } from "../../../node_modules/@mui/material/index";

enum PeopleStatus {
    YES = "yes",
    NO = "no",
    UNKNOWN = "unknown"
}

interface People {
    image?: string,
    name: string,
    topArtists: string[],
    topSongs: string[],
    status: PeopleStatus
}


const mockPeople: People[] = [
    {
        name: "Doe Doe",
        topArtists: ["Clairo", "Alice Pheobe Lou", "Slow Pulp"],
        topSongs: ["North", "Glow", "Falling Apart"],
        status: PeopleStatus.UNKNOWN
    },
    {
        image: "https://c8.alamy.com/comp/2H3GH7T/older-man-giving-thumb-up-with-computer-game-2H3GH7T.jpg",
        name: "Jane Doe",
        topArtists: ["Japanese Breakfast", "Shelly", "Men I Trust"],
        topSongs: ["Kokomo, IN", "Natural", "Husk"],
        status: PeopleStatus.UNKNOWN
    },
]

export default function ExplorePeople() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [people, setPeople] = useState<People[]>([]);
    const [peopleIndex, setPeopleIndex] = useState<number>(0);
    const [noMatchings, setNoMatchings] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            redirect("/login");
            return;
        }
    }, []);

    useEffect(() => {
        try {
            const t = localStorage.getItem("token");
            // const res = await fetch(
            //     "http://localhost:8000/api/concerts/db_favorites",
            //     {
            //         method: "GET",
            //         headers: {
            //             Authorization: `Token ${t}`,
            //             "Content-Type": "application/json",
            //         },
            //     },
            // );
            // if (!res.ok) {
            //     throw new Error("Failed to fetch db concerts");
            // }
            // const concerts = await res.json();
            setPeople(mockPeople);
            if (mockPeople.length > 0) {
                setNoMatchings(false);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "An error occurred",
            );
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [])

    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const handleDecision = (decision: PeopleStatus) => {
        if (decision == PeopleStatus.YES) {
            // send request approving the person
            setPeopleIndex(peopleIndex + 1)
        } else if (decision == PeopleStatus.NO) {
            // send request not approving the person
            setPeopleIndex(peopleIndex + 1)
        } else {
            console.log("ERROR: unapproved action")
        }
        if (peopleIndex + 1 >= people.length) {
            setNoMatchings(true);
        }
    }

    return (
        <div className="font-sans bg-gray-50">
            <Nav />
            <main className="container mx-auto  py-8 px-8 h-screen">
                <section className="mb-8">
                    {
                        noMatchings ? (
                            <Typography gutterBottom variant="h5" component="div" sx={{ color: "black" }}>
                                You've reached your matching limit. Please come back later!
                            </Typography>
                        ) : (
                            <Card sx={{ display: 'flex' }}>
                                {
                                    people[peopleIndex]["image"] ? (
                                        <CardMedia 
                                            sx={{ height: 500, width: 500 }}
                                            image={people[peopleIndex]["image"]}
                                            alt="Profile Picture"
                                        />
                                    ) : (
                                        <CardMedia component="div"> 
                                            <Avatar variant="square" sx={{ height: 500, width: 500, fontSize: 200 }}>
                                                {people[peopleIndex]["name"][0]}
                                            </Avatar>
                                        </CardMedia>
                                    )
                                }
                                <Box>
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {people[peopleIndex]["name"]}
                                        </Typography>
                                        <Box>
                                            Top songs: {people[peopleIndex]["topSongs"].join(", ")}
                                        </Box>
                                        <Box>
                                            Top artists: {people[peopleIndex]["topArtists"].join(", ")}
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ display: 'flex' }}>
                                        <Button onClick={() => handleDecision(PeopleStatus.NO)}>NO</Button>
                                        <Button onClick={() => handleDecision(PeopleStatus.NO)}>YES</Button>
                                    </CardActions>
                                </Box>
                            </Card>
                        )
                    }
                </section>
            </main>
        </div>
    );
}
