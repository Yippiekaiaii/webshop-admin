
import Navbar from "./Navbar"
import { useSession, signIn, signOut } from "next-auth/react"


export default function Layout({children}) {
  const { data: session } = useSession()

  //If not logged in
  if (!session){
    return (
      <div className={'bg-bgGray w-screen h-screen flex items-center'}>
        <div className='text-center w-full'>
            <button onClick={()=>signIn('google')} className='bg-white p-2 px-4 rounded-md'>Login with Google</button>
        </div>
      </div>
    )
  }

  //If logged in
  return (
    <div className="bg-bgGray min-h-screen flex">
        <Navbar />
        <div className="bg-white flex-grow mt-1 mr-2 mb-2 p-4">{children}</div>
    </div>
    
  );

}