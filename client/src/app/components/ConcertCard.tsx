import React, { useState } from "react";
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Modal,
    Box,
    Button,
} from "@mui/material";
import { useEffect } from "react";
interface ConcertCardProps {
    id: number;
    title: string;
    date: string;
    imageUrl?: string;
}
import { redirect } from "next/navigation";

const ConcertCard: React.FC<ConcertCardProps> = ({
    id,
    title,
    date,
    imageUrl,
}) => {
    const [open, setOpen] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const toggleFavorite = (id: number) => {
        setIsFavorite(!isFavorite);
        favorite(id);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            redirect("/login");
            return;
        }
        setToken(token);
    }, []);

    const favorite = async (id: number) => {
        try {
            const res = await fetch(
                "http://localhost:8000/api/concerts/favorite/",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        concert: id, // The concert ID you want to add to favorites
                    }),
                },
            );

            if (!res.ok) {
                throw new Error("Failed to favorite concert");
            }

            const data = await res.json();
            console.log(data.message); // Log the response message (you can adjust based on the API response)
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Card
                className="w-64 cursor-pointer shadow-lg transition-transform hover:scale-105"
                onClick={handleOpen}
            >
                <CardMedia
                    component="img"
                    height="140"
                    image={imageUrl || "https://via.placeholder.com/300"}
                    alt={title}
                />
                <CardContent>
                    <Typography
                        variant="h6"
                        className="font-semibold text-black"
                    >
                        {title}
                    </Typography>
                    <Typography variant="body2" className="text-black">
                        {date}
                    </Typography>
                </CardContent>
            </Card>

            <Modal open={open} onClose={handleClose}>
                <Box className="bg-white p-6 rounded-md shadow-lg w-96 mx-auto mt-20">
                    <Typography
                        variant="h5"
                        className="font-semibold text-black"
                    >
                        {title}
                    </Typography>
                    <Typography variant="body1" className="mt-2 text-black">
                        {date}
                    </Typography>

                    {/* Add to Favorites Button */}
                    <Button
                        variant="contained"
                        color={isFavorite ? "secondary" : "primary"}
                        className="mt-4"
                        onClick={() => toggleFavorite(id)}
                    >
                        {isFavorite
                            ? "Remove from Favorites"
                            : "Add to Favorites"}
                    </Button>
                </Box>
            </Modal>
        </>
    );
};

export default ConcertCard;
