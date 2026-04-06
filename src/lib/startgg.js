export async function fetchEventEntrants(apiKey, eventSlug, page = 1, perPage = 50) {
  // Extract tournament and event slug from something like "tournament/genesis-9/event/melee-singles"
  const parts = eventSlug.split('/');
  let tournamentSlug = "";
  let eventNameSlug = "";
  
  if (parts.length >= 4 && parts[0] === 'tournament' && parts[2] === 'event') {
    tournamentSlug = parts[1];
    eventNameSlug = parts[3];
  } else {
    // Attempt raw ID or assume passed string is raw event slug
    // We'll use the ID-based search if it's just a number, or assume it's event path
  }

  const query = `
    query EventEntrants($slug: String!, $page: Int!, $perPage: Int!) {
      event(slug: $slug) {
        id
        name
        tournament {
          name
        }
        entrants(query: { page: $page, perPage: $perPage }) {
          pageInfo {
            total
            totalPages
          }
          nodes {
            id
            participants {
              id
              gamerTag
              player {
                name
              }
            }
          }
        }
      }
    }
  `;

  // Start.gg API requires the full path slug for event(slug: ...)
  // e.g. "tournament/genesis-9/event/melee-singles"
  // If the user pastes the URL, we can strip the domain.
  const cleanSlug = eventSlug.replace('https://www.start.gg/', '');

  const response = await fetch('https://api.start.gg/gql/alpha', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        slug: cleanSlug,
        page,
        perPage
      }
    })
  });

  const data = await response.json();
  if (data.errors) {
    throw new Error(data.errors.map(e => e.message).join(', '));
  }

  return data.data.event;
}
