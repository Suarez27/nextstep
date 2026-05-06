const ES_MESSAGES = {
    ra: {
        action: {
            add_filter: 'Anadir filtro',
            add: 'Anadir',
            back: 'Volver',
            bulk_actions: '1 seleccionada |||| %{smart_count} seleccionadas',
            cancel: 'Cancelar',
            clear_array_input: 'Vaciar lista',
            clear_input_value: 'Limpiar',
            clone: 'Clonar',
            confirm: 'Confirmar',
            create: 'Crear',
            delete: 'Eliminar',
            edit: 'Editar',
            export: 'Exportar',
            list: 'Listado',
            refresh: 'Actualizar',
            remove_filter: 'Quitar filtro',
            remove_all_filters: 'Quitar todos los filtros',
            remove: 'Quitar',
            save: 'Guardar',
            search: 'Buscar',
            select_all: 'Seleccionar todo',
            select_row: 'Seleccionar fila',
            show: 'Ver',
            sort: 'Ordenar',
            undo: 'Deshacer',
            unselect: 'Deseleccionar',
            expand: 'Expandir',
            close: 'Cerrar',
            open_menu: 'Abrir menu',
            close_menu: 'Cerrar menu',
            update: 'Actualizar',
            move_up: 'Mover arriba',
            move_down: 'Mover abajo',
            open: 'Abrir',
            toggle_theme: 'Cambiar tema',
            select_columns: 'Seleccionar columnas',
            update_application: 'Actualizar aplicacion',
        },
        page: {
            create: 'Crear %{name}',
            dashboard: 'Panel',
            edit: '%{name} #%{id}',
            error: 'Algo salio mal',
            list: '%{name}',
            loading: 'Cargando',
            not_found: 'No encontrado',
            show: '%{name} #%{id}',
            empty: 'Sin datos',
        },
        input: {
            file: {
                upload_several: 'Suelta archivos para subir, o haz clic para seleccionar.',
                upload_single: 'Suelta un archivo para subir, o haz clic para seleccionar.',
            },
            image: {
                upload_several: 'Suelta imagenes para subir, o haz clic para seleccionar.',
                upload_single: 'Suelta una imagen para subir, o haz clic para seleccionar.',
            },
            references: {
                all_missing: 'No se pudieron cargar los datos relacionados.',
                many_missing:
                    'Al menos una referencia relacionada no existe.',
                single_missing:
                    'La referencia relacionada ya no esta disponible.',
            },
            password: {
                toggle_visible: 'Mostrar contrasena',
                toggle_hidden: 'Ocultar contrasena',
            },
        },
        message: {
            about: 'Acerca de',
            are_you_sure: 'Estas seguro?',
            auth_error: 'Error de autenticacion',
            bulk_delete_content: 'Estas seguro de eliminar este elemento? |||| Estas seguro de eliminar estos %{smart_count} elementos?',
            bulk_delete_title: 'Eliminar %{name} |||| Eliminar %{smart_count} %{name}',
            bulk_update_content: 'Estas seguro de actualizar este elemento? |||| Estas seguro de actualizar estos %{smart_count} elementos?',
            bulk_update_title: 'Actualizar %{name} |||| Actualizar %{smart_count} %{name}',
            clear_array_input: 'Estas seguro de vaciar toda la lista?',
            delete_content: 'Estas seguro de eliminar este elemento?',
            delete_title: 'Eliminar %{name} #%{id}',
            details: 'Detalles',
            error: 'Error del servidor y no se pudo completar tu accion.',
            invalid_form: 'El formulario tiene errores. Revisa los campos marcados.',
            loading: 'Cargando, espera un momento',
            no: 'No',
            not_found: 'Has escrito una URL incorrecta o seguido un enlace roto.',
            yes: 'Si',
            unsaved_changes: 'Algunos cambios no se guardaron. Seguro que quieres salir?',
        },
        navigation: {
            no_results: 'Sin resultados',
            no_more_results: 'La pagina %{page} esta fuera de rango. Prueba la anterior.',
            page_out_of_boundaries: 'Pagina %{page} fuera de rango',
            page_out_from_end: 'No puedes ir despues de la ultima pagina',
            page_out_from_begin: 'No puedes ir antes de la pagina 1',
            page_range_info: '%{offsetBegin}-%{offsetEnd} de %{total}',
            partial_page_range_info: '%{offsetBegin}-%{offsetEnd} de mas de %{offsetEnd}',
            current_page: 'Pagina %{page}',
            page: 'Ir a la pagina %{page}',
            first: 'Primera pagina',
            last: 'Ultima pagina',
            next: 'Siguiente pagina',
            previous: 'Pagina anterior',
            skip_nav: 'Ir al contenido',
        },
        sort: {
            sort_by: 'Ordenar por %{field} %{order}',
            ASC: 'ascendente',
            DESC: 'descendente',
        },
        validation: {
            required: 'Obligatorio',
            minLength: 'Debe tener al menos %{min} caracteres',
            maxLength: 'Debe tener %{max} caracteres o menos',
            minValue: 'Debe ser mayor o igual a %{min}',
            maxValue: 'Debe ser menor o igual a %{max}',
            number: 'Debe ser un numero',
            email: 'Debe ser un correo valido',
            oneOf: 'Debe ser uno de: %{options}',
            regex: 'Formato invalido',
            unique: 'Debe ser unico',
        },
        auth: {
            auth_check_error: 'Inicia sesion para continuar',
            user_menu: 'Perfil',
            username: 'Usuario',
            password: 'Contrasena',
            sign_in: 'Iniciar sesion',
            sign_in_error: 'Autenticacion fallida, intentalo otra vez',
            logout: 'Cerrar sesion',
        },
        saved_queries: {
            label: 'Consultas guardadas',
            query_name: 'Nombre de la consulta',
            new_label: 'Guardar consulta actual...',
            new_dialog_title: 'Guardar consulta actual como',
            remove_label: 'Eliminar consulta guardada',
            remove_label_with_name: 'Eliminar consulta "%{name}"',
            remove_dialog_title: 'Eliminar consulta guardada?',
            remove_message: 'Seguro que deseas eliminar esta consulta?',
            help: 'Filtra la lista y guarda esta consulta para usarla despues',
        },
    },
    resources: {},
};

