import { google } from 'googleapis';
import { Readable } from 'stream';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

export async function getDriveService() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  
  return google.drive({ version: 'v3', auth });
}

export async function getOrCreateApplicantFolder(folderName: string, parentFolderId: string) {
  const drive = await getDriveService();

  // Search if folder exists
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and '${parentFolderId}' in parents and trashed=false`;
  
  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  // Create new folder
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
    supportsAllDrives: true,
  });

  return folder.data.id!;
}

export async function uploadToGoogleDrive(fileBuffer: Buffer, fileName: string, mimeType: string, parentFolderId?: string) {
  const drive = await getDriveService();
  const folderId = parentFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID; // โฟลเดอร์ที่แชร์ให้ Service Account

  try {
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    };
    
    const media = {
      mimeType: mimeType,
      body: stream,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    return {
      id: file.data.id,
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink
    };
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw error;
  }
}

export async function uploadPublicFileToDrive(fileBuffer: Buffer, fileName: string, mimeType: string) {
  const drive = await getDriveService();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  try {
    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : undefined,
    };
    
    const media = {
      mimeType: mimeType,
      body: stream,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const fileId = file.data.id!;

    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
      supportsAllDrives: true,
    });

    return {
      id: fileId,
      webViewLink: file.data.webViewLink,
      webContentLink: file.data.webContentLink
    };
  } catch (error) {
    console.error("Error uploading public file to Google Drive:", error);
    throw error;
  }
}

export async function getFileStream(fileId: string) {
  const drive = await getDriveService();
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  return res.data;
}
