import util from 'util'
import { storage } from './gcpConfig'
const bucket = storage.bucket('ai-nova-bucket')

export const uploadImage = (file: any) => new Promise((resolve, reject) => {
    try {
        const { originalname, buffer } = file

        console.log("Orginal name_>", originalname, buffer)

        const blob = bucket.file(originalname.replace(/ /g, "_"))
        console.log("bolb", blob)
        const blobStream = blob.createWriteStream({
            resumable: false
        })
        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
            resolve(publicUrl)
        })
            .on('error', (error: any) => {
                console.log("Error is ", error)
                reject(`Unable to upload image, something went wrong`)
            })
            .end(buffer)
    } catch (error) {
        throw error;
    }
})