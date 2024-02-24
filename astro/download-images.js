import { createClient } from "@sanity/client";
import imageUrlBuilder from '@sanity/image-url';
import fs from 'fs'
import path from "path";
import https from 'https';

const client = createClient({
  projectId: '7m8frgh6',
  dataset: 'production',
  apiVersion: '2023-02-08',
  useCdn: false
});

const IMAGES_DIR = './src/assets';
const imageBuilder = imageUrlBuilder(client);

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function downloadImage(url, filename) {
  console.log(url)
  const filepath = path.join(IMAGES_DIR, filename);

  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file async. (No need to wait for this to complete)
      reject(err);
    });
  });
}

async function fetchAndDownloadImages() {
  // Adjust the query according to your needs
  const query = `*[_type == "painting"]{mainImage, additionalImages}`;
  const posts = await client.fetch(query);
  for (let post of posts) {
    const mainImageUrl = imageBuilder.image(post.mainImage).url();
    await downloadImage(mainImageUrl, path.basename(mainImageUrl));
    if (!post.additionalImages) return;
    for (let image of post.additionalImages) {
      const imageUrl = imageBuilder.image(image).url()
      await downloadImage(imageUrl, path.basename(imageUrl));
    }
  }
}

fetchAndDownloadImages().catch(console.error);
