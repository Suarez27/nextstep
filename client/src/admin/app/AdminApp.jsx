import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import ListAltIcon from '@mui/icons-material/ListAlt';
import WorkIcon from '@mui/icons-material/Work';
import { Admin, Resource } from 'react-admin';
import { dataProvider } from '../dataProvider';
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
            <Resource
                name="catalogs"
                list={CatalogsList}
                create={CatalogsCreate}
                edit={CatalogsEdit}
                show={CatalogsShow}
                icon={CategoryIcon}
                options={{ label: 'Catalogos' }}
            />

            <Resource
                name="catalog-items"
                list={CatalogItemsList}
                create={CatalogItemsCreate}
                edit={CatalogItemsEdit}
                show={CatalogItemsShow}
                icon={ListAltIcon}
                options={{ label: 'Catalog Items' }}
            />
        </Admin>
    );
}
