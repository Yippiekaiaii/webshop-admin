
import axios from "axios"
import {useEffect, useState } from "react"
import {useRouter} from "next/router"
import Spinner from "@/components/Spinner"
import {ReactSortable} from 'react-sortablejs'


export default function ProductForm({_id,title:existingTitle, description:existingDescription , price:existingPrice,images:existingImages, category:existingCategory, properties:assignedProperties}) {

    //Set initial state
    const [title,setTitle]=useState(existingTitle || '')
    const [description,setDescription]=useState(existingDescription || '')
    const [price,setPrice]=useState(existingPrice || '')
    const [goToProducts, setGoToProducts]= useState(false)
    const [images, setImages]=useState(existingImages || [])
    const [isUploading, setIsUploading]= useState(false)
    const [categories, setCategories]= useState([])
    const [category, setCategory]=useState(existingCategory || '')
    const [productProperties, setProductProperties]=useState(assignedProperties || {})

    const router = useRouter() 


    //Get product categories a place into state
    useEffect(()=>{
        axios.get('/api/categories').then(result => {
            setCategories(result.data)
        })
    }, [])

    //Add or update product to database
    async function saveProduct(ev) {
        ev.preventDefault()

        const data = {title,description,price,images,category,properties:productProperties}

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

    //Update image order using react-sortablejs and sortablejs packages
    function updateImagesOrder(images) {
        setImages(images)
    }

    //Load in category properties
    const propertiesToFill = []
    if (categories.length>0 && category) {
       let catInfo = categories.find(({_id})=> _id === category)
       propertiesToFill.push(...catInfo.properties)
       while(catInfo?.parent?._id){
        const parentCat = categories.find(({_id})=> _id === catInfo?.parent?._id)
        propertiesToFill.push(...parentCat.properties)
        catInfo = parentCat
       }
    }

    function setProductProp(propName,value){
        setProductProperties(prev => {
            const newProductProps = {...prev}
            newProductProps[propName]=value
            return newProductProps
        })
    }

    return (
      
            <form onSubmit={saveProduct}>              

                <label>Product Name</label>
                <input type="text" placeholder="product name" value={title} onChange={ev => setTitle(ev.target.value)}/>
                <label>Category</label>
                <select value={category} onChange={ev => setCategory(ev.target.value)}>
                    <option value="">Uncategorised</option>
                    {categories.length > 0 && categories.map(c => (
                        <option value={c._id}>{c.name}</option>
                    ))}
                </select>
                {propertiesToFill.length>0 && propertiesToFill.map(p => (
                    <div className="">
                        <label>{p.name[0].toUpperCase()+p.name.substring(1)}</label>
                        <div>
                            <select value={productProperties[p.name]} onChange={(ev)=>setProductProp(p.name,ev.target.value)}>
                                {p.values.map(v => (
                                    <option value={v}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}

                <label>Photos</label>
                <div className="mb-2 flex flex-wrap gap-1">
                    <ReactSortable list={images} setList={updateImagesOrder} className="flex flex-wrap gap-1">
                        {!!images?.length && images.map (link => 
                            <div key={link} className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
                                <img src={link} alt="upload image" className="rounded-lg"/>
                            </div>
                        )}
                    </ReactSortable>

                    {isUploading && (
                        <div className="h-24 p-1 flex">
                            <Spinner/>
                        </div>
                    )}

                    <label className="w-24 h-24 border flex flex-col cursor-pointer items-center justify-center text-sm text-gray-500 rounded-sm bg-white-200 shadow-md border border-gray-200">
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