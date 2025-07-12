import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
	region: process.env.S3_REGION,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY!,
		secretAccessKey: process.env.S3_SECRET_KEY!,
	},
});

const s3BucketName = process.env.S3_BUCKET_NAME!;

export { s3Client, s3BucketName };
