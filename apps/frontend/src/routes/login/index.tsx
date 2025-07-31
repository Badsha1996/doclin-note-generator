import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/login/")({
  component: Login,
});

function Login() {
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    const postData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: "Knight@123",
              password: "Knight@123",
              email: "Knight@gmail.com",
            }),
          }
        );

        const data = await response.json();
        setResponseData(data);
      } catch (error) {
        console.error("Error posting data:", error);
      }
    };

    postData();
  }, []); // Only runs on mount
  return <div>Login</div>;
}
