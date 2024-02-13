import '@/app/globals.css';
import LoyoutIntranet from '@/components/LoyoutIntranet';
import { verifUser } from '@/helpers/verifUser';
import React, { useEffect, useReducer, useState } from 'react'
import workSpace from '@/img/categories.png';
import BanerModule from '@/components/BanerModule';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { InputSearch } from '@/components/Inputs';
import { ButtonPrimary } from '@/components/Buttons';
import TableCategorie from '@/components/categories/TableCategorie';
import apiAxios from '@/axios';
import { TYPES_CATEGORIES, categoriesInitialState, reducerCategories } from '@/reducers/crudCategories';
import { useRouter } from 'next/navigation';
import PaginationTable from '@/components/PaginationTable';
import FormCategorie from '@/components/categories/FormCategorie';
import { useModal } from '@/hooks/useModal';
import { getCookie } from '@/helpers/getCookie';

export async function getServerSideProps(context) {
    const userCookie = context.req.cookies;
    return await verifUser(userCookie,'/categories');
}
const quantityRowData = 25;
function categories({dataModules,nameUser,dataRoles}) {
    const [state,dispatch] = useReducer(reducerCategories,categoriesInitialState);
    const route = useRouter();
    const headers = getCookie();
    const [dataChange,setDataChange] = useState({current:1,search:"",reload:false});
    const [pagination,setPagination] = useState({quantityRowData,totalPages:0});
    const {modal,handleOpenModal,handleCloseModal} = useModal("hidden");
    useEffect(()=>{
        const getData = async () => {
            try {
                const resp = await apiAxios.get('/categorie',{
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
                    totalPages:resp.data.totalCategories
                })
                dispatch({type:TYPES_CATEGORIES.ALL_CATEGORIES,payload:resp.data.data});
            } catch (error) {
                dispatch({type:TYPES_CATEGORIES.NO_CATEGORIES});
                console.log(error);
            }
        }
        getData();
    },[dataChange])
    const openModalNew = () => {
        handleOpenModal();
    }
    let timer;
    const searchCategories = (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setDataChange({...dataChange,current:1,search:e.target.value});
        }, 500);
    }
    const getCategorie = async (idUser) => {
        try {
            const resp = await apiAxios.get(`/categorie/${idUser}`,{headers});
            if(resp.data.redirect !== null){
                return route.replace(resp.data.redirect);
            }
            if(resp.data.error){
                return alert(resp.data.message);
            }
            dispatch({
                type:TYPES_CATEGORIES.GET_CATEGORIE,
                payload:{
                    categorie:resp.data.data.categorie,
                    subcategories:resp.data.data.subcategories
                }
            });
            handleOpenModal();
        } catch (error) {
            dispatch({type:TYPES_USER.NO_USERS});
            console.log(error);
        }
    }
    const deleteCategorie = async (idCategorie) => {
        if(!window.confirm("¿Deseas eliminar esta categoría?")){
            return
        }
        try {
            const resp = await apiAxios.delete(`/categorie/${idCategorie}`,{headers});
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
            dispatch({type:TYPES_CATEGORIES.NO_CATEGORIES});
        }
    }
    const handleChangePage = (number)=>{
        if(!number){
          return
        }
        setDataChange({...dataChange,current:number});
    }
    const closeModal = async () => {
        dispatch({type:TYPES_CATEGORIES.RESET_EDIT});
        handleCloseModal();
    }
    const saveCategorie = async (form,subcategories) => {
        try {
            const resp = form.id ? await apiAxios.put(`/categorie/${form.id}`,{...form,subcategories},{headers}) : await apiAxios.post('/categorie',{...form,subcategories},{headers});
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
            dispatch({type:TYPES_CATEGORIES.NO_CATEGORIES});
        }
    }
  return (
    <>
    <LoyoutIntranet title="Categorias" description="Administración de categorías" names={nameUser} modules={dataModules} roles={dataRoles}>
        <BanerModule imageBanner={workSpace} title="Administración de categorías"/>
        <div className='w-full p-6 bg-white rounded-md shadow overflow-x-auto'>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <ButtonPrimary text="Agregar" icon={<PlusCircleIcon className='w-5 h-5'/>} onClick={e => openModalNew()}/>
                <div style={{width:"300px"}}>
                    <InputSearch placeholder='¿Que estas buscando?' onInput={searchCategories}/>
                </div>
            </div>
            <TableCategorie categories={state.categories} getCategorie={getCategorie} deleteCategorie={deleteCategorie}/>
            <PaginationTable currentPage={dataChange.current} quantityRow={pagination.quantityRowData} totalData={pagination.totalPages} handleChangePage={handleChangePage}/>
        </div>
    </LoyoutIntranet>
    <FormCategorie statusModal={modal} categorieEdit={state.categorieEdit} closeModal={closeModal} subCategoriesEdit={state.subcategoriesEdit} handleSave={saveCategorie}/>
    </>
  )
}

export default categories