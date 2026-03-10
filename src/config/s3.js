import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = process.env.AWS_S3_BUCKET;

const IMAGE_SIZES = {
  main: 800,
  thumbnail: 400,
};

async function optimizeImage(buffer, width) {
  return sharp(buffer)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

async function putS3(key, body) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: 'image/webp',
  }));
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function uploadToS3(file) {
  const baseName = `${Date.now()}-${crypto.randomUUID()}`;

  const [mainBuf, thumbBuf] = await Promise.all([
    optimizeImage(file.buffer, IMAGE_SIZES.main),
    optimizeImage(file.buffer, IMAGE_SIZES.thumbnail),
  ]);

  const [mainUrl, thumbnailUrl] = await Promise.all([
    putS3(`products/${baseName}.webp`, mainBuf),
    putS3(`products/${baseName}_thumb.webp`, thumbBuf),
  ]);

  return { image: mainUrl, thumbnail: thumbnailUrl };
}

export async function deleteFromS3(imageUrl) {
  const url = new URL(imageUrl);
  const key = decodeURIComponent(url.pathname.slice(1));

  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  }));
}
