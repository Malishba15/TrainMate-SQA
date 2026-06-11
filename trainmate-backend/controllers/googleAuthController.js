// controllers/googleAuthController.js

import axios from "axios";
import jwt from "jsonwebtoken";

/**
 * Step 1: Redirect user to Google OAuth
 */
export const googleLogin = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  const redirectUri = encodeURIComponent(process.env.GOOGLE_REDIRECT_URI);

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;

  return res.redirect(googleAuthUrl);
};

/**
 * Step 2: OAuth callback handler
 */
export const googleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Authorization code missing" });
    }

    // Exchange code for token
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }
    );

    const { id_token } = tokenResponse.data;

    if (!id_token) {
      return res.status(400).json({ message: "Google ID token missing" });
    }

    // Decode user info
    const decoded = jwt.decode(id_token);

    const user = {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      provider: "google",
    };

    // Create app JWT (for your system)
    const appToken = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Google authentication successful",
      token: appToken,
      user,
    });
  } catch (error) {
    console.error("Google OAuth error:", error.message);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};