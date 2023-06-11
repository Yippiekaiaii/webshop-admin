
import multiparty from 'multiparty'
import {PutObjectCommand,S3Client} from '@aws-sdk/client-s3'
import fs from 'fs'
import mime from 'mime-types' //package that identifies the MIME type of a file

const bucketName = 'pw-web-shop'

export default async function handle(req,res) {
    const form = new multiparty.Form()
    const {fields,files} = await new Promise((resolve,reject)=>{
            form.parse(req,(err,fields,files)=>{
                if (err) reject(err)
                resolve({fields,files})
            })
    })  
              
        //Set up AWS S3 client
        const client = new S3Client({
            region:'eu-west-2',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            }
        })

        const links = []

        //loop through provded files and send to AWS S3 bucket
        for(const file of files.file){

            //Get just file extension of file
            const ext=file.originalFilename.split('.').pop()
            const newFilename = Date.now() + '.' + ext           

            //Upload the file to the bucket
            await client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: newFilename,
                Body: fs.readFileSync(file.path),
                ACL: 'public-read',
                ContentType: mime.lookup(file.path),
            }))

            //store the created file links in an array
            const link = `https://${bucketName}.s3.amazonaws.com/${newFilename}`
            links.push(link)
        }              

        return res.json({links})   
}

export const config = {
    api:{bodyParser:false}
}