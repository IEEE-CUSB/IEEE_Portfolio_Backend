const award_example = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  image_url: 'https://example.com/images/ieee-award.jpg',
  title: 'Best Technical Chapter',
  description: 'Awarded for outstanding chapter performance and activities.',
  years: [2025],
  details: { '2025': '1st place' },
  source: 'GLOBAL',
  won_count: 3,
  created_at: '2026-03-15T10:00:00Z',
  updated_at: '2026-03-15T10:00:00Z',
};

export const admin_create_award_swagger = {
  operation: {
    summary: 'Create award',
    description: 'Create a new award. Admin only.',
  },
  responses: {
    success: {
      description: 'Award created successfully',
      schema: {
        example: {
          data: award_example,
          count: 1,
          message: 'Award created successfully',
        },
      },
    },
  },
};

export const admin_update_award_swagger = {
  operation: {
    summary: 'Update award',
    description: 'Update an existing award. Admin only.',
  },
  responses: {
    success: {
      description: 'Award updated successfully',
      schema: {
        example: {
          data: award_example,
          count: 1,
          message: 'Award updated successfully',
        },
      },
    },
  },
};

export const admin_delete_award_swagger = {
  operation: {
    summary: 'Delete award',
    description: 'Delete an award. Admin only.',
  },
  responses: {
    success: {
      description: 'Award deleted successfully',
      schema: {
        example: {
          data: { message: 'Award deleted successfully' },
          count: 1,
          message: 'Award deleted successfully',
        },
      },
    },
  },
};

export const admin_upload_award_image_swagger = {
  body: {
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  },
  operation: {
    summary: 'Upload award image',
    description: 'Upload or replace award image by award id. Admin only.',
  },
  responses: {
    success: {
      description: 'Award image uploaded successfully',
      schema: {
        example: {
          data: {
            ...award_example,
            image_url: 'https://example.com/images/ieee-award.jpg',
          },
          count: 1,
          message: 'Image uploaded successfully',
        },
      },
    },
  },
};

export const admin_delete_award_image_swagger = {
  operation: {
    summary: 'Delete award image',
    description: 'Delete award image only without deleting award. Admin only.',
  },
  responses: {
    success: {
      description: 'Award image deleted successfully',
      schema: {
        example: {
          data: {
            ...award_example,
            image_url: null,
            image_public_id: null,
          },
          count: 1,
          message: 'Image deleted successfully',
        },
      },
    },
  },
};
