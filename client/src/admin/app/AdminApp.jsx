import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import { Admin, Resource } from 'react-admin';
import { dataProvider } from '../dataProvider';
import {
    CompaniesCreate,
    CompaniesEdit,
    CompaniesList,
    CompaniesShow,
} from '../resources/companies';
import {
    InternshipsCreate,
    InternshipsEdit,
    InternshipsList,
    InternshipsShow,
} from '../resources/internships';

export default function AdminApp() {
    return (
        <Admin basename="/admin" dataProvider={dataProvider}>
            <Resource
                name="companies"
                list={CompaniesList}
                create={CompaniesCreate}
                edit={CompaniesEdit}
                show={CompaniesShow}
                icon={BusinessIcon}
                options={{ label: 'Empresas' }}
            />

            <Resource
                name="internships"
                list={InternshipsList}
                create={InternshipsCreate}
                edit={InternshipsEdit}
                show={InternshipsShow}
                icon={WorkIcon}
                options={{ label: 'Prácticas' }}
            />
        </Admin>
    );
}