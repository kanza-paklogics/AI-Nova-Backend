// import { Upload } from "@aws-sdk/lib-storage";
// import { S3Client } from "@aws-sdk/client-s3";
// import AWS = require("aws-sdk");
// import config from "config";

// const s3 = new AWS.S3({
//   accessKeyId: config.get<string>("accessKeyIdAWS"),
//   secretAccessKey: config.get<string>("secretAccessKeyAWS"),
// });

// export const uploadAudio = (
//   filename: string,
//   bucketname: string,
//   file: any
// ) => {
//   return new Promise((resolve, reject) => {
//     const params: any = {
//       Key: filename,
//       Bucket: bucketname,
//       Body: file,
//       ContentType: "audio/webm",
//     };

//     s3.upload(params, (error: any, data: any) => {
//       if (error) reject(error);
//       else resolve(data);
//     });
//   });
// };

// export const uploadProfile = (
//   filename: string,
//   bucketname: string,
//   file: any
// ) => {
//   return new Promise((resolve, reject) => {
//     const params: any = {
//       Key: filename,
//       Bucket: bucketname,
//       Body: file,
//       ContentType: "png/jpeg",
//     };

//     s3.upload(params, (error: any, data: any) => {
//       if (error) reject(error);
//       else resolve(data);
//     });
//   });
// };
