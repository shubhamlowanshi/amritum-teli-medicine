// import searchService from './search.service.js';



/**
 * @swagger
 * /api/v1/search/doctors:
 *   get:
 *     summary: Search doctors with filters
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Text search (specialization, bio, qualification)
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: maxFee
 *         schema:
 *           type: number
 *         description: Maximum consultation fee
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Doctors searched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Doctors searched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     doctors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Doctor'
 *                     pagination:
 *                       type: object
 *                     filters:
 *                       type: object
 */

export const searchDoctors = async (req, res, next) => {
  try {
    const result = await searchService.searchDoctors(req.query);

    res.status(200).json({
      success: true,
      message: 'Doctors searched successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const searchDoctorsByLocation = async (req, res, next) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      const error = new Error('Longitude and latitude are required');
      error.code = 'VALIDATION_ERROR';
      error.status = 400;
      throw error;
    }

    const result = await searchService.searchDoctorsByLocation(
      longitude,
      latitude,
      Number(maxDistance),
      req.query
    );

    res.status(200).json({
      success: true,
      message: 'Nearby doctors found successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};