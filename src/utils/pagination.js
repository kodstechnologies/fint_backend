export const getPagination = (req) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

export const getPaginationResponse = ({
    total,
    page,
    limit,
    data,
}) => {
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        pagination: {
            totalRecords: total,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        data,
    };
};
