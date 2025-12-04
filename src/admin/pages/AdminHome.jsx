import React from "react";
import ManagerDashboard from "./ManagerDashboard";
import { useAuth } from "../../context/AuthContext";

export default function AdminHome() {
  const { userRole } = useAuth();

  return (
    <>
      {userRole === "manager" ? <ManagerDashboard /> : ""}
    </>
  );
}
