"use client";
import React, { useEffect, useState } from "react";
import ConcertList from "../components/ConcertList";
import Nav from "../components/Nav";
import { FaMagnifyingGlass } from "react-icons/fa6";
import {
  FormControl,
  MenuItem,
  Select,
} from "../../../node_modules/@mui/material/index";
import ConcertCard from "../components/ConcertCard";
import { Concert } from "../types/concerts";
import SessionExpired from "../components/SessionExpired";

const LOCATIONS: { [key: string]: string } = {
  "KW": "Kitchener-Waterloo",
  "TO": "Toronto",
  "ALL": "Anywhere",
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [concerts, setConcerts] = useState<Array<Concert> | null>(null);

  const [inArea, setInArea] = useState<Array<Concert>>([]);
  const [onsaleSoon, setOnsaleSoon] = useState<Array<Concert>>([]);
  const [venueBased, setVenueBased] = useState<Array<Concert>>([]);

  const [location, setLocation] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/user/", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          setError("session-expired");
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        await res.json(); // Remove destructuring since variables aren't used
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getConcerts = async (
    setter: (value: Array<Concert>) => void,
    query: string
  ) => {
    try {
      const res = await fetch("http://localhost:8000/api/concerts/?" + query, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

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
        throw new Error(data.error || "Failed to fetch concerts");
      }

      const data = await res.json();
      setter(data["concerts"]);
    } catch (err) {
      console.error("Concert fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch concerts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getConcerts(setInArea, "location=TO");
    getConcerts(setOnsaleSoon, "onsaleSoon=true");
    getConcerts(setVenueBased, "venue=HISTORY&location=TO");
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error === "session-expired") {
    return <SessionExpired />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  const concertSearch = async (query: Record<string, string>) => {
    try {
      const queryString = new URLSearchParams(query).toString();
      const res = await fetch(
        "http://localhost:8000/api/concerts/?" + queryString,
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch concerts");
      }

      const data = await res.json();
      setConcerts(data["concerts"]);
    } catch (err) {
      console.error("Concert fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch concerts");
    } finally {
      setIsLoading(false);
    }
  };

  const header = () => {
    let newHeader = "No concerts found";
    if (concerts && concerts.length > 0) {
      newHeader = "Search Results";
    }
    if (searchQuery) {
      newHeader += ' for "' + searchQuery + '"';
    }
    if (location != "ALL") {
      newHeader += " at " + LOCATIONS[location];
    }
    return newHeader;
  };

  const handleLocationChange = (e: { target: { value: string } }) => {
    const newLocation = e.target.value;
    if (searchQuery !== "") {
      concertSearch({ "location": newLocation, "query": searchQuery });
      setSearching(true);
    } else {
      setSearching(false);
    }
    setLocation(newLocation);
  };

  const handleSearchQuery = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = (e.target as HTMLInputElement).value.trim();
      if (value !== "") {
        concertSearch({ "location": location, "query": value });
        setSearching(true);
      } else {
        setSearching(false);
        clearSearch();
      }
      setSearchQuery(value);
    }
  };

  const clearSearch = () => {
    setLocation("ALL");
    setSearchQuery("");
    setSearching(false);
  };

  return (
    <div className="font-sans bg-black relative pt-20">
      <Nav />
      <main className="container mx-auto  py-8 px-8 h-screen relative">
        <section className="mb-8 flex justify-between">
          <h2 className="text-3xl font-md text-white mb-4">Explore Concerts</h2>
          <div className="flex items-center justify-between mb-4 space-x-4">
            <FormControl className="bg-white border-gray-300 rounded-full outline-none p-0">
              <Select
                id="location-select"
                value={location}
                label="Location"
                onChange={handleLocationChange}
                className="w-64 p-0 focus-within:outline-none"
              >
                {Object.entries(LOCATIONS).map((location) => (
                  <MenuItem value={location[0]} key={location[0]}>
                    {location[1]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className="flex flex-row justify-between border bg-white border-gray-300 rounded-full px-3 py-3 pl-6 w-80 focus:outline-none focus:border-blue-500">
              <input
                type="text"
                placeholder="Search for Concerts"
                className="w-full text-gray-600 border-gray-300 focus:outline-none focus:border-blue-500"
                onKeyDown={handleSearchQuery}
              />
              <FaMagnifyingGlass
                size={32}
                className="inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-300"
              />
            </div>
          </div>
        </section>
        {searching ? (
          <>
            <h2 className="text-lg font-medium text-white mb-4 uppercase">
              {header()}
            </h2>
            <div className="flex flex-wrap gap-10">
              {concerts?.map((concert) => (
                <div key={concert.id}>
                  <ConcertCard
                    id={concert.id}
                    title={concert.name}
                    date={new Date(
                      concert.dates.start.localDate
                    ).toLocaleDateString()}
                    imageUrl={
                      concert.images.reduce((largest, image) => {
                        return image.width * image.height >
                          largest.width * largest.height
                          ? image
                          : largest;
                      }, concert.images[0]).url
                    }
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <ConcertList title={"Going On Sale Soon"} concerts={onsaleSoon} />
            <ConcertList title={"Concerts in Toronto"} concerts={inArea} />
            <ConcertList title={"Concerts at History"} concerts={venueBased} />
          </>
        )}
      </main>
    </div>
  );
}
