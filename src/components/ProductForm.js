
import axios from "axios"
import {useState } from "react"
import {useRouter} from "next/router"
import Spinner from "@/components/Spinner"


export default function ProductForm({_id,title:existingTitle, description:existingDescription , price:existingPrice,images:existingImages}) {

    //Set initial state
    const [title,setTitle]=useState(existingTitle || '')
    const [description,setDescription]=useState(existingDescription || '')
    const [price,setPrice]=useState(existingPrice || '')
    const [goToProducts, setGoToProducts]= useState(false)
    const [images, setImages]=useState(existingImages || [])
    const [isUploading, setIsUploading]= useState(false)

    const router = useRouter() 

    //Add product to database
    async function saveProduct(ev) {
        ev.preventDefault()

        const data = {title,description,price,images}

        //check if we have an id passed
        if (_id){
            //Update existing record            
            await axios.put('/api/products',{...data, _id})           
        }else{
            //Create new record          
            await axios.post('/api/products', data)            
        }     
        
        //redirect to products list
        setGoToProducts(true)
    }

    //upload Image
    async function uploadImages(ev){
       const files = ev.target?.files

       if (files?.length > 0){
            setIsUploading(true)
            const data = new FormData()
            for (const file of files){
                data.append('file', file)
            }  

            const res = await axios.post('/api/upload',data)
            //create array of any old and new images
            setImages(oldImages => {
                return[...oldImages, ...res.data.links]
            })
            setIsUploading(false)
       }
    }

    if (goToProducts){
        router.push('/products')
    }

    return (
      
            <form onSubmit={saveProduct}>              

                <label>Prduct Name</label>
                <input type="text" placeholder="product name" value={title} onChange={ev => setTitle(ev.target.value)}/>

                <label>Photos</label>
                <div className="mb-2 flex flex-wrap gap-1">
                    {!!images?.length && images.map (link => 
                        <div key={link} className="h-24">
                            <img src={link} alt="upload image" className="rounded-lg"/>
                        </div>
                    )}

                    {isUploading && (
                        <div className="h-24 p-1 bg-gray-200 flex">
                            <Spinner/>
                        </div>
                    )}

                    <label className="w-24 h-24 border flex flex-col cursor-pointer items-center justify-center text-sm text-gray-500 rounded-lg bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg> 
                        <div>Upload</div>    
                        <input type="file" onChange={uploadImages} className="hidden"/>                  
                    </label>
                   
                    {!images?.length && (
                        <div>No Photos available</div>
                    )}

                </div>

                <label>Description</label>
                <textarea placeholder="description" value={description} onChange={ev => setDescription(ev.target.value)}></textarea>

                <label>Price (£)</label>
                <input type="number" placeholder="price" value={price} onChange={ev => setPrice(ev.target.value)}/>

                <button type="submit" className="btn-primary">Save</button>
            </form>
      
    )
}