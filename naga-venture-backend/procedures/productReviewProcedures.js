async function createProductReviewProcedures(knex) {
  // ==================== PRODUCT REVIEWS ====================
  
  // Get all product reviews
  await knex.raw(`
    CREATE PROCEDURE GetAllProductReviews()
    BEGIN
      SELECT pr.*, p.name as product_name, u.email as user_email, 
        o.order_number
      FROM product_review pr 
      LEFT JOIN product p ON pr.product_id = p.id 
      LEFT JOIN user u ON pr.user_id = u.id 
      LEFT JOIN \`order\` o ON pr.order_id = o.id
      ORDER BY pr.created_at DESC;
    END;
  `);

  // Get reviews by product ID
  await knex.raw(`
    CREATE PROCEDURE GetReviewsByProductId(IN p_productId CHAR(36))
    BEGIN
      SELECT pr.*, u.email as user_email, o.order_number
      FROM product_review pr 
      LEFT JOIN user u ON pr.user_id = u.id 
      LEFT JOIN \`order\` o ON pr.order_id = o.id
      WHERE pr.product_id = p_productId AND pr.status = 'active'
      ORDER BY pr.created_at DESC;
    END;
  `);

  // Get reviews by user ID
  await knex.raw(`
    CREATE PROCEDURE GetReviewsByUserId(IN p_userId CHAR(36))
    BEGIN
      SELECT pr.*, p.name as product_name, p.image_url as product_image,
        b.business_name, o.order_number
      FROM product_review pr 
      LEFT JOIN product p ON pr.product_id = p.id 
      LEFT JOIN business b ON p.business_id = b.id
      LEFT JOIN \`order\` o ON pr.order_id = o.id
      WHERE pr.user_id = p_userId
      ORDER BY pr.created_at DESC;
    END;
  `);

  // Get reviews by business ID
  await knex.raw(`
    CREATE PROCEDURE GetReviewsByBusinessId(IN p_businessId CHAR(36))
    BEGIN
      SELECT pr.*, p.name as product_name, u.email as user_email,
        o.order_number
      FROM product_review pr 
      LEFT JOIN product p ON pr.product_id = p.id 
      LEFT JOIN user u ON pr.user_id = u.id 
      LEFT JOIN \`order\` o ON pr.order_id = o.id
      WHERE p.business_id = p_businessId AND pr.status = 'active'
      ORDER BY pr.created_at DESC;
    END;
  `);

  // Get product review by ID
  await knex.raw(`
    CREATE PROCEDURE GetProductReviewById(IN p_reviewId CHAR(36))
    BEGIN
      SELECT pr.*, p.name as product_name, p.image_url as product_image,
        u.email as user_email, b.business_name, o.order_number
      FROM product_review pr 
      LEFT JOIN product p ON pr.product_id = p.id 
      LEFT JOIN user u ON pr.user_id = u.id 
      LEFT JOIN business b ON p.business_id = b.id
      LEFT JOIN \`order\` o ON pr.order_id = o.id
      WHERE pr.id = p_reviewId;
    END;
  `);

  // Insert product review
  await knex.raw(`
    CREATE PROCEDURE InsertProductReview(
      IN p_id CHAR(36),
      IN p_product_id CHAR(36),
      IN p_user_id CHAR(36),
      IN p_order_id CHAR(36),
      IN p_rating TINYINT,
      IN p_review_title VARCHAR(255),
      IN p_review_text TEXT,
      IN p_is_verified_purchase BOOLEAN
    )
    BEGIN
      DECLARE existing_review_count INT DEFAULT 0;
      DECLARE verified_purchase BOOLEAN DEFAULT FALSE;
      
      -- Check if user already reviewed this product
      SELECT COUNT(*) INTO existing_review_count 
      FROM product_review 
      WHERE product_id = p_product_id AND user_id = p_user_id;
      
      IF existing_review_count > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User has already reviewed this product';
      END IF;
      
      -- Verify purchase if order_id provided
      IF p_order_id IS NOT NULL THEN
        SELECT COUNT(*) > 0 INTO verified_purchase
        FROM order_item oi 
        JOIN \`order\` o ON oi.order_id = o.id 
        WHERE o.id = p_order_id AND o.user_id = p_user_id 
          AND oi.product_id = p_product_id AND o.status = 'completed';
      END IF;
      
      SET verified_purchase = COALESCE(p_is_verified_purchase, verified_purchase);
      
      INSERT INTO product_review (
        id, product_id, user_id, order_id, rating, review_title, 
        review_text, is_verified_purchase
      ) VALUES (
        p_id, p_product_id, p_user_id, p_order_id, p_rating, 
        p_review_title, p_review_text, verified_purchase
      );
      
      SELECT pr.*, p.name as product_name, u.email as user_email
      FROM product_review pr 
      LEFT JOIN product p ON pr.product_id = p.id 
      LEFT JOIN user u ON pr.user_id = u.id 
      WHERE pr.id = p_id;
    END;
  `);

  // Update product review
  await knex.raw(`
    CREATE PROCEDURE UpdateProductReview(
      IN p_id CHAR(36),
      IN p_rating TINYINT,
      IN p_review_title VARCHAR(255),
      IN p_review_text TEXT,
      IN p_status ENUM('active', 'hidden', 'flagged')
    )
    BEGIN
      UPDATE product_review SET
        rating = COALESCE(p_rating, rating),
        review_title = COALESCE(p_review_title, review_title),
        review_text = COALESCE(p_review_text, review_text),
        status = COALESCE(p_status, status),
        updated_at = NOW()
      WHERE id = p_id;

      SELECT pr.*, p.name as product_name, u.email as user_email
      FROM product_review pr 
      LEFT JOIN product p ON pr.product_id = p.id 
      LEFT JOIN user u ON pr.user_id = u.id 
      WHERE pr.id = p_id;
    END;
  `);

  // Delete product review
  await knex.raw(`
    CREATE PROCEDURE DeleteProductReview(IN p_reviewId CHAR(36))
    BEGIN
      DELETE FROM product_review WHERE id = p_reviewId;
    END;
  `);

  // Update review status (for moderation)
  await knex.raw(`
    CREATE PROCEDURE UpdateReviewStatus(
      IN p_reviewId CHAR(36),
      IN p_status ENUM('active', 'hidden', 'flagged')
    )
    BEGIN
      UPDATE product_review SET status = p_status, updated_at = NOW() WHERE id = p_reviewId;

      SELECT pr.*, p.name as product_name, u.email as user_email
      FROM product_review pr 
      LEFT JOIN product p ON pr.product_id = p.id 
      LEFT JOIN user u ON pr.user_id = u.id 
      WHERE pr.id = p_reviewId;
    END;
  `);

  // Get product review statistics
  await knex.raw(`
    CREATE PROCEDURE GetProductReviewStats(IN p_productId CHAR(36))
    BEGIN
      -- Review statistics
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN is_verified_purchase = 1 THEN 1 END) as verified_reviews
      FROM product_review 
      WHERE product_id = p_productId AND status = 'active';
      
      -- Recent reviews
      SELECT pr.*, u.email as user_email
      FROM product_review pr 
      LEFT JOIN user u ON pr.user_id = u.id 
      WHERE pr.product_id = p_productId AND pr.status = 'active'
      ORDER BY pr.created_at DESC
      LIMIT 5;
    END;
  `);

  // Get business review statistics
  await knex.raw(`
    CREATE PROCEDURE GetBusinessReviewStats(IN p_businessId CHAR(36))
    BEGIN
      -- Overall statistics
      SELECT 
        COUNT(pr.id) as total_reviews,
        AVG(pr.rating) as average_rating,
        COUNT(CASE WHEN pr.rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN pr.rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN pr.rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN pr.rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN pr.rating = 1 THEN 1 END) as one_star,
        COUNT(CASE WHEN pr.is_verified_purchase = 1 THEN 1 END) as verified_reviews
      FROM product_review pr 
      JOIN product p ON pr.product_id = p.id
      WHERE p.business_id = p_businessId AND pr.status = 'active';
      
      -- Product statistics
      SELECT 
        p.name as product_name,
        COUNT(pr.id) as review_count,
        AVG(pr.rating) as average_rating
      FROM product p
      LEFT JOIN product_review pr ON p.id = pr.product_id AND pr.status = 'active'
      WHERE p.business_id = p_businessId
      GROUP BY p.id, p.name
      HAVING review_count > 0
      ORDER BY average_rating DESC, review_count DESC;
    END;
  `);

  // Check if user can review product
  await knex.raw(`
    CREATE PROCEDURE CanUserReviewProduct(
      IN p_productId CHAR(36),
      IN p_userId CHAR(36)
    )
    BEGIN
      DECLARE existing_review_count INT DEFAULT 0;
      DECLARE purchase_count INT DEFAULT 0;
      DECLARE latest_order_id CHAR(36) DEFAULT NULL;
      
      -- Check if user has already reviewed this product
      SELECT COUNT(*) INTO existing_review_count 
      FROM product_review 
      WHERE product_id = p_productId AND user_id = p_userId;
      
      IF existing_review_count > 0 THEN
        SELECT FALSE as can_review, 'Already reviewed' as reason, NULL as order_id, FALSE as is_verified_purchase;
      ELSE
        -- Check if user has purchased this product
        SELECT COUNT(*), MAX(o.id) INTO purchase_count, latest_order_id
        FROM order_item oi 
        JOIN \`order\` o ON oi.order_id = o.id 
        WHERE o.user_id = p_userId AND oi.product_id = p_productId AND o.status = 'completed';
        
        IF purchase_count = 0 THEN
          SELECT FALSE as can_review, 'No completed purchase' as reason, NULL as order_id, FALSE as is_verified_purchase;
        ELSE
          SELECT TRUE as can_review, NULL as reason, latest_order_id as order_id, TRUE as is_verified_purchase;
        END IF;
      END IF;
    END;
  `);
}

async function dropProductReviewProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllProductReviews;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReviewsByProductId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReviewsByUserId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReviewsByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetProductReviewById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertProductReview;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateProductReview;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteProductReview;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateReviewStatus;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetProductReviewStats;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBusinessReviewStats;");
  await knex.raw("DROP PROCEDURE IF EXISTS CanUserReviewProduct;");
}

export { createProductReviewProcedures, dropProductReviewProcedures };
