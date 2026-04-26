import {
    DEFAULT_ADMIN_INTERNSHIP_STATUS,
    INTERNSHIP_STATUS_CHOICES,
} from '../../../shared/config/internships';

export const internshipStatusChoices = INTERNSHIP_STATUS_CHOICES;

export const internshipDefaultValues = {
    status: DEFAULT_ADMIN_INTERNSHIP_STATUS,
    is_active: true,
    slots: 1,
};

export const areaReferenceProps = {
    reference: 'catalog-items',
    filter: { catalog_key: 'areas', is_active: true },
    perPage: 100,
    sort: { field: 'label', order: 'ASC' },
};

export const companyReferenceProps = {
    reference: 'companies',
    filter: { is_active: true },
    perPage: 100,
    sort: { field: 'company_name', order: 'ASC' },
};
