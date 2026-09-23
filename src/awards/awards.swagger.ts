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

export const get_all_awards_swagger = {
  operation: {
    summary: 'Get all awards',
    description:
      'Retrieve awards, paginated. Supports search by title/description, filtering by year or source, and page/limit query parameters. `count` is the total number of matched awards, not the size of the current page.',
  },
  responses: {
    success: {
      description: 'Awards retrieved successfully',
      schema: {
        example: {
          data: {
            awards: [award_example],
            count: 18,
            page: 1,
            limit: 10,
            totalPages: 2,
          },
          count: 1,
          message: 'Awards retrieved successfully',
        },
      },
    },
  },
};

export const get_award_by_id_swagger = {
  operation: {
    summary: 'Get award by ID',
    description: 'Retrieve a single award by its ID.',
  },
  responses: {
    success: {
      description: 'Award retrieved successfully',
      schema: {
        example: {
          data: award_example,
          count: 1,
          message: 'Award retrieved successfully',
        },
      },
    },
  },
};
