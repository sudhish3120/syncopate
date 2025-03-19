"use client";
import React from "react";
import Nav from "../components/Nav";
import UpdateModal from "../components/UpdateModal";

export default function Profile() {

  return (
    <div className="font-sans bg-black relative pt-20">
      <Nav />
      <div className="container mx-auto p-4">
        <h1 className="text-white text-2xl mb-4">Edit Profile</h1>
        <UpdateModal />
      </div>
    </div>
  );
}
