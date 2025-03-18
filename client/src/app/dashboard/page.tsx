"use client";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import ConcertCard from "../components/ConcertCard";
import Nav from "../components/Nav";

interface UserData {
    user: {
        id: number;
        username: string;
    };
    status: string;
}

interface Artist {
    id: number;
    name: string;
}

interface Venue {
    id: number;
    name: string;
    address: string;
}

interface Concert {
    id: number;
    name: string;
    artist: Artist;
    venue: Venue;
    date: string;
    ticket_url: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [concerts, setConcerts] = useState<Array<Concert> | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/auth/user/",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        credentials: 'include',
                    },
                );

                if (!res.ok) {
                    if (res.status === 401) {
                        router.push('');
                        return;
                    }
                    throw new Error("Failed to fetch user data");
                }

                const { user, status } = await res.json();
                setUserData({ user, status });
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred",
                );
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    useEffect(() => {
        const getConcerts = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/api/concerts/db_concerts",
                    {
                        method: "GET",
                    },
                );
                if (!res.ok) {
                    throw new Error("Failed to fetch db concerts");
                }
                const concerts = await res.json();
                console.log(concerts.results);
                setConcerts(concerts.results);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred",
                );
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        getConcerts();
    }, []);

    // Add helper function for consistent date formatting
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Replace the simple loading div with the same spinner as home page
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="font-sans bg-gray-50">
            <Nav />
            <main className="container mx-auto  py-8 px-8 h-screen">
                <section className="mb-8">
                    <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                        Explore Concerts
                    </h2>
                    <div className="flex items-center justify-between mb-4">
                        <div></div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for Concerts"
                                className="border border-gray-300 rounded-full px-4 py-2 pl-6 w-80 focus:outline-none focus:border-blue-500"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="w-6 h-6 text-gray-400"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {concerts
                            ?.slice(0, 4)
                            .map((concert) => (
                                <ConcertCard
                                    key={concert.id}
                                    id={concert.id}
                                    title={concert.name}
                                    date={formatDate(concert.date)}
                                />
                            ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
