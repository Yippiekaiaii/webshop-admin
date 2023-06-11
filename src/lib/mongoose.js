
//function to set up a connection to DB for mongoose to use

import mongoose from "mongoose"

export function mongooseConnect() {  

    //Check if there is a mongoose connection already, if found return existing connection, if not create new

    if (mongoose.connection.readyState === 1){
        return mongoose.connection.asPromise()
    } else {
        const uri = process.env.MONGODB_URI
        return mongoose.connect(uri)
    }


}