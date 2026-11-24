import { HttpStatus } from '@nestjs/common';

import { SUCCESS_MESSAGES } from '../constants/swagger-messages';

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
};

export const export_shared_applications_swagger = {
  operation: {
    summary: 'Export shared vacancy applications as Excel',
    description:
      'Public, read-only. Uses the share token created by an admin (valid 7 days) instead of an account. Exports every applicant for the one vacancy the token was issued for: one row per applicant, with personal info, contact info, status, CV link, and one column per application question. No filters.',
  },
  responses: {
    success: {
      status: HttpStatus.OK,
      description: 'Excel file exported successfully.',
      schema: { type: 'string', format: 'binary' },
      headers: {
        'Content-Type': {
          description:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          schema: { type: 'string' },
        },
        'Content-Disposition': {
          description: 'Attachment with the generated .xlsx filename',
          schema: { type: 'string' },
        },
      },
    },
  },
};

export const get_open_vacancies_swagger = {
  operation: {
    summary: 'Get all open vacancies',
    description:
      'Retrieve all open vacancies. Supports search by title or description.',
  },
  responses: {
    success: {
      status: HttpStatus.OK,
      description: 'Successfully retrieved open vacancies.',
      schema: {
        example: {
          data: [vacancy_example],
          count: 1,
          message: SUCCESS_MESSAGES.VACANCIES_RETRIEVED,
        },
      },
    },
  },
};

export const apply_to_vacancy_swagger = {
  operation: { summary: 'Apply to a specific vacancy' },
  responses: {
    success: {
      status: HttpStatus.CREATED,
      description: 'Successfully applied to the vacancy.',
      schema: {
        example: {
          data: application_example,
          count: 1,
          message: SUCCESS_MESSAGES.APPLICATION_CREATED,
        },
      },
    },
  },
};

export const get_my_applications_swagger = {
  operation: { summary: 'Get the authenticated user applications' },
  responses: {
    success: {
      status: HttpStatus.OK,
      description: 'Successfully retrieved applications.',
      schema: {
        example: {
          data: [application_example],
          count: 1,
          message: SUCCESS_MESSAGES.APPLICATIONS_RETRIEVED,
        },
      },
    },
  },
};

export const revoke_application_swagger = {
  operation: { summary: 'Revoke (delete) an application' },
  responses: {
    success: {
      status: HttpStatus.OK,
      description: 'Successfully deleted the application.',
      schema: {
        example: {
          data: { success: true },
          count: 1,
          message: SUCCESS_MESSAGES.APPLICATION_DELETED,
        },
      },
    },
  },
};
