const { Storage } = require("@google-cloud/storage");
import path from 'path'
const serviceKey = path.join(__dirname, '../../keys.json')



export const storage = new Storage({
    keyFilename: serviceKey,
    projectId: 'meta-buckeye-390005',
})

