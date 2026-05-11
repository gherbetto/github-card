import { getGithubUser, getContributions } from "@/lib/github";

// export async function GET() {
//     return Response.json({
//         hasToken: !!process.env.GITHUB_TOKEN,
//         username: process.env.GITHUB_USERNAME,
//     })
// }

// export async function GET() {
//   const res = await fetch("https://api.github.com/users/gherbetto", {
//     headers: {
//       Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
//     },
//   });

//   const data = await res.json();

//   return Response.json({
//     login: data.login,
//     followers: data.followers,
//     public_repos: data.public_repos,
//     status: res.status,
//   });
// }

export async function GET() {
  const [user, contributions] = await Promise.all([
    getGithubUser(),
    getContributions(),
  ]);

  return Response.json({ user, contributions });
}