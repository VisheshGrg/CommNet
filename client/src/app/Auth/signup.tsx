import { useState } from "react";
import { useRouter } from "next/router";

export default function Signup() {
  const [values, setValues] = useState<{ username: string; password: string }>({
    username: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, action: "signup" }),
    });
    if (res.ok) {
      router.push("/login");
    } else {
      const error = await res.json();
      alert(`Signup failed: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" onChange={handleChange} required />
      <input type="password" name="password" onChange={handleChange} required />
      <button type="submit">Signup</button>
    </form>
  );
}
