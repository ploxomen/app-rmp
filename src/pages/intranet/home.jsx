import '@/app/globals.css';
import apiAxios from '@/axios';
import CartHome from '@/components/CartHome';
import LoyoutIntranet from '@/components/LoyoutIntranet';
import { DocumentChartBarIcon, DocumentCheckIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/solid';
export async function getServerSideProps(context) {
    const userCookie = context.req.cookies;
    if(!userCookie.authenticate){
        return {
            redirect : {
                destination: '/account/login',
                permanent:false
            }
        }
    }
    const contentCookieUser = JSON.parse(userCookie.authenticate);
    const headers = {
        'Authorization':'Bearer ' + contentCookieUser.access_token
    }
    let dataModules = [];
    let dataRoles = [];
    try {
      const req = await apiAxios.get('/user/modules-roles',{headers});
      dataModules = req.data.modules;
      dataRoles = req.data.roles;
      return {
          props:{dataModules,dataRoles,nameUser:contentCookieUser.user.user_name}
      }
    } catch (error) {
      console.error(error);
      console.log(error)
    }
    return {
        props:{}
    }
}
export default function Home({dataModules,dataRoles,nameUser}){
    return(
        <LoyoutIntranet title="Inicio" description="Inicio de la intranet" names={nameUser} modules={dataModules} roles={dataRoles}>
            <div className='grid grid-cols-4 gap-4 mb-6'>
                <CartHome title="Clientes" quantity="150" backgroundIcon="bg-violet-200" Icon={UserGroupIcon} colorIcon="text-violet-500"/>
                <CartHome title="Cotizaciones" quantity="150" backgroundIcon="bg-yellow-200" Icon={DocumentChartBarIcon} colorIcon="text-yellow-500"/>
                <CartHome title="Cotizaciones aprobadas" quantity="150" backgroundIcon="bg-green-200" Icon={DocumentCheckIcon} colorIcon="text-green-500"/>
                <CartHome title="Usuarios" quantity="150" backgroundIcon="bg-orange-200" Icon={UserIcon} colorIcon="text-orange-500"/>
            </div>
            <div className='p-6 bg-white rounded-md shadow'>
                <h1>Graficos</h1>
            </div>
        </LoyoutIntranet>
    )
}