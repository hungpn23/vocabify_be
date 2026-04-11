import sharp from "sharp";

export async function processImage(
	file: Express.Multer.File,
	size = 400,
): Promise<{ buffer: Buffer; newOriginalName: string }> {
	const buffer = await sharp(file.buffer)
		.resize(size, size, {
			fit: "contain",
			position: "center",
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		.webp({ quality: 80 })
		.toBuffer();

	const newOriginalName = file.originalname.replace(
		/\.(png|jpg|jpeg|webp)$/i,
		".webp",
	);

	return { buffer, newOriginalName };
}
