import { NextResponse } from 'next/server';

export async function GET() {
  const data = [
    {
      relation: [
        "delegate_permission/common.handle_all_urls"
      ],
      target: {
        namespace: "android_app",
        package_name: "com.moonksoftware.shoppinglist",
        sha256_cert_fingerprints: [
          "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00"
        ]
      }
    }
  ];

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
