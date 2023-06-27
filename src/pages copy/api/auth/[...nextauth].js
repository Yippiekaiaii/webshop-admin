import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import clientPromise from "@/lib/mongoDB";

const adminEmails = ['peter.wilson1758@gmail.com']

export default NextAuth({
  providers: [
    // OAuth authentication providers...
   
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),    
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks:{
    session: ({session,token,user}) => {
        if (adminEmails.includes(session?.user?.email)) {
          return session
        } else {
          return false
        } 
    
      }
    }
})