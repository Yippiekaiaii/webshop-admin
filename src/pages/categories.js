
import {useEffect, useState} from 'react'
import Layout from "@/components/Layout"
import axios from 'axios'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


export default function Categories() {

    const [editedCategory, setEditedCategory]=useState(null)
    const [name, setName]=useState('')
    const [parentCategory, setParentCategory] = useState('')
    const [categories, setCategories] = useState([])
    const [properties, setProperties] = useState([])
    
    //Get categories on page load
    useEffect(()=>{
       fetchCategories()
    },[])

    //Get categories from API end point
    function fetchCategories() {
        axios.get('/api/categories').then(result =>{
            setCategories(result.data)
        })
    }

    //Save category
    async function saveCategory(ev){
        ev.preventDefault()
        const data = {name,parentCategory}

        if(editedCategory){
            await axios.put('/api/categories',{...data,_id:editedCategory._id})
            setEditedCategory(null)
        } else {
            await axios.post('/api/categories',data)         
        }

        setName('')
        fetchCategories()
        
    }

    //edit category
    function editCategory(category){
        setEditedCategory(category)
        setName(category.name)
        setParentCategory(category.parent?._id)

    }


    //Delete Catergory confirm pop up
    const MySwal = withReactContent(Swal)

    function deleteCategory(category){
       
        MySwal.fire({
            title: <p>Are you sure?</p>,
            text: `Do you want to delete ${category.name}?`,
            showCancelButton:true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Delete',
            confirmButtonColor: '#d55'
          }).then(async result => {
                if (result.isConfirmed){
                    await axios.delete('/api/categories?_id='+ category._id)
                    fetchCategories()
                }
          })
    }

    //Add property
    function addProperty(){
        setProperties(prev=>{
            return [...prev, {name:'',values:''}]
        })
    }

    function handleProperyNameChange(property) {

    }


    return (
        <Layout>
            <h1>Categories</h1>
            <label>{editedCategory ? `Edit Category ${editedCategory.name}` : 'Create New Category'}</label>
            <form onSubmit={saveCategory}>

                <div className="flex gap-1">
                    <input type="text" placeholder="Category Name" value={name} onChange={ev => setName(ev.target.value)}/>
                    <select  value={parentCategory} onChange={ev=>setParentCategory(ev.target.value)}>
                        <option value="">No Parent Category</option>

                        {categories.length > 0 && categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name}</option>
                        ))}

                    </select>
                </div>

                <div className="mb-2">
                    <label className="block">Properties</label>
                    <button type="button" className="btn-default text-sm" onClick={addProperty}>Add new property</button>
                    {properties.length >0 && properties.map(property => (
                        <div className="flex gap-1">
                            <input type="text" placeholder="property name (example: colour)" value={property.name} onChange={()=>{handlePropertyNameChange(property)}}/>
                            <input type="text" placeholder="values, comma seperated" value={property.values}/>
                        </div>
                    ))}
                </div>
                
                <button type="submit" className="btn-primary py-1">Save</button>
            </form> 

            <table className="basic mt-4">
                <thead>
                    <tr>
                        <td>Category Name</td>
                        <td>Parent Category</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 && categories.map(category => (
                        <tr>
                            <td>{category.name}</td>
                            <td>{category?.parent?.name}</td>
                            <td>                              
                                    <button className="btn-primary mr-1" onClick={()=>editCategory(category)}>Edit</button>
                                    <button className="btn-primary" onClick={()=>deleteCategory(category)}>Delete</button>                               
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
    
           
        </Layout>
    )

}