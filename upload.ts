import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const fileField = files.image || files["files[]"] || files.file;
    // formidable files can be an array
    const file = Array.isArray(fileField) ? fileField[0] : fileField;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Initiating upload flow for:', file.originalFilename);

    try {
      const fileData = fs.readFileSync(file.filepath);
      const uguuFormData = new FormData();
      const blob = new Blob([fileData], { type: file.mimetype || 'image/png' });
      uguuFormData.append('files[]', blob, file.originalFilename || 'upload.png');

      const uguuResponse = await fetch('https://uguu.se/upload.php', {
        method: 'POST',
        body: uguuFormData,
      });

      if (uguuResponse.ok) {
        const data = await uguuResponse.json();
        if (data.success && data.files && data.files[0]?.url) {
          console.log('uguu.se upload success:', data.files[0].url);
          return res.status(200).json({ url: data.files[0].url });
        }
      }
      
      const errorText = await uguuResponse.text();
      console.error('uguu.se detailed error:', errorText);
      throw new Error(`uguu.se failed with status ${uguuResponse.status}`);
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }
  } catch (error) {
    console.error('Final Upload Error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown network error'
    });
  }
}
