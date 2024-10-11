export function removeBaseUrl(url: string): string {
  const regex = /^(https?:\/\/|localhost\/|www\.)?([^\/]+)(.*)$/;
  const match = url.match(regex);

  if (match) {
    // Return everything after the base URL
    return match[3]; // The third capturing group contains the path and query string
  }

  return url; // Return the original URL if it doesn't match
}
