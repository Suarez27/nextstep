import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import BusinessIcon from '@mui/icons-material/Business';
import { useEffect } from 'react';
import { Admin, Resource } from 'react-admin';
import adminI18nProvider from '../i18n/adminI18nProvider';
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
    CentersEdit,
    CentersList,
    CentersShow,
} from '../resources/centers';
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
import {
    VerificationAuditsList,
} from '../resources/verification-audits';
import adminTheme from '../theme/adminTheme';
import { useLanguage } from '../../shared/context/LanguageContext';

export default function AdminApp() {
    const { language } = useLanguage();

    useEffect(() => {
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;

        document.documentElement.style.overflow = 'auto';
        document.body.style.overflow = 'auto';

        return () => {
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.body.style.overflow = previousBodyOverflow;
        };
    }, []);

    return (
        <Admin
            basename="/admin"
            dataProvider={dataProvider}
            theme={adminTheme}
            layout={AdminLayout}
            i18nProvider={adminI18nProvider}
            locale={language}
        >
            <Resource
                name="centers"
                list={CentersList}
                edit={CentersEdit}
                show={CentersShow}
                icon={BusinessIcon}
                options={{ label: 'Centros' }}
            />

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
                icon={BusinessIcon}
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

            <Resource
                name="verification-audits"
                list={VerificationAuditsList}
                icon={ChecklistRtlIcon}
                options={{ label: 'Auditoria validaciones' }}
            />
        </Admin>
    );
}
