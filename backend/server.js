import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NETLIFY_TOKEN } = process.env;

// GitHub OAuth redirect
app.get("/auth/github", (req,res)=>{
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;
  res.redirect(url);
});

// OAuth callback
app.get("/auth/callback", async (req,res)=>{
  const code = req.query.code;
  const tokenRes = await axios.post(
    `https://github.com/login/oauth/access_token`,
    { client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code },
    { headers:{ Accept:"application/json" } }
  );
  const token = tokenRes.data.access_token;
  res.redirect(`http://localhost:3000?token=${token}`);
});

// Fetch GitHub repos
app.get("/repos", async (req,res)=>{
  const token = req.query.token;
  const repos = await axios.get("https://api.github.com/user/repos", {
    headers:{ Authorization:`token ${token}` }
  });
  res.json(repos.data);
});

// Deploy repo via Netlify
app.post("/deploy", async (req,res)=>{
  const { repoUrl } = req.body;
  try {
    const deploy = await axios.post(
      "https://api.netlify.com/api/v1/sites",
      { repo:{ provider:"github", repo_url: repoUrl, private:false, branch:"main" } },
      { headers:{ Authorization:`Bearer ${NETLIFY_TOKEN}` } }
    );
    res.json({ url: deploy.data.ssl_url || deploy.data.url });
  } catch(err){
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000,()=>console.log("Backend running on port 5000"));
