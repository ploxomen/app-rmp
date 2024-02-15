import '@/app/globals.css';
import apiAxios from '@/axios';
import BanerModule from '@/components/BanerModule';
import { ButtonPrimary } from '@/components/Buttons';
import { InputSearch } from '@/components/Inputs';
import LoyoutIntranet from '@/components/LoyoutIntranet';
import PaginationTable from '@/components/PaginationTable';
import FormProduct from '@/components/products/FormProduct';
import TableProduct from '@/components/products/TableProduct';
import { getCookie } from '@/helpers/getCookie';
import { verifUser } from '@/helpers/verifUser';
import { useModal } from '@/hooks/useModal';
import workSpace from '@/img/delivery-box.png';
import { TYPES_PRODUCTS, initialStateProduct, reducerProducts } from '@/reducers/crudProducts';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import React, { useEffect, useReducer, useState } from 'react'
const quantityRowData = 25;
export async function getServerSideProps(context) {
  const userCookie = context.req.cookies;
  return await verifUser(userCookie,'/products');
}
function products({dataModules,nameUser,dataRoles}) {
  const [state,dispatch] = useReducer(reducerProducts,initialStateProduct);
  const route = useRouter();
  const headers = getCookie();
  const [dataChange,setDataChange] = useState({current:1,search:"",reload:false});
  const [pagination,setPagination] = useState({quantityRowData,totalPages:0});
  const {modal,handleOpenModal,handleCloseModal} = useModal("hidden");
  useEffect(()=>{
    const getData = async () => {
        try {
            const resq = await apiAxios.get('product-categorie',{headers});
            dispatch({
                type:TYPES_PRODUCTS.ALL_CATEGORIES,
                payload:resq.data.data
            });
        } catch (error) {
          dispatch({type:TYPES_PRODUCTS.NO_PRODUCTS});
          alert('Error al obtener las categorías');
        }
    }
    getData();
  },[])
  useEffect(()=>{
    const getData = async () => {
        try {
            const resp = await apiAxios.get('/product',{
                headers,
                params:{
                    show:pagination.quantityRowData,
                    page:dataChange.current,
                    search:dataChange.search                      
                }
            });
            if(resp.data.redirect !== null){
                return route.replace(resp.data.redirect);
            }
            setPagination({
                ...pagination,
                totalPages:resp.data.totalProducts
            })
            dispatch({type:TYPES_PRODUCTS.ALL_PRODUCTS,payload:resp.data.data});
        } catch (error) {
            dispatch({type:TYPES_PRODUCTS.NO_PRODUCTS});
            console.log(error);
        }
    }
    getData();
  },[dataChange])
  const closeModal = async () => {
    document.querySelector("#upload-file").value = '';
    dispatch({type:TYPES_PRODUCTS.RESET_EDIT});
    handleCloseModal();
  }
  const saveProduct = async (data) => {
    try {
        const headerApi = {
          headers: {
              "Content-Type":"multipart/form-data",
              ...headers
          }
        }
        const resp = !data.has('id') ? await apiAxios.post('/product',data,headerApi) : await apiAxios.post('/product/' + data.get('id'),data,headerApi);
        if(resp.data.redirect !== null){
          return route.replace(resp.data.redirect);
        }
        if(resp.data.error){
            resp.data.data.forEach(error => {
                alert(error);
            });
            return
        }
        setDataChange({
            ...dataChange,
            reload:!dataChange.reload
        })
        alert(resp.data.message);
        closeModal();
    } catch (error) {
        console.log(error);
        alert("Ocurrió un error");
    }
  }
  const getProduct = async (idProduct) => {
    try {
      const resp = await apiAxios.get(`/product/${idProduct}`,{headers});
        if(resp.data.redirect !== null){
            return route.replace(resp.data.redirect);
        }
        if(resp.data.error){
            return alert(resp.data.message);
        }
        dispatch({
            type:TYPES_PRODUCTS.GET_PRODUCT,
            payload:{
                product:resp.data.data.product,
                url:resp.data.data.url,
                subcategories:resp.data.data.subcategories,
                categorieId:resp.data.data.categorieId
            }
        });
        handleOpenModal();
    } catch (error) {
        dispatch({type:TYPES_PRODUCTS.NO_PRODUCTS});
        console.log(error);
    }
  }
  let timer = null;
  const searchCustomer = (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      setDataChange({...dataChange,current:1,search:e.target.value});
    }, 500);
  }
  const handleChangePage = (number)=>{
    if(!number){
      return
    }
    setDataChange({...dataChange,current:number});
  }
  const deleteProduct = async (idProduct) => {
    if(!window.confirm("¿Deseas eliminar este producto?")){
        return
    }
    try {
        const resp = await apiAxios.delete(`/product/${idProduct}`,{headers});
        if(resp.data.redirect !== null){
            return route.replace(resp.data.redirect);
        }
        if(resp.data.error){
            return alert(resp.data.message);
        }
        setDataChange({
            ...dataChange,
            reload:!dataChange.reload
        })
        alert(resp.data.message);
    } catch (error) {
        alert('Error al eliminar el producto');
        dispatch({type:TYPES_PRODUCTS.NO_PRODUCTS});
    }
  }
  return (
    <>
    <LoyoutIntranet title="Productos" description="Administracion de productos" names={nameUser} modules={dataModules} roles={dataRoles}>
          <BanerModule imageBanner={workSpace} title="Administración de productos"/>
          <div className='w-full p-6 bg-white rounded-md shadow overflow-x-auto'>
            <div className="flex w-full items-center justify-between gap-2 flex-wrap mb-2">
              <div>
                <ButtonPrimary text="Agregar" icon={<PlusCircleIcon className='w-5 h-5'/>} onClick={handleOpenModal}/>
              </div>
              <div style={{width:"300px"}}>
                <InputSearch placeholder='¿Que estas buscando?' onInput={searchCustomer}/>
              </div>
            </div>
            <TableProduct products={state.products} getProduct={getProduct} deleteProduct={deleteProduct}/>
            <PaginationTable currentPage={dataChange.current} quantityRow={pagination.quantityRowData} totalData={pagination.totalPages} handleChangePage={handleChangePage}/>
          </div>
      </LoyoutIntranet>
      <FormProduct categories={state.categories} statusModal={modal} closeModal={closeModal} handleSave={saveProduct} productEdit={state.productEdit} subcategoriesData={state.subcategories}/>
    </>
  )
}

export default products