const EN_MESSAGES = {
    ra: {
        action: {
            add_filter: 'Add filter',
            create: 'Create',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            search: 'Search',
            show: 'Show',
            list: 'List',
            refresh: 'Refresh',
            export: 'Export',
            remove_filter: 'Remove filter',
            remove_all_filters: 'Remove all filters',
            select_all: 'Select all',
            select_row: 'Select row',
            sort: 'Sort',
            undo: 'Undo',
        },
        page: {
            dashboard: 'Dashboard',
            loading: 'Loading',
            error: 'Something went wrong',
            not_found: 'Not found',
            list: '%{name}',
            create: 'Create %{name}',
            edit: '%{name} #%{id}',
            show: '%{name} #%{id}',
        },
        navigation: {
            no_results: 'No results found',
            page_range_info: '%{offsetBegin}-%{offsetEnd} of %{total}',
            partial_page_range_info: '%{offsetBegin}-%{offsetEnd} of more than %{offsetEnd}',
            first: 'First page',
            last: 'Last page',
            next: 'Next page',
            previous: 'Previous page',
        },
        auth: {
            sign_in: 'Sign in',
            logout: 'Logout',
        },
        validation: {
            required: 'Required',
            email: 'Must be a valid email',
        },
    },
    resources: {},
};

let currentLocale = 'es';

function getByPath(obj, key) {
    return key.split('.').reduce((acc, part) => (acc && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : undefined), obj);
}

function interpolate(message, options = {}) {
    return String(message).replace(/%\{(\w+)\}/g, (_, key) => {
        if (Object.prototype.hasOwnProperty.call(options, key)) return String(options[key]);
        return `%{${key}}`;
    });
}

const adminI18nProvider = {
    translate: (key, options = {}) => {
        const messages = currentLocale === 'en' ? EN_MESSAGES : ES_MESSAGES;
        const fallback = currentLocale === 'en' ? ES_MESSAGES : EN_MESSAGES;
        const message = getByPath(messages, key) ?? getByPath(fallback, key) ?? options._ ?? key;
        return interpolate(message, options);
    },
    changeLocale: (locale) => {
        currentLocale = locale === 'en' ? 'en' : 'es';
        return Promise.resolve();
    },
    getLocale: () => currentLocale,
};

export default adminI18nProvider;
