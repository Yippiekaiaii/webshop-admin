
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
        const data = {name,parentCategory,properties:properties.map(p => ({
                        name:p.name,
                        values:p.values.split(',')
                    }))}

        if(editedCategory){
            await axios.put('/api/categories',{...data,_id:editedCategory._id})
            setEditedCategory(null)
        } else {
            await axios.post('/api/categories',data)         
        }
        setName('')
        setParentCategory('')
        setProperties([])
        fetchCategories()        
    }

    //edit category
    function editCategory(category){
        setEditedCategory(category)
        setName(category.name)
        setParentCategory(category.parent?._id)
        setProperties(category.properties.map(({name,values}) => ({
            name, 
            values: values.join(',')
        }))
        )
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
    
    //On property name change
    function handlePropertyNameChange(index,property,newName) {
        setProperties(prev => {
            const properties = [...prev]
            properties[index].name = newName
            return properties
        })
    }

    //On property value change
    function handlePropertyvaluesChange(index,property,newValues) {
        setProperties(prev => {
            const properties = [...prev]
            properties[index].values = newValues
            return properties
        })
    }

    //Remove a property
    function removeProperty(indexToRemove) {
        setProperties(prev => {
            return [...prev].filter((p,pIndex)=>{
                //If it does not match the indexToRemove then keep in the array
                return pIndex !== indexToRemove
            })        
        })        
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
                    <button type="button" className="btn-default text-sm mb-2" onClick={addProperty}>Add new property</button>
                    {properties.length >0 && properties.map((property,index) => (
                        <div className="flex gap-1 mb-2">
                            <input type="text" className="mb-0" placeholder="property name (example: colour)" value={property.name} onChange={ev=>{handlePropertyNameChange(index,property,ev.target.value)}}/>
                            <input type="text" className="mb-0" placeholder="values, comma seperated" value={property.values} onChange={ev => handlePropertyvaluesChange(index,property,ev.target.value)}/>
                            <button type="button" className="btn-default" onClick={ev=>(removeProperty(index))}>Remove</button>
                        </div>
                    ))}
                </div>
                
                <div className="flex gap-1">
                    <button type="submit" className="btn-primary py-1">Save</button>
                    {editedCategory && (
                    <button type="button" className="btn-default" onClick={()=>{
                                setEditedCategory(null) 
                                setName('') 
                                setParentCategory('')
                                setProperties([])
                    }}>Cancel</button>
                    )}
                </div>
                
            </form> 

            {!editedCategory && (
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
            )}

        </Layout>
    )

}