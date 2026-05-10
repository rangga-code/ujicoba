import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body;
    
    const cleanBody: any = {};
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanBody[key] = value;
      }
    });

    console.log('Sending to siputzx:', JSON.stringify(cleanBody));

    const response = await fetch('https://brat.siputzx.my.id/v2/iphone-quoted', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'image/png, application/json'
      },
      body: JSON.stringify(cleanBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API Error:', response.status, errorText);
      let errorMsg = 'External API Error';
      try {
        const parsed = JSON.parse(errorText);
        errorMsg = parsed.message || parsed.error || errorMsg;
      } catch (e) {
        errorMsg = errorText || errorMsg;
      }
      return res.status(response.status).json({ error: errorMsg });
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.json(data);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType || 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({ error: 'Internal server error while generating image' });
  }
}
