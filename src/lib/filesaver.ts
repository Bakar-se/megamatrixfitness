import fs from "fs";

export const fileSaver = (base64: string, path: string, filename?: string) => {
  let base64Data = base64.split(",")[1];
  const imageBuffer: any = Buffer.from(base64Data, "base64");
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  const fileExtension = base64.split(",")[0].split("/")[1].split(";")[0];
  const fn =
    filename || (Math.random() * 1000000000).toString() + "." + fileExtension;
  const newPath = `${path}/${fn}`;
  try {
    fs.writeFileSync(newPath, imageBuffer);
    return fn;
  } catch (err) {
    console.error(err);
    return null;
  }
};
