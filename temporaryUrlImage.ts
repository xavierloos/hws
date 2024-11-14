import { storage } from './lib/gcp';

// export const getTemporaryUrlImage = async (type: string, userId: string, fileName: string) => {
// 	try {
// 		const options = {
// 			version: 'v2', // defaults to 'v2' if missing.
// 			action: 'read',
// 			expires: Date.now() + 10000 * 60 * 60,
// 		};
// 		// const [img] = await storage
// 		//   .bucket(`${process.env.GCP_BUCKET}`)
// 		//   .file(type === "profiles" ? `${type}/${id}/${image}` : `${type}/${image}`)
// 		//   .getSignedUrl(options);
// 		const [img] = await storage
// 			.bucket(`${process.env.GCP_BUCKET}`)
// 			.file(`${type}/${userId}/${fileName} `)
// 			.getSignedUrl(options);
// 		return img;
// 	} catch (error) {
// 		return null;
// 	}
// };

export const getTemporaryUrlImage = async (userId: string, fileName: string) => {
	try {
		const options = {
			version: 'v2', // defaults to 'v2' if missing.
			action: 'read',
			expires: Date.now() + 10000 * 60 * 60,
		};
		// const [img] = await storage
		//   .bucket(`${process.env.GCP_BUCKET}`)
		//   .file(type === "profiles" ? `${type}/${id}/${image}` : `${type}/${image}`)
		//   .getSignedUrl(options);
		const [img] = await storage
			.bucket(`${process.env.GCP_BUCKET}`)
			.file(`${userId}/${fileName}`)
			.getSignedUrl(options);
		return img;
	} catch (error) {
		return null;
	}
};
