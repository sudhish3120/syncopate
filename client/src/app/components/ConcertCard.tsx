import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Modal,
  Box,
} from "@mui/material";
import { FaStar } from "react-icons/fa6";

interface ConcertCardProps {
  id: number;
  title: string;
  date: string;
  info: string;
  venue: string;
  imageUrl?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ConcertCard: React.FC<ConcertCardProps> = ({
  id,
  title,
  date,
  imageUrl,
  info,
  venue,
}) => {
  const [open, setOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
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

  const checkFavorite = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/concerts/favorites_by_id/",
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to see favorite concerts");
      }
      const { concerts } = await res.json();
      setIsFavorite(concerts.some((concert_id) => concert_id === id));
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async (id: number) => {
    setIsFavorite(!isFavorite);
    if (isFavorite === false) {
      try {
        const res = await fetch(
          "http://localhost:8000/api/concerts/favorite/",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ concert: id }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to favorite concert");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const res = await fetch(
          "http://localhost:8000/api/concerts/unfavorite/",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ concert: id }),
          }
        );
        if (!res.ok) {
          throw new Error("Failed to unfavorite concert");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <>
      <Card
        sx={{
          backgroundColor: "#1A1A1A",
          borderRadius: "1.5rem", // This matches Tailwind's rounded-3xl
          overflow: "hidden",
        }}
        className="w-80 h-60 cursor-pointer shadow-lg transition-all duration-300 ease-in-out hover:scale-105 drop-shadow-[0_0_15px_rgba(76,29,149,0.9)]"
        onClick={() => {
          setOpen(true);
          checkFavorite();
        }}
      >
        <CardMedia
          component="img"
          style={{ height: "60%" }}
          image={imageUrl || "/concert_default_photo.jpg"}
          alt={title}
          className="rounded-t-3xl"
        />
        <CardContent>
          <div
            ref={containerRef}
            className="overflow-hidden whitespace-nowrap rounded-3xl"
          >
            <Typography
              ref={titleRef}
              fontSize={16}
              variant="h6"
              className={`font-semibold text-white inline-block ${
                isOverflowing ? "hover:animate-marquee" : ""
              }`}
            >
              {title}
            </Typography>
          </div>
          <Typography variant="body2" className="text-violet-600">
            {formatDate(date)}
          </Typography>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Box className="bg-space_black rounded-3xl w-3/5 h-3/5 mx-auto mt-20 flex flex-row relative">
          <CardMedia
            component="img"
            style={{ width: "60%" }}
            image={imageUrl || "/concert_default_photo.jpg"}
            alt={title}
            className="rounded-l-3xl object-cover"
          />
          <div className="m-8 shadow-lg w-full overflow-y-scroll">
            <Typography
              variant="h4"
              fontWeight={800}
              className="font-semibold text-white m-2 break-words"
            >
              {title}
            </Typography>
            <Typography variant="h5" className="text-violet-600">
              {formatDate(date)}
            </Typography>
            <Typography marginTop={1}>{info}</Typography>
            <Typography
              fontSize={18}
              fontWeight={1000}
              marginTop={1}
              className="text-yellow-600"
            >
              {venue}
            </Typography>

            <FaStar
              size={24}
              onClick={() => toggleFavorite(id)}
              className={`absolute bottom-5 right-5 hover:cursor-pointer ${
                isFavorite ? "text-yellow-600" : "text-slate-400"
              }`}
            />
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default ConcertCard;
