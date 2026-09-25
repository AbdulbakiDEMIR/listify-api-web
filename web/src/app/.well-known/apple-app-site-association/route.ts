import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    applinks: {
      apps: [],
      details: [
        {
          appID: "TEAMID.com.moonksoftware.shoppinglist",
          paths: [
            "/l/clone/*",
            "/l/sync/*",
            "/l/*"
          ]
        }
      ]
    },
    webcredentials: {
      apps: [
        "TEAMID.com.moonksoftware.shoppinglist"
      ]
    }
  };

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
