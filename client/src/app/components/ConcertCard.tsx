import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Modal,
  Box,
  Button,
} from "@mui/material";
import { redirect } from "next/navigation";
import { FaStar } from "react-icons/fa6";
import Link from "next/link";

interface ConcertCardProps {
  id: number;
  title: string;
  date: string;
  url: string;
  imageUrl?: string;
}

const ConcertCard: React.FC<ConcertCardProps> = ({
  id,
  title,
  date,
  url,
  imageUrl,
}) => {
  const [open, setOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const titleRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current && containerRef.current) {
        const titleWidth = titleRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        setIsOverflowing(titleWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [title]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      redirect("/login");
      return;
    }
    setToken(token);
  }, []);

  const toggleFavorite = async (id: number) => {
    setIsFavorite(!isFavorite);
    try {
      const res = await fetch("http://localhost:8000/api/concerts/favorite/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ concert: id }),
      });

      if (!res.ok) {
        throw new Error("Failed to favorite concert");
      }

      const data = await res.json();
      console.log(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Card
        className="w-80 h-60 cursor-pointer shadow-lg transition-transform hover:scale-105"
        onClick={() => setOpen(true)}
      >
        <CardMedia
          component="img"
          style={{ height: "60%" }}
          image={imageUrl || "/concert_default_photo.jpg"}
          alt={title}
        />
        <CardContent>
          <div ref={containerRef} className="overflow-hidden whitespace-nowrap">
            <Typography
              ref={titleRef}
              variant="h6"
              className={`font-semibold text-black inline-block ${
                isOverflowing ? "hover:animate-marquee" : ""
              }`}
            >
              {title}
            </Typography>
          </div>
          <Typography variant="body2" className="text-black">
            {date}
          </Typography>
        </CardContent>
      </Card>

    <Modal open={open} onClose={() => setOpen(false)}>
      <Box className="bg-white rounded-md w-3/5 h-3/5 mx-auto mt-20 flex flex-row relative">
        <CardMedia
        component="img"
        style={{ width: "60%" }}
        image={imageUrl || "/concert_default_photo.jpg"}
        alt={title}
        />
        <div className="p-6 shadow-lg w-full relative">
        <Typography variant="h5" className="font-semibold text-black">
          {title}
        </Typography>
        <Typography variant="body1" className="mt-2 text-black">
          {date}
        </Typography>

        <FaStar
          size={24}
          onClick={() => toggleFavorite(id)}
          className={`absolute bottom-5 right-5 hover:cursor-pointer ${isFavorite ? "text-yellow-600" : "text-slate-400"}`}
        />
        </div>
      </Box>
    </Modal>
    </>
  );
};

export default ConcertCard;
