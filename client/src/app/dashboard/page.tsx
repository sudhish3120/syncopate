"use client";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import ConcertCard from "../components/ConcertCard";
import ConcertList from "../components/ConcertList";
import Nav from "../components/Nav";
import getConfig from "next/config";
import { FaMagnifyingGlass } from "react-icons/fa6";
interface UserData {
  user: {
    id: number;
    username: string;
  };
  status: string;
  user: {
    id: number;
    username: string;
  };
  status: string;
}

interface Artist {
  id: number;
  name: string;
  id: number;
  name: string;
}

interface Venue {
  id: number;
  name: string;
  address: string;
  id: number;
  name: string;
  address: string;
}
interface ConcertDate {
  start: {
    localDate: string;
  };
}

interface ConcertImage {
  ratio: string;
  url: string;
  width: number;
  height: number;
  fallback: boolean;
}

interface Concert {
  id: number;
  name: string;
  artist: Artist;
  venue: Venue;
  dates: ConcertDate;
  url: string;
  images: Array<ConcertImage>;
  ticket_url: string;
}

const LOCATIONS: {[key: string]: string} = {
    "KW": "Kitchener-Waterloo",
    "TO": "Toronto",
    "ALL": "Anywhere"
}

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [concerts, setConcerts] = useState<Array<Concert> | null>(null);
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [concerts, setConcerts] = useState<Array<Concert> | null>(null);

  const [location, setLocation] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [header, setHeader] = useState<string>("Explore Concerts");

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      redirect("/login");
      return;
    }
    useEffect(() => {
      const token = localStorage.getItem("token");
      console.log(token);
      if (!token) {
        redirect("/login");
        return;
      }

      const fetchUserData = async () => {
        try {
          const res = await fetch("http://localhost:8000/api/auth/user/", {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });
          const fetchUserData = async () => {
            try {
              const res = await fetch("http://localhost:8000/api/auth/user/", {
                method: "GET",
                headers: {
                  Authorization: `Token ${token}`,
                  "Content-Type": "application/json",
                },
              });

              if (!res.ok) {
                throw new Error("Failed to fetch user data");
              }
              if (!res.ok) {
                throw new Error("Failed to fetch user data");
              }

              const { user, status } = await res.json();
              setUserData({ user, status });
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "An error occurred"
              );
              console.error(err);
            } finally {
              setIsLoading(false);
            }
          };
          const { user, status } = await res.json();
          setUserData({ user, status });
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }, []);
    fetchUserData();
  }, []);

  useEffect(() => {
    const getConcerts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/concerts", {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch concerts");
        }
        const concerts = await res.json();
        console.log(concerts);
        setConcerts(concerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getConcerts();
  }, []);
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

    const getConcerts = async () => {
        try {
            const res = await fetch(
                "http://localhost:8000/api/concerts/",
                {
                    method: "GET",
                },
            );
            if (!res.ok) {
                throw new Error("Failed to fetch db concerts");
            }
            const concerts = await res.json();
            console.log(concerts)
            setConcerts(concerts);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "An error occurred",
            );
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getConcerts();
    }, []);

    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    const concertSearch = async (query: Record<string, string>) => {
        try {
            console.log("Searching with", query)
            const queryString = new URLSearchParams(query).toString()
            const res = await fetch(
                "http://localhost:8000/api/concerts/?" + queryString,
                {
                    method: "GET",
                },
            );
            if (!res.ok) {
                throw new Error("Failed to fetch concerts");
            }
            const concerts = await res.json();
            setConcerts(concerts);
            console.log("concerts:", concerts)
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "An error occurred",
            );
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const setDetailedHeader = (query: string, loc: string) => {
        let newHeader = "Search Results"
        if (query) {
            newHeader += " for \"" + query + "\""
        }
        if (loc != "ALL") {
            newHeader += " at " + LOCATIONS[loc]
        }
        setHeader(newHeader)
    }

    const handleLocationChange = (e: any) => {
        if (searchQuery != "") {
            concertSearch({"location": e.target.value, "query": searchQuery})
            setDetailedHeader(searchQuery, e.target.value)
        }
        setLocation(e.target.value)
    }

    const handleSearchQuery = (e: any) => {
        if (e.key == "Enter" && e.target.value.trim() !== "") {
            concertSearch({"location": location, "query": e.target.value})
            setDetailedHeader(e.target.value, location)
        }
        setSearchQuery(e.target.value)
    }

    const clearSearch = (e: any) => {
        setHeader("Explore Concerts")
        setLocation("ALL")
        setSearchQuery("")
        getConcerts()
    }

    return (
      <div className="font-sans bg-black relative pt-20">
        <Nav />
        <main className="container mx-auto  py-8 px-8 h-screen relative">
          <section className="mb-8 flex justify-between">
            <h2 className="text-3xl font-md text-white mb-4">Explore Concerts</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-row justify-between border bg-white border-gray-300 rounded-full px-4 py-1 pl-6 w-80 focus:outline-none focus:border-blue-500">
                <input
                  type="text"
                  placeholder="Search for Concerts"
                  className="w-full text-gray-600 border-gray-300 focus:outline-none focus:border-blue-500"
                />
                <FaMagnifyingGlass
                  size={32}
                  className="inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-300"
                />
              </div>
            </div>
          </section>
          <ConcertList title={"Upcoming Concerts"} concerts={concerts} />
          <ConcertList title={"Concerts in Toronto"} concerts={concerts} />
          <ConcertList title={"Concerts in Waterloo"} concerts={concerts} />
        </main>
      </div>
    );
}
