const HEADERS = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
};

export async function getGithubUser() {
  const res = await fetch(
    `https://api.github.com/users/${process.env.GITHUB_USERNAME}`,
    {
      headers: HEADERS,
      next: { revalidate: 3600 },
    }
  );

  const data = await res.json();
  return data;
}

export async function getContributions() {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
        }
        repositoriesContributedTo(first: 1) {
          totalCount
        }
        contributionCalendar: contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
        repositories(ownerAffiliations: OWNER, first: 1) {
          totalCount
        }
        followers { totalCount }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      query,
      variables: { username: process.env.GITHUB_USERNAME },
    }),
    next: { revalidate: 3600 },
  });

  const json = await res.json();
  return json.data.user;
}