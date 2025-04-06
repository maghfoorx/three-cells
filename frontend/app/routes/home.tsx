import type { Route } from "./+types/home";
import axios from "axios";
import { Welcome } from "../welcome/welcome";
import { useEffect, useState } from "react";

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

// create a form to login with email and password
export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("runniing");
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie");

      const response = await axios.post(
        "http://localhost:8000/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
          withXSRFToken: true,
        }
      );

      console.log(response, "IS RESPONSE");
    } catch (error) {
      console.log("error occurred");
      console.error(error);
    }
  };

  const fetchUser = async () => {
    const userInfo = await axios.get("http://localhost:8000/test-auth");
    console.log(userInfo, "UserInfo");
    setUser(userInfo.data);
  };

  const fetchUserFromApiRoute = async () => {
    const userInfo = await axios.get("http://localhost:8000/api/user");
    console.log(userInfo, "UserInfoApiRoute");
    if (userInfo.data) {
      setUser(userInfo.data);
    }
  };

  return (
    <main className="flex flex-col gap-2 items-center">
      <div>{JSON.stringify(user, null, 2)}</div>
      <form
        className="flex flex-col gap-4 max-w-4xl items-center"
        onSubmit={onSubmit}
      >
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          className="border"
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          className="border"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-orange-300">
          Login
        </button>
      </form>
      <div className="flex flex-col gap-4">
        <button onClick={fetchUser} className="bg-green-100">
          Get user
        </button>
        <button onClick={fetchUserFromApiRoute} className="bg-teal-100">
          Get user from api.php
        </button>
      </div>
      <button onClick={() => setUser(null)} className="bg-red-100">
        Clear user
      </button>
      <div>
        <Welcome />
      </div>
    </main>
  );
}
