import ApartmentIcon from '@mui/icons-material/Apartment';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import WorkIcon from '@mui/icons-material/Work';
import { Admin, Resource } from 'react-admin';
import { dataProvider } from '../dataProvider';
import AdminLayout from '../layout/AdminLayout';
import {
    CatalogItemsCreate,
    CatalogItemsEdit,
    CatalogItemsList,
    CatalogItemsShow,
} from '../resources/catalog-items';
import {
    CatalogsCreate,
    CatalogsEdit,
    CatalogsList,
    CatalogsShow,
} from '../resources/catalogs';
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
import adminTheme from '../theme/adminTheme';

export default function AdminApp() {
    return (
        <Admin basename="/admin" dataProvider={dataProvider} theme={adminTheme} layout={AdminLayout}>
            <Resource
                name="companies"
                list={CompaniesList}
                create={CompaniesCreate}
                edit={CompaniesEdit}
                show={CompaniesShow}
                icon={ApartmentIcon}
                options={{ label: 'Empresas' }}
            />

            <Resource
                name="internships"
                list={InternshipsList}
                create={InternshipsCreate}
                edit={InternshipsEdit}
                show={InternshipsShow}
                icon={WorkIcon}
                options={{ label: 'Practicas' }}
            />

            <Resource
                name="catalogs"
                list={CatalogsList}
                create={CatalogsCreate}
                edit={CatalogsEdit}
                show={CatalogsShow}
                icon={AutoStoriesIcon}
                options={{ label: 'Catalogos' }}
            />

            <Resource
                name="catalog-items"
                list={CatalogItemsList}
                create={CatalogItemsCreate}
                edit={CatalogItemsEdit}
                show={CatalogItemsShow}
                icon={ChecklistRtlIcon}
                options={{ label: 'Items de catalogo' }}
            />
        </Admin>
    );
}
