const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#121b1a"/>
  <text x="32" y="40" fill="#e5bd6b" font-family="Arial, sans-serif" font-size="24" font-weight="700" text-anchor="middle">MS</text>
</svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "image/svg+xml"
    }
  });
}
