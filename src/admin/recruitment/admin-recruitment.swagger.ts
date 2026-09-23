import { SUCCESS_MESSAGES } from '../../constants/swagger-messages';

const vacancy_example = {
  id: 'v102dadc-0b17-4e83-812b-00103b606a1f',
  title: 'Backend Developer',
  description: 'Develop and maintain backend services.',
  is_open: true,
  created_at: '2025-12-03T10:30:00Z',
  updated_at: '2025-12-03T10:30:00Z',
};

const application_example = {
  id: 'a102dadc-0b17-4e83-812b-00103b606a1f',
  user_id: 'd102dadc-0b17-4e83-812b-00103b606a1f',
  vacancy_id: 'v102dadc-0b17-4e83-812b-00103b606a1f',
  status: 'PENDING',
  extra_data: { why_join: 'I want to learn', portfolio: 'link' },
  created_at: '2025-12-03T10:30:00Z',
  updated_at: '2025-12-03T10:30:00Z',
  user: {
    id: 'd102dadc-0b17-4e83-812b-00103b606a1f',
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane.smith@ieee.org',
    phone: '+201234567890',
    university: 'Cairo University',
    faculty: 'Engineering',
    major: 'Computer Engineering',
    academic_year: 3,
  },
  cv_url: 'https://example.com/a102dadc-0b17-4e83-812b-00103b606a1f/cv',
};

export const admin_create_vacancy_swagger = {
  operation: {
    summary: 'Create a new vacancy',
    description: 'Admins can create a new vacancy.',
  },
  responses: {
    success: {
      description: 'Vacancy successfully created.',
      schema: {
        example: {
          data: vacancy_example,
          count: 1,
          message: SUCCESS_MESSAGES.VACANCY_CREATED,
        },
      },
    },
  },
};

export const admin_update_vacancy_swagger = {
  operation: {
    summary: 'Update a vacancy',
    description: 'Admins can update a vacancy and toggle its is_open status.',
  },
  responses: {
    success: {
      description: 'Vacancy successfully updated.',
      schema: {
        example: {
          data: vacancy_example,
          count: 1,
          message: SUCCESS_MESSAGES.VACANCY_UPDATED,
        },
      },
    },
  },
};

export const admin_get_vacancies_swagger = {
  operation: {
    summary: 'Get all vacancies',
    description:
      'Admins can get all vacancies, both open and closed, paginated. Supports search by title or description, plus page/limit query parameters. `data.count` is the total number of matched vacancies, not the size of the current page.',
  },
  responses: {
    success: {
      description: 'Vacancies successfully retrieved.',
      schema: {
        example: {
          data: {
            vacancies: [vacancy_example],
            count: 12,
            page: 1,
            limit: 10,
            totalPages: 2,
          },
          count: 1,
          message: SUCCESS_MESSAGES.VACANCIES_RETRIEVED,
        },
      },
    },
  },
};

export const admin_get_applications_swagger = {
  operation: {
    summary: 'Get applications for a specific vacancy',
    description:
      'Admins can get a paginated list of applications for a specific vacancy, optionally filtered by date range and searched by applicant name, email, or university.',
  },
  responses: {
    success: {
      description: 'Applications successfully retrieved.',
      schema: {
        example: {
          data: {
            data: [application_example],
            total: 50,
            page: 1,
            limit: 10,
            totalPages: 5,
          },
          count: 1,
          message: SUCCESS_MESSAGES.APPLICATIONS_RETRIEVED,
        },
      },
    },
  },
};

export const admin_update_application_status_swagger = {
  operation: {
    summary: 'Accept or reject an application',
    description:
      'Admins can accept or reject a PENDING application. The applicant is emailed the decision automatically. A decision is final: an application that was already accepted or rejected cannot be changed (400).',
  },
  responses: {
    success: {
      description: 'Application status successfully updated.',
      schema: {
        example: {
          data: {
            ...application_example,
            status: 'ACCEPTED',
          },
          count: 1,
          message: SUCCESS_MESSAGES.APPLICATION_STATUS_UPDATED,
        },
      },
    },
  },
};

export const admin_export_applications_swagger = {
  operation: {
    summary: 'Export applications as Excel',
    description:
      'Admins can export applications for a specific vacancy to an Excel sheet.',
  },
  responses: {
    success: {
      description: 'Excel file exported successfully.',
      schema: {
        type: 'string',
        format: 'binary',
      },
      headers: {
        'Content-Type': {
          description:
            'The MIME type of the file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)',
          schema: { type: 'string' },
        },
        'Content-Disposition': {
          description:
            'Standard header indicating an attachment with a file name',
          schema: { type: 'string' },
        },
      },
    },
  },
};

export const admin_delete_vacancy_swagger = {
  operation: {
    summary: 'Delete a vacancy',
    description: 'Admins can delete a vacancy and all associated applications.',
  },
  responses: {
    success: {
      description: 'Vacancy successfully deleted.',
      schema: {
        example: {
          data: { success: true },
          count: 1,
          message: SUCCESS_MESSAGES.VACANCY_DELETED,
        },
      },
    },
  },
};

export const admin_view_application_cv_swagger = {
  operation: {
    summary: 'View application CV',
    description: 'Stream the CV file directly to the browser.',
  },
  responses: {
    success: {
      description: 'The CV file buffer.',
      content: {
        'application/pdf': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  },
};
