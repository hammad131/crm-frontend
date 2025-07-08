import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email, password } = req.body;

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: data.message || "Login failed" });
    }

    // Set token in HttpOnly cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: "lax",
        path: "/",
      })
    );

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
